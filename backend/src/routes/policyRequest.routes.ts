/**
 * Policy Request Routes
 * Farmers request policies, SPs issue them
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
      serviceProviderId, 
      cropType, 
      insuredArea, 
      requestedStartDate, 
      requestType, 
      existingPolicyId,
      // Crop details
      cropVariety,
      expectedYield,
      cultivationSeason,
      soilType,
      irrigationMethod,
      cropDescription
    } = req.body;
    
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } || {};
    const documentFiles = files['documents'] || [];
    const farmImageFiles = files['farmImages'] || [];

    if (!serviceProviderId || !cropType || !insuredArea) {
      return res.status(400).json({ message: 'Service provider, crop type, and insured area are required' });
    }

    // For new/renewal policy requests, farm images are required
    if (farmImageFiles.length === 0) {
      return res.status(400).json({ 
        message: 'Farm photos from different angles are required for policy request. Please upload at least one farm photo.' 
      });
    }

    // RULE: Only APPROVED SPs can receive policy requests
    // Verify SP exists and is approved
    const sp = await prisma.serviceProvider.findUnique({
      where: { id: serviceProviderId },
      include: { user: true },
    });

    if (!sp || sp.status !== 'active' || !sp.user.isApproved || !sp.kycVerified) {
      return res.status(400).json({ message: 'Service provider not available or not approved. Only approved service providers can receive policy requests.' });
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

    const request = await prisma.policyRequest.create({
      data: {
        farmerId: req.userId,
        serviceProviderId,
        cropType,
        insuredArea: parseFloat(insuredArea),
        requestedStartDate: requestedStartDate ? new Date(requestedStartDate) : null,
        documents: documents.length > 0 ? (documents as any) : null,
        farmImages: farmImages.length > 0 ? (farmImages as any) : null,
        cropDetails: Object.keys(cropDetails).length > 0 ? (cropDetails as any) : null,
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
        serviceProvider: {
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

// SP: Get policy requests assigned to me
// RULE: SP should only see policy requests where farmer selected them
router.get('/policy-requests', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const sp = await prisma.serviceProvider.findUnique({ where: { userId: req.userId } });
    if (!sp) {
      return res.status(404).json({ message: 'Service Provider not found' });
    }

    // RULE: SP only sees policy requests where farmer selected them (serviceProviderId matches)
    const requests = await prisma.policyRequest.findMany({
      where: { serviceProviderId: sp.id },
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

// SP: Approve and issue policy from request
router.post('/policy-requests/:id/issue', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const sp = await prisma.serviceProvider.findUnique({ where: { userId: req.userId } });
    if (!sp || !sp.kycVerified) {
      return res.status(403).json({ message: 'Service Provider not verified' });
    }

    const requestId = req.params.id;
    const { policyNumber, startDate, endDate, premium, sumInsured } = req.body;

    if (!policyNumber || !startDate || !endDate || !premium || !sumInsured) {
      return res.status(400).json({ message: 'All policy fields are required' });
    }

    const request = await prisma.policyRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.serviceProviderId !== sp.id) {
      return res.status(404).json({ message: 'Policy request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Policy request already processed' });
    }

    // Create policy in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create policy with images and crop details from request
      const policy = await tx.policy.create({
        data: {
          policyNumber,
          farmerId: request.farmerId,
          serviceProviderId: sp.id,
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
          // Copy crop details from request
          cropDetails: request.cropDetails || undefined,
        },
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

    res.status(201).json({ message: 'Policy issued successfully', policy: result });
  } catch (error: any) {
    Logger.error('Error issuing policy', { error, requestId: req.params.id, userId: req.userId });
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Policy number already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// SP: Reject policy request
router.post('/policy-requests/:id/reject', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const sp = await prisma.serviceProvider.findUnique({ where: { userId: req.userId } });
    if (!sp) {
      return res.status(404).json({ message: 'Service Provider not found' });
    }

    const requestId = req.params.id;
    const { rejectionReason } = req.body;

    const request = await prisma.policyRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.serviceProviderId !== sp.id) {
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
        serviceProvider: {
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
        serviceProvider: { include: { user: { select: { id: true } } } },
      },
    });

    if (!request) {
      return res.status(404).json({ message: 'Policy request not found' });
    }

    // Check permissions: farmer owns it, SP assigned to it, or admin
    const isFarmer = req.role === 'FARMER' && request.farmerId === req.userId;
    const isSP = req.role === 'SERVICE_PROVIDER' && request.serviceProvider?.user?.id === req.userId;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.role || '');

    if (!isFarmer && !isSP && !isAdmin) {
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
        serviceProvider: { include: { user: { select: { id: true } } } },
      },
    });

    if (!request) {
      return res.status(404).json({ message: 'Policy request not found' });
    }

    // Check permissions: farmer owns it, SP assigned to it, or admin
    const isFarmer = req.role === 'FARMER' && request.farmerId === req.userId;
    const isSP = req.role === 'SERVICE_PROVIDER' && request.serviceProvider?.user?.id === req.userId;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.role || '');

    if (!isFarmer && !isSP && !isAdmin) {
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


