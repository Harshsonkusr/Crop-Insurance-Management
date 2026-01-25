/**
 * Policy Request Routes
 * Farmers request policies, Insurers issue them
 */

import { Router } from 'express';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';
import { Logger } from '../utils/logger';
import { prisma } from '../db';
import { auditLogService } from '../services/auditLog.service';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

const uploadsDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

// Configure multer to handle multiple file fields
const uploadFields = upload.fields([
  { name: 'documents', maxCount: 10 },
  { name: 'farmImages', maxCount: 10 }, // Farm photos from different angles
]);

// Farmer: Request a policy (new or renewal)
router.post('/policy-requests', authenticateToken, authorizeRoles(['FARMER']), uploadFields, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const {
      insurerId,
      cropType,
      insuredArea,
      requestedStartDate,
      requestType,
      existingPolicyId,
      cropName,
      surveyNumber,
      khewatNumber,
      insuranceUnit,
      sumInsured,
      sowingDate,
      wildAnimalAttackCoverage,
      bankName,
      bankAccountNo,
      bankIfsc,
      // Existing crop details
      cropVariety,
      expectedYield,
      cultivationSeason,
      soilType,
      irrigationMethod,
      cropDescription,
      paymentDetails
    } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } || {};
    const documentFiles = files['documents'] || [];
    const farmImageFiles = files['farmImages'] || [];

    if (!insurerId || !cropType || !insuredArea) {
      return res.status(400).json({ message: 'Insurer, crop type, and insured area are required' });
    }

    // Payment Validation (Mock)
    let parsedPaymentDetails: any = null;
    if (paymentDetails) {
      try {
        parsedPaymentDetails = typeof paymentDetails === 'string' ? JSON.parse(paymentDetails) : paymentDetails;
        if (!parsedPaymentDetails.transactionId || parsedPaymentDetails.status !== 'success') {
          return res.status(400).json({ message: 'Payment verification failed' });
        }
      } catch (e) {
        return res.status(400).json({ message: 'Invalid payment details format' });
      }
    } else {
      // Enforce payment
      return res.status(400).json({ message: 'Premium payment is required to submit a policy request.' });
    }

    // For new/renewal policy requests, farm images are required
    if (farmImageFiles.length === 0) {
      return res.status(400).json({
        message: 'Farm photos from different angles are required for policy request. Please upload at least one farm photo.'
      });
    }

    // RULE: Only APPROVED Insurers can receive policy requests
    // Verify Insurer exists and is approved
    const insurer = await prisma.insurer.findUnique({
      where: { id: insurerId },
      include: { user: true },
    });

    if (!insurer || insurer.status !== 'active' || !insurer.user.isApproved || !insurer.kycVerified) {
      return res.status(400).json({ message: 'Insurer not available or not approved. Only approved insurers can receive policy requests.' });
    }

    const documents = documentFiles.map(f => ({
      path: f.path,
      fileName: f.originalname,
      fileSize: f.size,
      mimeType: f.mimetype,
    }));

    const farmImages = farmImageFiles.map(f => ({
      path: f.path,
      fileName: f.originalname,
      fileSize: f.size,
      mimeType: f.mimetype,
      uploadedAt: new Date().toISOString(),
    }));

    // Prepare crop details
    const cropDetails: any = {};
    if (cropVariety) cropDetails.cropVariety = cropVariety;
    if (expectedYield) cropDetails.expectedYield = parseFloat(expectedYield);
    if (cultivationSeason) cropDetails.cultivationSeason = cultivationSeason;
    if (soilType) cropDetails.soilType = soilType;
    if (irrigationMethod) cropDetails.irrigationMethod = irrigationMethod;
    if (cropDescription) cropDetails.cropDescription = cropDescription;

    // New PMFBY fields
    if (cropName) cropDetails.cropName = cropName;
    if (surveyNumber) cropDetails.surveyNumber = surveyNumber;
    if (khewatNumber) cropDetails.khewatNumber = khewatNumber;
    if (insuranceUnit) cropDetails.insuranceUnit = insuranceUnit;
    if (sumInsured) cropDetails.sumInsured = parseFloat(sumInsured);
    if (sowingDate) cropDetails.sowingDate = sowingDate;
    if (wildAnimalAttackCoverage !== undefined) cropDetails.wildAnimalAttackCoverage = wildAnimalAttackCoverage === 'true' || wildAnimalAttackCoverage === true;
    if (bankName) cropDetails.bankName = bankName;
    if (bankAccountNo) cropDetails.bankAccountNo = bankAccountNo;
    if (bankIfsc) cropDetails.bankIfsc = bankIfsc;

    const request = await prisma.policyRequest.create({
      data: {
        farmerId: req.userId,
        insurerId,
        cropType,
        insuredArea: parseFloat(insuredArea),
        requestedStartDate: requestedStartDate ? new Date(requestedStartDate) : null,
        documents: documents.length > 0 ? (documents as any) : null,
        farmImages: farmImages.length > 0 ? (farmImages as any) : null,
        cropDetails: Object.keys(cropDetails).length > 0 ? (cropDetails as any) : null,
        paymentDetails: parsedPaymentDetails,
        status: 'pending',
        // Add metadata for renewal requests
        ...(requestType === 'renewal' && existingPolicyId ? {
          rejectionReason: `Renewal request for policy ${existingPolicyId}`,
        } : {}),
      },
    });

    await auditLogService.logFromRequest(req, 'policy_requested', { requestId: request.id }, 'policy_request', request.id);

    res.status(201).json({ message: 'Policy request submitted', request });
  } catch (error) {
    Logger.error('Error creating policy request', { error, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Farmer: Get my policy requests
router.get('/policy-requests/my-requests', authenticateToken, authorizeRoles(['FARMER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const requests = await prisma.policyRequest.findMany({
      where: { farmerId: req.userId },
      include: {
        insurer: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (error) {
    Logger.error('Error fetching policy requests', { error, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Insurer: Get policy requests assigned to me
// RULE: Insurer should only see policy requests where farmer selected them
router.get('/policy-requests', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const insurer = await prisma.insurer.findUnique({ where: { userId: req.userId } });
    if (!insurer) {
      return res.status(404).json({ message: 'Insurer not found' });
    }

    // RULE: Insurer only sees policy requests where farmer selected them (insurerId matches)
    const requests = await prisma.policyRequest.findMany({
      where: { insurerId: insurer.id },
      include: {
        farmer: {
          select: { name: true, email: true, mobileNumber: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (error) {
    Logger.error('Error fetching policy requests', { error, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single policy request by ID
router.get('/policy-requests/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const requestId = req.params.id;
    const { role, userId } = req;

    const request = await prisma.policyRequest.findUnique({
      where: { id: requestId },
      include: {
        farmer: {
          select: { id: true, name: true, email: true, mobileNumber: true },
        },
        insurer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!request) {
      return res.status(404).json({ message: 'Policy request not found' });
    }

    // Check permissions
    if (role === 'FARMER' && request.farmerId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (role === 'INSURER') {
      const insurer = await prisma.insurer.findUnique({ where: { userId } });
      if (!insurer || request.insurerId !== insurer.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(request);
  } catch (error) {
    Logger.error('Error fetching policy request detail', { error, requestId: req.params.id, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Insurer: Approve and issue policy from request
router.post('/policy-requests/:id/issue', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const insurer = await prisma.insurer.findUnique({ where: { userId: req.userId } });
    if (!insurer || !insurer.kycVerified) {
      return res.status(403).json({ message: 'Insurer not verified' });
    }

    const requestId = req.params.id;
    const { policyNumber, startDate, endDate, premium, sumInsured, cropDetails: editedCropDetails } = req.body;

    if (!policyNumber || !startDate || !endDate || !premium || !sumInsured) {
      return res.status(400).json({ message: 'All policy fields are required' });
    }

    const request = await prisma.policyRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.insurerId !== insurer.id) {
      return res.status(404).json({ message: 'Policy request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Policy request already processed' });
    }

    // Create policy in transaction
    const result = await prisma.$transaction(async (tx) => {
      // LAND LOCK: Prevent duplicate issuance for the same Khasra
      const khasra = editedCropDetails?.surveyNumber || (request.cropDetails as any)?.surveyNumber;
      if (khasra) {
        const existingActivePolicy = await tx.policy.findFirst({
          where: {
            farmerId: request.farmerId,
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

      // Auto-generate policy number if somehow missing
      const finalPolicyNumber = policyNumber && policyNumber.trim() !== ''
        ? policyNumber
        : `POL-ISS-${Date.now().toString().slice(-6)}`;

      // Create policy with images and crop details from request
      const policy = await tx.policy.create({
        data: {
          policyNumber: finalPolicyNumber,
          farmerId: request.farmerId,
          insurerId: insurer.id,
          landRecordKhasra: khasra || undefined, // Map Khasra to the policy record
          cropType: request.cropType,
          insuredArea: request.insuredArea,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          premium: parseFloat(premium),
          sumInsured: parseFloat(sumInsured),
          status: 'Active',
          source: 'internal',
          policyVerified: true,
          // Copy farm images from request to policy (for AI matching with claim images)
          policyImages: request.farmImages || undefined,
          // Copy documents from request (land records, etc.)
          policyDocuments: request.documents || undefined,
          // Use edited crop details if provided, else fallback to request data
          cropDetails: editedCropDetails || request.cropDetails || undefined,
        } as any,
      });

      // Update request status
      await tx.policyRequest.update({
        where: { id: requestId },
        data: {
          status: 'issued',
          issuedPolicyId: policy.id,
        },
      });

      return policy;
    });

    await auditLogService.logFromRequest(req, 'policy_issued', { policyId: result.id, requestId }, 'policy', result.id);
    Logger.policy.created('Policy issued from request', { policyId: result.id, requestId });

    res.status(201).json({ message: 'Policy issued successfully', policy: result });
  } catch (error: any) {
    // Handle Prisma unique constraint violation
    if (error.code === 'P2002') {
      return res.status(409).json({
        message: 'Policy number already exists. Please provide a unique number.'
      });
    }

    Logger.error('Error issuing policy from request', {
      error: error.message,
      requestId: req.params.id,
      userId: req.userId
    });

    res.status(500).json({
      message: 'Server error while issuing policy',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Insurer: Reject policy request
router.post('/policy-requests/:id/reject', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const insurer = await prisma.insurer.findUnique({ where: { userId: req.userId } });
    if (!insurer) {
      return res.status(404).json({ message: 'Insurer not found' });
    }

    const requestId = req.params.id;
    const { rejectionReason } = req.body;

    const request = await prisma.policyRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.insurerId !== insurer.id) {
      return res.status(404).json({ message: 'Policy request not found' });
    }

    await prisma.policyRequest.update({
      where: { id: requestId },
      data: {
        status: 'rejected',
        rejectionReason: rejectionReason || 'Rejected by service provider',
      },
    });

    await auditLogService.logFromRequest(req, 'policy_request_rejected', { requestId, rejectionReason }, 'policy_request', requestId);

    res.json({ message: 'Policy request rejected' });
  } catch (error) {
    Logger.error('Error rejecting policy request', { error, requestId: req.params.id, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all policy requests with documents
router.get('/policy-requests/all', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const requests = await prisma.policyRequest.findMany({
      include: {
        farmer: {
          select: { name: true, email: true, mobileNumber: true },
        },
        insurer: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (error: any) {
    Logger.error('Error fetching all policy requests', { error, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Download/View policy request document
router.get('/policy-requests/:requestId/documents/:documentIndex', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { requestId, documentIndex } = req.params;
    const index = parseInt(documentIndex);

    // Get request and verify access
    const request = await prisma.policyRequest.findUnique({
      where: { id: requestId },
      include: {
        farmer: { select: { id: true } },
        insurer: { include: { user: { select: { id: true } } } },
      },
    });

    if (!request) {
      return res.status(404).json({ message: 'Policy request not found' });
    }

    // Check permissions: farmer owns it, Insurer assigned to it, or admin
    const isFarmer = req.role === 'FARMER' && request.farmerId === req.userId;
    const isInsurer = req.role === 'INSURER' && request.insurer?.user?.id === req.userId;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.role || '');

    if (!isFarmer && !isInsurer && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get document
    if (!request.documents || !Array.isArray(request.documents) || index >= request.documents.length) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const document = request.documents[index] as any;
    if (!document || !document.path) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if file exists
    if (!fs.existsSync(document.path)) {
      return res.status(404).json({ message: 'Document file not found' });
    }

    // Set appropriate headers
    const fileName = document.fileName || `document-${index + 1}`;
    res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

    // Stream file
    const fileStream = fs.createReadStream(document.path);
    fileStream.pipe(res);

    Logger.system.file('Document accessed', {
      requestId,
      documentIndex: index,
      userId: req.userId,
      role: req.role,
      fileName
    });

  } catch (error: any) {
    Logger.error('Error accessing policy request document', {
      error,
      requestId: req.params.requestId,
      documentIndex: req.params.documentIndex,
      userId: req.userId
    });
    res.status(500).json({ message: 'Server error' });
  }
});

// Download/View policy request farm image
router.get('/policy-requests/:requestId/farm-images/:imageIndex', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { requestId, imageIndex } = req.params;
    const index = parseInt(imageIndex);

    // Get request and verify access
    const request = await prisma.policyRequest.findUnique({
      where: { id: requestId },
      include: {
        farmer: { select: { id: true } },
        insurer: { include: { user: { select: { id: true } } } },
      },
    });

    if (!request) {
      return res.status(404).json({ message: 'Policy request not found' });
    }

    // Check permissions: farmer owns it, Insurer assigned to it, or admin
    const isFarmer = req.role === 'FARMER' && request.farmerId === req.userId;
    const isInsurer = req.role === 'INSURER' && request.insurer?.user?.id === req.userId;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.role || '');

    if (!isFarmer && !isInsurer && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get farm image
    if (!request.farmImages || !Array.isArray(request.farmImages) || index >= request.farmImages.length) {
      return res.status(404).json({ message: 'Farm image not found' });
    }

    const image = request.farmImages[index] as any;
    if (!image || !image.path) {
      return res.status(404).json({ message: 'Farm image not found' });
    }

    // Check if file exists
    if (!fs.existsSync(image.path)) {
      return res.status(404).json({ message: 'Farm image file not found' });
    }

    // Set appropriate headers
    const fileName = image.fileName || `farm-image-${index + 1}`;
    res.setHeader('Content-Type', image.mimeType || 'image/jpeg');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

    // Stream file
    const fileStream = fs.createReadStream(image.path);
    fileStream.pipe(res);

    Logger.system.file('Farm image accessed', {
      requestId,
      imageIndex: index,
      userId: req.userId,
      role: req.role,
      fileName
    });

  } catch (error: any) {
    Logger.error('Error accessing policy request farm image', {
      error,
      requestId: req.params.requestId,
      imageIndex: req.params.imageIndex,
      userId: req.userId
    });
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;


