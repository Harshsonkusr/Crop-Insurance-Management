import { Router } from 'express';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';
import { Logger } from '../utils/logger';
import { prisma } from '../db';
import fs from 'fs';
import path from 'path';

const router = Router();

// Get policies based on role and user
// RULE: Internal policy visible only to: Farmer, Selected SP, Admin
// RULE: External policy visible to: Farmer, Insurer SP, Admin
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
    } else if (role === 'SERVICE_PROVIDER' && userId) {
      const serviceProvider = await prisma.serviceProvider.findUnique({ where: { userId } });
      if (serviceProvider) {
        // SP only sees policies they issued (internal) OR external policies belonging to their insurer
        where.serviceProviderId = serviceProvider.id;
      } else {
        return res.json([]);
      }
    }
    // Admin can see all policies (no filter)

    const policies = await prisma.policy.findMany({
      where,
      include: {
        farmer: { select: { name: true } },
        serviceProvider: { select: { name: true } },
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

// Alias route for farmer policies (includes internal and external policies)
router.get('/farmer/policies', authenticateToken, authorizeRoles(['FARMER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const farmerId = req.userId;
    
    // Fetch all policies (internal and external) without exposing SP details to farmer
    const policies = await prisma.policy.findMany({
      where: { farmerId },
      orderBy: { createdAt: 'desc' },
    });

    // Map id to _id for frontend compatibility and add source info
    const mappedPolicies = policies.map(policy => ({
      ...policy,
      _id: policy.id,
      id: policy.id,
      source: policy.source || 'internal',
      isExternal: policy.source === 'external',
      canRenew: policy.status === 'Expired' || (policy.endDate && new Date(policy.endDate) < new Date()),
      // Do not expose SP details on farmer responses
      serviceProvider: undefined,
    }));

    Logger.farmer.policies('Fetched farmer policies', { 
      farmerId, 
      count: mappedPolicies.length,
      internal: mappedPolicies.filter(p => p.source === 'internal').length,
      external: mappedPolicies.filter(p => p.source === 'external').length,
    });

    res.json(mappedPolicies);
  } catch (error: any) {
    // Properly serialize error for logging
    const errorDetails = {
      message: error?.message || String(error),
      stack: error?.stack,
      name: error?.name,
      code: error?.code,
    };
    Logger.error('Error fetching farmer policies', { 
      error: errorDetails, 
      userId: req.userId,
      farmerId: req.userId 
    });
    res.status(500).json({ 
      message: 'Server error while fetching policies',
      error: process.env.NODE_ENV === 'development' ? errorDetails : undefined
    });
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
      // Do not expose SP details on farmer responses
      serviceProvider: undefined,
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

router.get('/policies/:id', authenticateToken, authorizeRoles(['SERVICE_PROVIDER', 'ADMIN', 'SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { role, userId } = req;
    const policyId = req.params.id;

    // RULE: Internal policy visible only to: Farmer, Selected SP, Admin
    // RULE: External policy visible to: Farmer, Insurer SP, Admin
    const policy = await prisma.policy.findUnique({
      where: { id: policyId },
      include: {
        farmer: { select: { id: true, name: true, email: true, mobileNumber: true } },
        serviceProvider: { select: { id: true, name: true, email: true } },
      },
    });

    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    // Check access permissions
    if (role === 'SERVICE_PROVIDER') {
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const serviceProvider = await prisma.serviceProvider.findUnique({ where: { userId } });
      if (!serviceProvider) {
        return res.status(404).json({ message: 'Service Provider profile not found' });
      }
      // SP can only see policies they issued (internal) OR external policies belonging to their insurer
      if (policy.serviceProviderId !== serviceProvider.id) {
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

// Add a new policy (Service Provider only)
router.post('/policies', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  const { policyNumber, farmerId, cropType, insuredArea, startDate, endDate, premium, sumInsured } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Find the ServiceProvider document for this user
    const serviceProvider = await prisma.serviceProvider.findUnique({ where: { userId } });
    
    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service Provider profile not found' });
    }

    const newPolicy = await prisma.policy.create({
      data: {
        policyNumber,
        farmerId,
        serviceProviderId: serviceProvider.id,
        cropType,
        insuredArea,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        premium,
        sumInsured,
        status: 'Active',
      },
    });
    res.status(201).json({ message: 'Policy created successfully', policy: newPolicy });
  } catch (error) {
    console.error('Error creating policy:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get policy images (for Admin and SP to view)
router.get('/policies/:policyId/images/:imageIndex', authenticateToken, authorizeRoles(['ADMIN', 'SERVICE_PROVIDER', 'FARMER']), async (req: AuthRequest, res) => {
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
        serviceProvider: { include: { user: { select: { id: true } } } },
      },
    });

    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    // Check permissions: farmer owns it, SP issued it, or admin
    const isFarmer = req.role === 'FARMER' && policy.farmerId === req.userId;
    const isSP = req.role === 'SERVICE_PROVIDER' && policy.serviceProvider?.user?.id === req.userId;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.role || '');

    if (!isFarmer && !isSP && !isAdmin) {
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

export default router;
