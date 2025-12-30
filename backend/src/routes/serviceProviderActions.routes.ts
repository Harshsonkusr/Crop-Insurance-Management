import { Router } from 'express';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';
import { Logger } from '../utils/logger';
import { ServiceProviderService } from '../services/serviceProvider.service';
import { prisma } from '../db';
import { ClaimStatus, VerificationStatus, UserRole, UserStatus } from '@prisma/client';
import { auditLogService } from '../services/auditLog.service';

const router = Router();
const serviceProviderService = new ServiceProviderService();

// Helper function to get service provider ID from user ID
// Auto-creates ServiceProvider document if it doesn't exist
const getServiceProviderId = async (userId: string): Promise<string | null> => {
  let sp = await prisma.serviceProvider.findUnique({ where: { userId } });

  if (!sp) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== UserRole.SERVICE_PROVIDER) {
      return null;
    }
    sp = await prisma.serviceProvider.create({
      data: {
        name: user.name,
        email: user.email || `${user.mobileNumber}@serviceprovider.local`,
        phone: user.mobileNumber || '',
        address: '',
        serviceType: 'Crop Insurance',
        status: user.isApproved ? 'active' : 'pending',
        userId,
      },
    });
    Logger.sp.registered(`Auto-created ServiceProvider record for user ${userId}`, { userId });
  }

  return sp.id;
};

// Helper function to check if service provider is active/approved
const isServiceProviderActive = async (userId: string): Promise<boolean> => {
  const sp = await prisma.serviceProvider.findUnique({ where: { userId } });
  return sp?.status === 'active';
};

// Debug endpoint to check service provider status
router.get('/debug/status', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const sp = await prisma.serviceProvider.findUnique({ where: { userId: req.userId } });
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    const isActive = await isServiceProviderActive(req.userId);
    const serviceProviderId = await getServiceProviderId(req.userId);

    // Count claims assigned to this SP
    const assignedClaimsCount = serviceProviderId ?
      await prisma.claim.count({ where: { assignedToId: serviceProviderId } }) : 0;

    res.json({
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
        isApproved: user?.isApproved,
      },
      serviceProvider: sp ? {
        id: sp.id,
        name: sp.name,
        status: sp.status,
        userId: sp.userId,
      } : null,
      isActive,
      serviceProviderId,
      assignedClaimsCount,
    });
  } catch (error) {
    Logger.error('Error checking SP status', { error, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Get service provider profile
router.get('/profile', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const profile = await serviceProviderService.getServiceProviderProfile(req.userId);
    if (!profile) {
      return res.status(404).json({ message: 'Service Provider profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get assigned claims for a service provider
router.get('/claims/assigned', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const serviceProviderId = await getServiceProviderId(req.userId);
    if (!serviceProviderId) {
      return res.status(404).json({ message: 'Service Provider not found' });
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort: Record<string, 'asc' | 'desc'> = {};

    if (req.query.sortBy) {
      const sortBy = req.query.sortBy as string;
      const orderBy = (req.query.orderBy as string) === 'desc' ? 'desc' : 'asc';
      sort[sortBy] = orderBy;
    } else {
      sort.createdAt = 'desc';
    }

    const { claims, totalClaims } = await serviceProviderService.getAssignedClaims(serviceProviderId, page, limit, sort);
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

// Update claim status by service provider
router.put('/claims/:id/status', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const serviceProviderId = await getServiceProviderId(req.userId);
    if (!serviceProviderId) {
      return res.status(404).json({ message: 'Service Provider not found' });
    }

    const updatedClaim = await serviceProviderService.updateClaimStatus(id, serviceProviderId, status, notes);
    if (!updatedClaim) {
      return res.status(404).json({ message: 'Claim not found or not assigned to this service provider' });
    }

    // Log SP action
    await auditLogService.logFromRequest(req, 'claim_status_updated', { status, notes }, 'claim', id);

    res.json({ message: 'Claim status updated successfully', claim: updatedClaim });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit inspection report by service provider
router.post('/claims/:id/report', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { report } = req.body;
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const serviceProviderId = await getServiceProviderId(req.userId);
    if (!serviceProviderId) {
      return res.status(404).json({ message: 'Service Provider not found' });
    }

    const updatedClaim = await serviceProviderService.submitInspectionReport(id, serviceProviderId, report);
    if (!updatedClaim) {
      return res.status(404).json({ message: 'Claim not found or not assigned to this service provider' });
    }
    res.json({ message: 'Inspection report submitted successfully', claim: updatedClaim });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all claims for service provider (with pagination, search, filter)
router.get('/claims', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if Service Provider is active/approved
    const isActive = await isServiceProviderActive(req.userId);
    if (!isActive) {
      return res.status(403).json({ message: 'Service Provider account is pending approval. Please contact administrator.' });
    }

    const serviceProviderId = await getServiceProviderId(req.userId);
    if (!serviceProviderId) {
      return res.status(404).json({ message: 'Service Provider not found' });
    }

    Logger.sp.claim(`Active SP ${req.userId} (serviceProviderId: ${serviceProviderId}) fetching assigned claims`);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where: any = { assignedToId: serviceProviderId };

    Logger.sp.claim(`Query filter: assignedToId = ${serviceProviderId}`);

    if (req.query.status) {
      where.status = req.query.status as any;
    }

    if (req.query.search) {
      const searchTerm = req.query.search as string;
      where.OR = [
        { claimId: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const sort: Record<string, 'asc' | 'desc'> = {};
    if (req.query.sortBy) {
      const sortBy = req.query.sortBy as string;
      const orderBy = (req.query.orderBy as string) === 'desc' ? 'desc' : 'asc';
      sort[sortBy] = orderBy;
    } else {
      sort.createdAt = 'desc';
    }

    const [claims, totalClaims] = await Promise.all([
      prisma.claim.findMany({
        where,
        orderBy: sort,
        skip,
        take: limit,
        include: {
          farmer: { select: { name: true, email: true, mobileNumber: true } },
          policy: { select: { policyNumber: true, cropType: true, sumInsured: true } },
          documents: true,
        },
      }),
      prisma.claim.count({ where }),
    ]);

    Logger.sp.claim(`Found ${totalClaims} total claims, returning ${claims.length} claims for page ${page}`, {
      serviceProviderId,
      userId: req.userId,
      totalClaims,
      claimsReturned: claims.length,
      claimIds: claims.map((c: any) => c.claimId || c.id),
      filter: where,
    });

    // Transform claims to include documents and images separately
    const transformedClaims = claims.map((claim: any) => ({
      ...claim,
      documents: claim.documents?.filter((d: any) => d.kind === 'document').map((d: any) => d.path) || [],
      images: claim.documents?.filter((d: any) => d.kind === 'image').map((d: any) => d.path) || [],
    }));

    res.json({
      claims: transformedClaims,
      currentPage: page,
      totalPages: Math.ceil(totalClaims / limit),
      totalClaims,
    });
  } catch (error) {
    Logger.error('Error fetching claims', { error, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single claim by ID
router.get('/claims/:id', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const serviceProviderId = await getServiceProviderId(req.userId);
    if (!serviceProviderId) {
      return res.status(404).json({ message: 'Service Provider not found' });
    }

    const claim = await prisma.claim.findFirst({
      where: { id: req.params.id, assignedToId: serviceProviderId },
      include: {
        farmer: { select: { name: true, email: true, mobileNumber: true } },
        policy: { select: { policyNumber: true, cropType: true, sumInsured: true, premium: true, farmerId: true, serviceProviderId: true } },
      },
    });

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found or not assigned to this service provider' });
    }

    res.json(claim);
  } catch (error) {
    Logger.error('Error fetching claim', { error, claimId: req.params.id, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Save draft verification report
router.put('/claims/:id/draft', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const serviceProviderId = await getServiceProviderId(req.userId);
    if (!serviceProviderId) {
      return res.status(404).json({ message: 'Service Provider not found' });
    }

    const { damageConfirmation, verificationNotes, estimatedLoss, recommendations } = req.body;

    const claim = await prisma.claim.updateMany({
      where: { id: req.params.id, assignedToId: serviceProviderId },
      data: {
        verificationData: {
          damageConfirmation,
          verificationNotes,
          estimatedLoss,
          recommendations,
          lastUpdated: new Date(),
        },
        status: ClaimStatus.under_review,
      },
    });

    const updated = await prisma.claim.findFirst({
      where: { id: req.params.id, assignedToId: serviceProviderId },
      include: {
        farmer: { select: { name: true, email: true, mobileNumber: true } },
        policy: { select: { policyNumber: true, cropType: true, sumInsured: true, premium: true } },
      },
    });

    if (!updated) {
      return res.status(404).json({ message: 'Claim not found or not assigned to this service provider' });
    }

    res.json({ message: 'Draft saved successfully', claim: updated });
  } catch (error) {
    Logger.error('Error saving draft', { error, claimId: req.params.id, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit verification report
router.post('/claims/:id/submit', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const serviceProviderId = await getServiceProviderId(req.userId);
    if (!serviceProviderId) {
      return res.status(404).json({ message: 'Service Provider not found' });
    }

    const { damageConfirmation, verificationNotes, estimatedLoss, recommendations } = req.body;

    if (!damageConfirmation) {
      return res.status(400).json({ message: 'Damage confirmation is required' });
    }

    const updated = await prisma.claim.updateMany({
      where: { id: req.params.id, assignedToId: serviceProviderId },
      data: {
        verificationData: {
          damageConfirmation,
          verificationNotes,
          estimatedLoss,
          recommendations,
          submittedAt: new Date(),
          lastUpdated: new Date(),
        },
        status: damageConfirmation === 'confirmed' ? ClaimStatus.approved : ClaimStatus.rejected,
        verificationStatus: VerificationStatus.Verified,
      },
    });

    const claim = await prisma.claim.findFirst({
      where: { id: req.params.id, assignedToId: serviceProviderId },
      include: {
        farmer: { select: { name: true, email: true, mobileNumber: true } },
        policy: { select: { policyNumber: true, cropType: true, sumInsured: true, premium: true, farmerId: true, serviceProviderId: true } },
      },
    });

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found or not assigned to this service provider' });
    }

    // Log SP action
    await auditLogService.logFromRequest(req, 'verification_report_submitted', { damageConfirmation, estimatedLoss }, 'claim', req.params.id);

    res.json({ message: 'Verification report submitted successfully', claim });
  } catch (error) {
    Logger.error('Error submitting report', { error, claimId: req.params.id, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark claim as fraud suspect
router.post('/claims/:id/fraud-suspect', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const serviceProviderId = await getServiceProviderId(req.userId);
    if (!serviceProviderId) {
      return res.status(404).json({ message: 'Service Provider not found' });
    }

    await prisma.claim.updateMany({
      where: { id: req.params.id, assignedToId: serviceProviderId },
      data: {
        status: ClaimStatus.fraud_suspect,
        verificationStatus: VerificationStatus.fraud_suspect,
        fraudFlaggedAt: new Date(),
      },
    });

    const claim = await prisma.claim.findFirst({
      where: { id: req.params.id, assignedToId: serviceProviderId },
      include: {
        farmer: { select: { name: true, email: true, mobileNumber: true } },
        policy: { select: { policyNumber: true, cropType: true, sumInsured: true, premium: true, farmerId: true, serviceProviderId: true } },
      },
    });

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found or not assigned to this service provider' });
    }

    res.json({ message: 'Claim marked as fraud suspect', claim });
  } catch (error) {
    Logger.error('Error marking fraud suspect', { error, claimId: req.params.id, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete claim (soft delete - mark as cancelled)
router.delete('/claims/:id', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const serviceProviderId = await getServiceProviderId(req.userId);
    if (!serviceProviderId) {
      return res.status(404).json({ message: 'Service Provider not found' });
    }

    // Instead of actually deleting, mark as cancelled
    const updated = await prisma.claim.updateMany({
      where: { id: req.params.id, assignedToId: serviceProviderId },
      data: {
        status: ClaimStatus.cancelled,
      },
    });

    if (updated.count === 0) {
      return res.status(404).json({ message: 'Claim not found or not assigned to this service provider' });
    }

    res.json({ message: 'Claim cancelled successfully' });
  } catch (error) {
    Logger.error('Error deleting claim', { error, claimId: req.params.id, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all farmers assigned to this service provider
router.get('/farmers', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const serviceProviderId = await getServiceProviderId(req.userId);
    if (!serviceProviderId) {
      return res.status(404).json({ message: 'Service Provider not found' });
    }

    // Find all policies for this service provider
    const policies = await prisma.policy.findMany({
      where: { serviceProviderId },
      select: { farmerId: true },
    });

    const farmerIds = [...new Set(policies.map((p) => p.farmerId))];
    const farmers = await prisma.user.findMany({
      where: { id: { in: farmerIds }, role: UserRole.FARMER },
      select: { id: true, name: true, email: true, mobileNumber: true, status: true, createdAt: true },
    });

    res.json(farmers);
  } catch (error) {
    Logger.error('Error fetching farmers', { error, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single farmer by ID
router.get('/farmers/:id', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const serviceProviderId = await getServiceProviderId(req.userId);
    if (!serviceProviderId) {
      return res.status(404).json({ message: 'Service Provider not found' });
    }

    const farmerId = req.params.id;

    const policy = await prisma.policy.findFirst({ where: { farmerId, serviceProviderId } });
    if (!policy) {
      return res.status(403).json({ message: 'Access denied: This farmer is not assigned to you' });
    }

    const farmer = await prisma.user.findUnique({
      where: { id: farmerId },
      select: { id: true, name: true, email: true, mobileNumber: true, status: true, role: true, createdAt: true },
    });

    if (!farmer || farmer.role !== UserRole.FARMER) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    const [policies, claims, farmDetails] = await Promise.all([
      prisma.policy.findMany({ where: { farmerId, serviceProviderId } }),
      prisma.claim.findMany({ where: { farmerId, assignedToId: serviceProviderId } }),
      prisma.farmDetails.findUnique({ where: { farmerId } }),
    ]);

    res.json({
      farmer,
      policies,
      claims,
      farmDetails,
    });
  } catch (error) {
    Logger.error('Error fetching farmer', { error, farmerId: req.params.id, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update a farmer (for service provider to add farmers)
router.post('/farmers', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const serviceProviderId = await getServiceProviderId(req.userId);
    if (!serviceProviderId) {
      return res.status(404).json({ message: 'Service Provider not found' });
    }

    const { name, mobileNumber, email, location } = req.body;

    const farmer = await prisma.user.upsert({
      where: { mobileNumber },
      update: {
        name,
        email,
        role: UserRole.FARMER,
        status: UserStatus.active,
      },
      create: {
        name,
        mobileNumber,
        email,
        role: UserRole.FARMER,
        status: UserStatus.active,
      },
      select: { id: true, name: true, email: true, mobileNumber: true, status: true },
    });

    res.status(201).json({ message: 'Farmer added successfully', farmer });
  } catch (error: any) {
    Logger.error('Error creating farmer', { error, userId: req.userId });
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'A farmer with this mobile number already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update farmer
router.put('/farmers/:id', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const serviceProviderId = await getServiceProviderId(req.userId);
    if (!serviceProviderId) {
      return res.status(404).json({ message: 'Service Provider not found' });
    }

    // Verify that this farmer has a policy with this service provider
    const policy = await prisma.policy.findFirst({ where: { farmerId: req.params.id, serviceProviderId } });

    if (!policy) {
      return res.status(403).json({ message: 'Access denied: This farmer is not assigned to you' });
    }

    const { name, email, mobileNumber } = req.body;
    const farmer = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, email, mobileNumber },
      select: { id: true, name: true, email: true, mobileNumber: true, status: true },
    });

    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    res.json({ message: 'Farmer updated successfully', farmer });
  } catch (error) {
    Logger.error('Error updating farmer', { error, farmerId: req.params.id, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete farmer (soft delete - just remove from service provider's list)
router.delete('/farmers/:id', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const serviceProviderId = await getServiceProviderId(req.userId);
    if (!serviceProviderId) {
      return res.status(404).json({ message: 'Service Provider not found' });
    }

    // Note: We don't actually delete the farmer, just remove their policies for this SP
    await prisma.policy.deleteMany({ where: { farmerId: req.params.id, serviceProviderId } });

    res.json({ message: 'Farmer removed from your list successfully' });
  } catch (error) {
    Logger.error('Error deleting farmer', { error, farmerId: req.params.id, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reports for service provider (inspection reports from claims)
router.get('/reports', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const serviceProviderId = await getServiceProviderId(req.userId);
    if (!serviceProviderId) {
      return res.status(404).json({ message: 'Service Provider not found' });
    }

    // Get all claims with inspection reports
    const claims = await prisma.claim.findMany({
      where: { assignedToId: serviceProviderId, inspectionReport: { not: null as any } },
      select: {
        id: true,
        claimId: true,
        inspectionReport: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        farmer: { select: { id: true, name: true, email: true, mobileNumber: true } },
        policy: { select: { id: true, policyNumber: true, cropType: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const reports = claims.map((claim) => ({
      _id: claim.id,
      id: claim.id,
      name: `Inspection Report - ${claim.claimId}`,
      type: 'Inspection Report',
      date: claim.updatedAt || claim.createdAt,
      status: claim.status,
      claimId: claim.claimId,
      farmer: claim.farmer,
      policy: claim.policy,
      content: claim.inspectionReport,
    }));

    res.json(reports);
  } catch (error) {
    Logger.error('Error fetching reports', { error, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single report by ID
router.get('/reports/:id', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const serviceProviderId = await getServiceProviderId(req.userId);
    if (!serviceProviderId) {
      return res.status(404).json({ message: 'Service Provider not found' });
    }

    const claim = await prisma.claim.findFirst({
      where: {
        id: req.params.id,
        assignedToId: serviceProviderId,
        inspectionReport: { not: null as any },
      },
      include: {
        farmer: { select: { id: true, name: true, email: true, mobileNumber: true } },
        policy: { select: { id: true, policyNumber: true, cropType: true, sumInsured: true, premium: true } },
      },
    });

    if (!claim) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({
      _id: claim.id,
      id: claim.id,
      name: `Inspection Report - ${claim.claimId}`,
      type: 'Inspection Report',
      date: claim.updatedAt || claim.createdAt,
      status: claim.status,
      claimId: claim.claimId,
      farmer: claim.farmer,
      policy: claim.policy,
      content: claim.inspectionReport,
      claim,
    });
  } catch (error) {
    Logger.error('Error fetching report', { error, reportId: req.params.id, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
