import { Router } from 'express';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';
import { Logger } from '../utils/logger';
import { prisma } from '../db';
import fs from 'fs';
import path from 'path';

const router = Router();

// Get policies based on role and user
// RULE: Internal policy visible only to: Farmer, Selected Insurer, Admin
// RULE: External policy visible to: Farmer, Insurer, Admin
router.get('/policies', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { role, userId } = req;
    const where: Record<string, any> = {};

    if (role === 'FARMER') {
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      // Farmer sees all their policies (internal and external)
      where.farmerId = userId;
    } else if (role === 'INSURER' && userId) {
      const insurer = await prisma.insurer.findUnique({ where: { userId } });
      if (insurer) {
        // Insurer only sees policies they issued (internal) OR external policies belonging to them
        where.insurerId = insurer.id;
      } else {
        return res.json([]);
      }
    }
    // Admin can see all policies (no filter)

    const policies = await prisma.policy.findMany({
      where,
      include: {
        farmer: { select: { name: true } },
        insurer: { select: { name: true } },
      },
    });

    // Map id to _id for frontend compatibility
    const mappedPolicies = policies.map(policy => ({
      ...policy,
      _id: policy.id,
      id: policy.id,
    }));

    res.json(mappedPolicies);
  } catch (error: any) {
    // Properly serialize error for logging
    const errorDetails = {
      message: error?.message || String(error),
      stack: error?.stack,
      name: error?.name,
      code: error?.code,
    };
    Logger.error('Error fetching policies', {
      error: errorDetails,
      role: req.role,
      userId: req.userId
    });
    res.status(500).json({
      message: 'Server error while fetching policies',
      error: process.env.NODE_ENV === 'development' ? errorDetails : undefined
    });
  }
});

// Alias route for farmer policies (includes internal policies, external policies, and pending requests)
router.get('/farmer/policies', authenticateToken, authorizeRoles(['FARMER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const farmerId = req.userId;
    const now = new Date();

    // 1. Fetch all Policies (internal and external)
    const policies = await prisma.policy.findMany({
      where: { farmerId },
      orderBy: { createdAt: 'desc' },
      include: {
        insurer: { select: { name: true } }
      }
    });

    // 2. Fetch all non-issued Policy Requests
    const requests = await prisma.policyRequest.findMany({
      where: {
        farmerId,
        issuedPolicyId: null, // ONLY show requests that haven't been issued yet
        status: { not: 'issued' }
      },
      include: {
        insurer: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Map Policies to standardized view format
    const mappedPolicies = policies.map(policy => {
      const isExpired = policy.status === 'Expired' || (policy.endDate && new Date(policy.endDate) < now);
      return {
        ...policy,
        _id: policy.id,
        id: policy.id,
        type: 'policy',
        source: policy.source || 'internal',
        isExternal: policy.source === 'external',
        viewStatus: isExpired ? 'Expired' : 'Active',
        canRenew: isExpired,
        insurerName: policy.insurer?.name,
        // Ensure cropDetails specifically cultivationSeason is present
        cultivationSeason: (policy.cropDetails as any)?.cultivationSeason || 'N/A'
      };
    });

    // 4. Map Requests to standardized view format
    const mappedRequests = requests.map(req => ({
      ...req,
      _id: req.id,
      id: req.id,
      type: 'request',
      policyNumber: 'PENDING',
      sumInsured: 0, // Request might not have these yet
      premium: 0,
      startDate: req.requestedStartDate,
      endDate: null,
      status: req.status, // Original database status
      viewStatus: req.status === 'pending' ? 'Pending' :
        req.status === 'approved' ? 'Approved' :
          req.status === 'rejected' ? 'Rejected' :
            req.status === 'issued' ? 'Issued' : 'Pending',
      canRenew: false,
      insurerName: req.insurer?.name,
      cultivationSeason: (req.cropDetails as any)?.cultivationSeason || 'N/A'
    }));

    // 5. Combine and Sort (Newest first)
    const combined = [...mappedPolicies, ...mappedRequests].sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    Logger.farmer.policies('Fetched unified farmer policies', {
      farmerId,
      total: combined.length,
      policies: mappedPolicies.length,
      requests: mappedRequests.length
    });

    res.json(combined);
  } catch (error: any) {
    Logger.error('Error fetching unified farmer policies', {
      error: error?.message,
      farmerId: req.userId
    });
    res.status(500).json({ message: 'Server error while fetching policies' });
  }
});

// Get a single policy by ID (for farmers)
router.get('/farmer/policies/:id', authenticateToken, authorizeRoles(['FARMER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const farmerId = req.userId;
    const policyId = req.params.id;

    const policy = await prisma.policy.findFirst({
      where: { id: policyId, farmerId },
    });

    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    // Map id to _id for frontend compatibility
    const mappedPolicy = {
      ...policy,
      _id: policy.id,
      id: policy.id,
      source: policy.source || 'internal',
      isExternal: policy.source === 'external',
      canRenew: policy.status === 'Expired' || (policy.endDate && new Date(policy.endDate) < new Date()),
      // Do not expose Insurer details on farmer responses
      insurer: undefined,
    };

    res.json(mappedPolicy);
  } catch (error: any) {
    // Properly serialize error for logging
    const errorDetails = {
      message: error?.message || String(error),
      stack: error?.stack,
      name: error?.name,
      code: error?.code,
    };
    Logger.error('Error fetching policy', {
      error: errorDetails,
      policyId: req.params.id,
      userId: req.userId
    });
    res.status(500).json({
      message: 'Server error while fetching policy',
      error: process.env.NODE_ENV === 'development' ? errorDetails : undefined
    });
  }
});

router.get('/policies/:id', authenticateToken, authorizeRoles(['INSURER', 'ADMIN', 'SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { role, userId } = req;
    const policyId = req.params.id;

    // RULE: Internal policy visible only to: Farmer, Selected Insurer, Admin
    // RULE: External policy visible to: Farmer, Insurer, Admin
    const policy = await prisma.policy.findUnique({
      where: { id: policyId },
      include: {
        farmer: { select: { id: true, name: true, email: true, mobileNumber: true } },
        insurer: { select: { id: true, name: true, email: true } },
      },
    });

    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    // Check access permissions
    if (role === 'INSURER') {
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const insurer = await prisma.insurer.findUnique({ where: { userId } });
      if (!insurer) {
        return res.status(404).json({ message: 'Insurer profile not found' });
      }
      // Insurer can only see policies they issued (internal) OR external policies belonging to them
      if (policy.insurerId !== insurer.id) {
        return res.status(403).json({ message: 'Access denied: You can only view policies you issued' });
      }
    }
    // Admin can see all policies (no check needed)

    res.json(policy);
  } catch (error) {
    console.error('Error fetching policy by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper to generate a unique policy number
const generatePolicyNumber = (cropType: string) => {
  const prefix = cropType ? cropType.substring(0, 2).toUpperCase() : 'POL';
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  const timestamp = Date.now().toString().slice(-4); // last 4 digits of timestamp
  return `${prefix}-${year}-${random}-${timestamp}`;
};

// Add a new policy (Insurer only)
router.post('/policies', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  const { policyNumber, farmerId, cropType, insuredArea, startDate, endDate, premium, sumInsured, cropDetails } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // 1. Mandatory Field Validation
    if (!farmerId || farmerId.trim() === '') {
      return res.status(400).json({ message: 'Farmer selection is required. Please select a farmer from the list.' });
    }
    if (!cropType || cropType.trim() === '') {
      return res.status(400).json({ message: 'Crop type is required. Please select a crop.' });
    }
    if (!insuredArea || isNaN(parseFloat(insuredArea as any))) {
      return res.status(400).json({ message: 'Valid insured area is required.' });
    }
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Policy start and end dates are required.' });
    }

    // 2. Find the Insurer document for this user
    const insurer = await prisma.insurer.findUnique({ where: { userId } });

    if (!insurer) {
      return res.status(404).json({ message: 'Insurer profile not found' });
    }

    // 3. Verify Farmer exists to avoid Foreign Key Violation
    const farmer = await prisma.user.findUnique({ where: { id: farmerId } });
    if (!farmer) {
      return res.status(404).json({ message: 'The selected farmer record was not found.' });
    }

    // Auto-generate policy number if not provided
    const finalPolicyNumber = policyNumber && policyNumber.trim() !== ''
      ? policyNumber
      : generatePolicyNumber(cropType);

    // Create policy and auto-resolve existing requests in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // LAND LOCK: Prevent duplicate issuance for the same Khasra (if survey number exists in cropDetails)
      const khasra = cropDetails?.surveyNumber;
      if (khasra) {
        const existingActivePolicy = await tx.policy.findFirst({
          where: {
            farmerId,
            landRecordKhasra: khasra,
            status: 'Active',
            endDate: { gte: new Date() }
          }
        });
        if (existingActivePolicy) {
          const error = new Error(`Land Lock Alert: Land plot (Khasra ${khasra}) is already covered under an active policy (${existingActivePolicy.policyNumber}).`);
          (error as any).code = 'LAND_LOCKED';
          throw error;
        }
      }

      const policy = await tx.policy.create({
        data: {
          policyNumber: finalPolicyNumber,
          farmerId,
          insurerId: insurer.id,
          cropType,
          insuredArea: parseFloat(insuredArea as any) || 0,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          premium: parseFloat(premium as any) || 0,
          sumInsured: parseFloat(sumInsured as any) || 0,
          status: 'Active',
          source: 'internal',
          cropDetails: cropDetails || {},
        },
      });

      // Look for any PENDING or APPROVED requests for this farmer/crop and auto-resolve them
      await tx.policyRequest.updateMany({
        where: {
          farmerId,
          cropType,
          status: { in: ['pending', 'approved'] },
          issuedPolicyId: null
        },
        data: {
          status: 'issued',
          issuedPolicyId: policy.id,
        },
      });

      return policy;
    });

    Logger.policy.created('Policy created and requests auto-resolved', {
      policyId: result.id,
      policyNumber: finalPolicyNumber,
      insurerId: insurer.id,
      farmerId
    });

    res.status(201).json({ message: 'Policy created successfully', policy: result });
  } catch (error: any) {
    // Handle Prisma unique constraint violation
    if (error.code === 'P2002') {
      return res.status(409).json({
        message: 'Policy number already exists. Please provide a unique number or leave it blank to auto-generate.'
      });
    }

    // Handle Prisma foreign key violation
    if (error.code === 'P2003') {
      return res.status(400).json({
        message: 'Invalid data provided. Please ensure the farmer selection is valid.'
      });
    }

    // Handle Land Lock Violation
    if ((error as any).code === 'LAND_LOCKED') {
      return res.status(409).json({
        message: error.message
      });
    }

    Logger.error('Error creating policy', {
      error: error.message,
      userId,
      body: req.body
    });

    res.status(500).json({
      message: 'Server error while creating policy',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get policy images (for Admin and Insurer to view)
router.get('/policies/:policyId/images/:imageIndex', authenticateToken, authorizeRoles(['ADMIN', 'INSURER', 'FARMER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { policyId, imageIndex } = req.params;
    const index = parseInt(imageIndex);

    // Get policy and verify access
    const policy: any = await prisma.policy.findUnique({
      where: { id: policyId },
      include: {
        farmer: { select: { id: true } },
        insurer: { include: { user: { select: { id: true } } } },
      },
    });

    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    // Check permissions: farmer owns it, Insurer issued it, or admin
    const isFarmer = req.role === 'FARMER' && policy.farmerId === req.userId;
    const isInsurer = req.role === 'INSURER' && policy.insurer?.user?.id === req.userId;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.role || '');

    if (!isFarmer && !isInsurer && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get policy images
    const policyImages = policy.policyImages as any[] || [];
    if (index >= policyImages.length) {
      return res.status(404).json({ message: 'Policy image not found' });
    }

    const image = policyImages[index];
    if (!image || !image.path) {
      return res.status(404).json({ message: 'Policy image not found' });
    }

    // Check if file exists
    if (!fs.existsSync(image.path)) {
      return res.status(404).json({ message: 'Policy image file not found' });
    }

    // Set appropriate headers
    const fileName = image.fileName || `policy-image-${index + 1}`;
    res.setHeader('Content-Type', image.mimeType || 'image/jpeg');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

    // Stream file
    const fileStream = fs.createReadStream(image.path);
    fileStream.pipe(res);

    Logger.system.file('Policy image accessed', {
      policyId,
      imageIndex: index,
      userId: req.userId,
      role: req.role,
      fileName
    });

  } catch (error: any) {
    Logger.error('Error accessing policy image', {
      error,
      policyId: req.params.policyId,
      imageIndex: req.params.imageIndex,
      userId: req.userId
    });
    res.status(500).json({ message: 'Server error' });
  }
});

// Get policy documents (for Admin and Insurer to view)
router.get('/policies/:policyId/documents/:documentIndex', authenticateToken, authorizeRoles(['ADMIN', 'INSURER', 'FARMER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { policyId, documentIndex } = req.params;
    const index = parseInt(documentIndex);

    // Get policy and verify access
    const policy: any = await prisma.policy.findUnique({
      where: { id: policyId },
      include: {
        farmer: { select: { id: true, name: true, email: true, mobileNumber: true } },
        insurer: { include: { user: { select: { id: true } } } },
      },
    });

    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    // Check permissions: farmer owns it, Insurer issued it, or admin
    const isFarmer = req.role === 'FARMER' && policy.farmerId === req.userId;
    const isInsurer = req.role === 'INSURER' && policy.insurer?.user?.id === req.userId;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.role || '');

    if (!isFarmer && !isInsurer && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get policy documents
    const policyDocuments = policy.policyDocuments as any[] || [];
    if (index >= policyDocuments.length) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const document = policyDocuments[index];
    if (!document || !document.path) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if file exists
    if (!fs.existsSync(document.path)) {
      return res.status(404).json({ message: 'Document file not found' });
    }

    // Set appropriate headers
    const fileName = document.fileName || `policy-doc-${index + 1}`;
    res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

    // Stream file
    const fileStream = fs.createReadStream(document.path);
    fileStream.pipe(res);

    Logger.system.file('Policy document accessed', {
      policyId,
      documentIndex: index,
      userId: req.userId,
      role: req.role,
      fileName
    });

  } catch (error: any) {
    Logger.error('Error accessing policy document', {
      error,
      policyId: req.params.policyId,
      documentIndex: req.params.documentIndex,
      userId: req.userId
    });
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
