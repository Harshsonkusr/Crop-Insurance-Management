import { Router } from 'express';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';
import { Logger } from '../utils/logger';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ClaimService } from '../services/claim.service';
import { prisma } from '../db';
import { IdempotencyService } from '../services/idempotency.service';
import { FileValidationService } from '../services/fileValidation.service';
import { auditLogService } from '../services/auditLog.service';

// Use absolute path for uploads directory
const uploadsDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow images and documents
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and documents are allowed.'));
  }
};

const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxSize,
  },
});

const router = Router();
const claimService = new ClaimService();

router.post('/claims', authenticateToken, authorizeRoles(['FARMER']), (req: any, res: any, next: any) => {
  upload.fields([{ name: 'documents', maxCount: 10 }, { name: 'images', maxCount: 10 }])(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File size too large. Maximum size is 10MB.' });
        }
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: err.message || 'File upload error' });
    }
    next();
  });
}, async (req: any, res: any, next: any) => {
  try {
    // Check idempotency key
    const idempotencyKey = req.headers['idempotency-key'] as string;
    if (idempotencyKey) {
      const cachedResponse = await IdempotencyService.checkIdempotency(idempotencyKey);
      if (cachedResponse) {
        return res.status(200).json(cachedResponse);
      }
    }

    const { policyId: policyNumberOrId, dateOfIncident, description, amountClaimed, location, chosenPolicyId } = req.body;
    const farmerId = (req as AuthRequest).userId!;

    // Processing claim submission

    // Look up Policy by policyNumber (if it's a string like "POL123") or use as UUID
    let policyId: string | null = null;

    const policyById = await prisma.policy.findUnique({ where: { id: policyNumberOrId } });
    if (policyById) {
      policyId = policyById.id;
    } else {
      const policyByNumber = await prisma.policy.findFirst({ where: { policyNumber: policyNumberOrId, farmerId } });
      if (policyByNumber) {
        policyId = policyByNumber.id;
      }
    }

    if (!policyId) {
      return res.status(400).json({ 
        message: `Policy "${policyNumberOrId}" not found for this farmer.` 
      });
    }

    // Verify the policy belongs to this farmer
    const policy = await prisma.policy.findUnique({ where: { id: policyId } });
    if (!policy || policy.farmerId !== farmerId) {
      return res.status(403).json({ message: 'Access denied: This policy does not belong to you' });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } || {};
    const documents = files['documents'] || [];
    const images = files['images'] || [];

    // Validate and scan files
    const validatedDocs: string[] = [];
    const validatedImages: string[] = [];

    for (const doc of documents) {
      const validation = await FileValidationService.validateFile(doc.path, 'document');
      if (!validation.valid) {
        return res.status(400).json({ message: `Document validation failed: ${validation.error}` });
      }
      const scanResult = await FileValidationService.scanFile(doc.path);
      if (!scanResult.clean) {
        return res.status(400).json({ message: 'File failed security scan' });
      }
      validatedDocs.push(doc.path);
    }

    for (const img of images) {
      const validation = await FileValidationService.validateFile(img.path, 'image');
      if (!validation.valid) {
        return res.status(400).json({ message: `Image validation failed: ${validation.error}` });
      }
      const scanResult = await FileValidationService.scanFile(img.path);
      if (!scanResult.clean) {
        return res.status(400).json({ message: 'File failed security scan' });
      }
      validatedImages.push(img.path);
    }

    // Create idempotency record if key provided
    if (idempotencyKey) {
      await IdempotencyService.createIdempotencyKey(idempotencyKey, req.body);
    }

    let newClaim;
    try {
      newClaim = await claimService.createClaim(
        { 
          policyId, 
          dateOfIncident: new Date(dateOfIncident), 
          description, 
          locationOfIncident: location,
          amountClaimed: amountClaimed ? parseFloat(amountClaimed.toString()) : undefined,
          chosenPolicyId: chosenPolicyId || policyId // Use chosen policy if provided, else use policyId
        },
        farmerId,
        validatedDocs,
        validatedImages,
        idempotencyKey
      );

      // Verify claim was created successfully
      if (!newClaim || !newClaim.id) {
        Logger.error('Claim creation returned invalid response', { newClaim, userId: req.userId });
        return res.status(500).json({ 
          message: 'Claim was created but could not be retrieved. Please contact support.',
          error: 'Invalid claim response'
        });
      }

      // Verify claim has assignedToId
      if (!(newClaim as any).assignedToId) {
        Logger.error('CRITICAL: Claim created without assignedToId', {
          claimId: newClaim.id,
          claimIdFormatted: (newClaim as any).claimId,
          farmerId,
          policyId,
        });
        return res.status(500).json({ 
          message: 'Claim was created but not assigned to a service provider. Please contact support.',
          error: 'Missing assignedToId'
        });
      }

      // Mark idempotency as completed
      if (idempotencyKey) {
        await IdempotencyService.markCompleted(idempotencyKey, (newClaim as any).claimId || newClaim.id, {
          message: 'Claim submitted successfully',
          claim: newClaim,
        });
      }

      // Log claim creation
      await auditLogService.logFromRequest(
        req,
        'claim_created',
        { 
          claimId: newClaim.id, 
          claimIdFormatted: (newClaim as any).claimId,
          policyId,
          assignedToId: (newClaim as any).assignedToId 
        },
        'claim',
        newClaim.id
      );

      Logger.claim.created(`Claim ${(newClaim as any).claimId} created and assigned to service provider ${(newClaim as any).assignedToId}`, {
        claimId: newClaim.id,
        claimIdFormatted: (newClaim as any).claimId,
        farmerId,
        policyId,
        assignedToId: (newClaim as any).assignedToId,
        status: (newClaim as any).status,
        hasPolicy: !!(newClaim as any).policy,
        hasAssignedTo: !!(newClaim as any).assignedTo,
      });
    } catch (claimError: any) {
      Logger.error('Error creating claim in service', { 
        error: claimError.message, 
        stack: claimError.stack,
        farmerId,
        policyId,
        userId: req.userId 
      });
      
      // Mark idempotency as failed
      if (idempotencyKey) {
        await IdempotencyService.markFailed(idempotencyKey, claimError.message);
      }
      
      // Re-throw to be caught by outer catch block
      throw claimError;
    }

      Logger.claim.created(`Claim ${(newClaim as any).claimId} successfully created and returned to farmer`, {
        claimId: newClaim.id,
        claimIdFormatted: (newClaim as any).claimId,
        farmerId,
        assignedToId: (newClaim as any).assignedToId,
        amountClaimed: (newClaim as any).amountClaimed
      });

      res.status(201).json({ 
        message: 'Claim submitted successfully', 
        claim: newClaim 
      });
  } catch (error: any) {
    Logger.error('Claim submission error', { 
      error: error.message, 
      stack: error.stack,
      userId: req.userId,
      policyId: req.body?.policyId 
    });
    
    // Mark idempotency as failed
    const idempotencyKey = req.headers['idempotency-key'] as string;
    if (idempotencyKey) {
      await IdempotencyService.markFailed(idempotencyKey, error.message);
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: `Claim validation failed: ${error.message}` 
      });
    }

    // Return user-friendly error messages
    if (error.message.includes('Policy does not have an assigned service provider')) {
      return res.status(400).json({ 
        message: 'The selected policy does not have an assigned insurance company. Please contact support.' 
      });
    }

    if (error.message.includes('Service provider') && error.message.includes('not found')) {
      return res.status(500).json({ 
        message: 'Unable to assign claim to insurance company. Please contact support.' 
      });
    }

    return res.status(500).json({ 
      message: error.message || 'Failed to submit claim. Please try again or contact support.' 
    });
  }
});

// IMPORTANT: More specific routes must come BEFORE parameterized routes
// Get claims for the authenticated farmer (must be before /claims/:id)
router.get('/claims/my-claims', authenticateToken, authorizeRoles(['FARMER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const farmerId = req.userId;
    const claims = await claimService.getMyClaims(farmerId!);
    
    Logger.claim.created(`Farmer ${farmerId} fetched ${claims.length} claims`, {
      farmerId,
      claimCount: claims.length,
      claimIds: claims.map((c: any) => c.claimId || c.id),
    });
    
    res.json(claims);
  } catch (error: any) {
    Logger.error('Error in my-claims route', { error: error.message, stack: error.stack, userId: req.userId });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a single claim by ID for the authenticated farmer (must be before /claims/:id)
router.get('/claims/farmer/:id', authenticateToken, authorizeRoles(['FARMER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const farmerId = req.userId!;
    const claimId = req.params.id;

    const claim = await claimService.getClaimById(claimId);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Verify that the claim belongs to this farmer
    if (claim.farmerId !== farmerId) {
      return res.status(403).json({ message: 'Access denied: This claim does not belong to you' });
    }
    
    res.json(claim);
  } catch (error) {
    Logger.error('Error fetching farmer claim', { error, claimId: req.params.id, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all claims with pagination, search, filter, and sort (Admin and Service Provider only)
router.get('/claims', authenticateToken, authorizeRoles(['ADMIN', 'SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const query: Record<string, any> = {};
    const sort: Record<string, 'asc' | 'desc'> = {};

    // Search
    if (req.query.search) {
      const searchTerm = req.query.search as string;
      query.OR = [
        { claimId: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // RULE: SP should only see claims routed to them
    // Enforce SP scoping: Service Providers only see claims assigned to them
    if (req.role === 'SERVICE_PROVIDER') {
      const sp = await prisma.serviceProvider.findUnique({ where: { userId: req.userId! } });
      if (!sp) {
        return res.status(404).json({ message: 'Service Provider not found' });
      }
      // SP only sees claims assigned to them
      query.assignedToId = sp.id;
    } else if (req.query.assignedTo) {
      query.assignedToId = req.query.assignedTo;
    }

    // Filter by farmerId
    if (req.query.farmerId) {
      query.farmerId = req.query.farmerId;
    }

    // Sort
    if (req.query.sortBy) {
      const sortBy = req.query.sortBy as string;
      const orderBy = (req.query.orderBy as string) === 'desc' ? 'desc' : 'asc';
      sort[sortBy] = orderBy;
    } else {
      sort.dateOfClaim = 'desc'; // Default sort by dateOfClaim descending
    }

    const { claims, totalClaims } = await claimService.getClaims(query, page, limit, sort);

    res.json({
      claims,
      currentPage: page,
      totalPages: Math.ceil(totalClaims / limit),
      totalClaims,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single claim by ID (Admin and Service Provider only)
router.get('/claims/:id', authenticateToken, authorizeRoles(['ADMIN', 'SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    const claim = await claimService.getClaimById(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // RULE: SP should only see claims routed to them
    // If SP, ensure the claim is assigned to them
    if (req.role === 'SERVICE_PROVIDER') {
      const sp = await prisma.serviceProvider.findUnique({ where: { userId: req.userId! } });
      if (!sp || claim.assignedToId !== sp.id) {
        return res.status(403).json({ message: 'Access denied: You can only view claims assigned to you' });
      }
    }

    res.json(claim);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update claim status and resolution details (Admin and Service Provider only)
router.put('/claims/:id', authenticateToken, authorizeRoles(['ADMIN', 'SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status, resolutionDetails, assignedTo, adminOverrideReason, reassignTo } = req.body;
  const isAdmin = req.role === 'ADMIN' || req.role === 'SUPER_ADMIN';

  try {
    const claim = await prisma.claim.findUnique({ where: { id } });
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Admin override: Store override reason and timestamp
    const updateData: any = { status, resolutionDetails, assignedToId: assignedTo || reassignTo };
    
    if (isAdmin && adminOverrideReason) {
      updateData.adminOverrideReason = adminOverrideReason;
      updateData.adminOverrideAt = new Date();
      
      // Log admin override
      await auditLogService.logAdminOverride(
        req.userId!,
        'claim',
        id,
        adminOverrideReason,
        {
          before: { status: claim.status, assignedToId: claim.assignedToId },
          after: { status, assignedToId: assignedTo || reassignTo || claim.assignedToId },
        }
      );
    }

    const updatedClaim = await claimService.updateClaim(id, updateData);
    if (!updatedClaim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Log claim update
    await auditLogService.logFromRequest(
      req,
      isAdmin ? 'admin_claim_updated' : 'sp_claim_updated',
      { status, resolutionDetails },
      'claim',
      id
    );

    res.json({ message: 'Claim updated successfully', claim: updatedClaim });
  } catch (error) {
    Logger.error('Error updating claim', { error, claimId: id, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// SP: Get claims assigned to me with documents
router.get('/sp/claims', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const sp = await prisma.serviceProvider.findUnique({ where: { userId: req.userId } });
    if (!sp) {
      return res.status(404).json({ message: 'Service Provider not found' });
    }

    const claims = await prisma.claim.findMany({
      where: { assignedToId: sp.id },
      include: {
        farmer: { select: { name: true, email: true, mobileNumber: true } },
        policy: { select: { policyNumber: true, cropType: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(claims);
  } catch (error: any) {
    Logger.error('Error fetching SP claims', { error, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all claims with documents
router.get('/admin/claims', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const claims = await prisma.claim.findMany({
      include: {
        farmer: { select: { name: true, email: true, mobileNumber: true } },
        policy: { select: { policyNumber: true, cropType: true } },
        assignedTo: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(claims);
  } catch (error: any) {
    Logger.error('Error fetching all claims', { error, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Download/View claim document or image
router.get('/claims/:claimId/files/:fileType/:fileIndex', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { claimId, fileType, fileIndex } = req.params;
    const index = parseInt(fileIndex);

    if (!['documents', 'images'].includes(fileType)) {
      return res.status(400).json({ message: 'Invalid file type' });
    }

    // Get claim and verify access
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: {
        farmer: { select: { id: true } },
        assignedTo: { include: { user: { select: { id: true } } } },
        documents: true, // Include ClaimDocument records
      },
    });

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Check permissions: farmer owns it, SP assigned to it, or admin
    const isFarmer = req.role === 'FARMER' && claim.farmerId === req.userId;
    const isSP = req.role === 'SERVICE_PROVIDER' && claim.assignedTo?.user?.id === req.userId;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.role || '');

    if (!isFarmer && !isSP && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get files from ClaimDocument records filtered by kind
    const fileKind = fileType === 'images' ? 'image' : 'document';
    const claimDocuments = claim.documents.filter(doc => doc.kind === fileKind);
    
    if (index >= claimDocuments.length) {
      return res.status(404).json({ message: 'File not found' });
    }

    const claimDocument = claimDocuments[index];
    if (!claimDocument || !claimDocument.path) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filePath = claimDocument.path;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }

    // Get file stats for content type
    const stats = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';

    if (fileType === 'images') {
      if (['.jpg', '.jpeg'].includes(ext)) contentType = 'image/jpeg';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.gif') contentType = 'image/gif';
    } else if (fileType === 'documents') {
      if (ext === '.pdf') contentType = 'application/pdf';
      else if (['.doc', '.docx'].includes(ext)) contentType = 'application/msword';
      else if (ext === '.txt') contentType = 'text/plain';
    }

    // Set headers
    const fileName = path.basename(filePath);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

    // Stream file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    Logger.system.file('Claim file accessed', {
      claimId,
      fileType,
      fileIndex: index,
      userId: req.userId,
      role: req.role,
      fileName
    });

  } catch (error: any) {
    Logger.error('Error accessing claim file', {
      error,
      claimId: req.params.claimId,
      fileType: req.params.fileType,
      fileIndex: req.params.fileIndex,
      userId: req.userId
    });
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
