import { Router } from 'express';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';
import { Logger } from '../utils/logger';
import { InsurerService } from '../services/insurer.service';
import { prisma } from '../db';
import { ClaimStatus, VerificationStatus, UserRole, UserStatus } from '@prisma/client';
import { auditLogService } from '../services/auditLog.service';
import { AadhaarService } from '../services/aadhaar.service';

import { KmsService } from '../services/kms.service';
import { NotificationService } from '../services/notification.service';

const router = Router();
const insurerService = new InsurerService();

// Helper function to get insurer ID from user ID
// Auto-creates Insurer document if it doesn't exist
const getInsurerId = async (userId: string): Promise<string | null> => {
  let ins = await prisma.insurer.findUnique({ where: { userId } });

  if (!ins) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== UserRole.INSURER) {
      return null;
    }
    ins = await prisma.insurer.create({
      data: {
        name: user.name,
        email: user.email || `${user.mobileNumber}@insurer.local`,
        phone: user.mobileNumber || '',
        address: '',
        serviceType: 'Crop Insurance',
        status: user.isApproved ? 'active' : 'pending',
        userId,
      },
    });
    Logger.sp.registered(`Auto-created Insurer record for user ${userId}`, { userId });
  }

  return ins.id;
};

// Helper function to check if insurer is active/approved
const isInsurerActive = async (userId: string): Promise<boolean> => {
  const ins = await prisma.insurer.findUnique({ where: { userId } });
  return ins?.status === 'active';
};

// Debug endpoint to check insurer status
router.get('/debug/status', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const ins = await prisma.insurer.findUnique({ where: { userId: req.userId } });
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    const isActive = await isInsurerActive(req.userId);
    const insurerId = await getInsurerId(req.userId);

    // Count claims assigned to this Insurer and forwarded by Admin
    const assignedClaimsCount = insurerId ?
      await prisma.claim.count({
        where: {
          assignedToId: insurerId,
          verificationStatus: { in: [VerificationStatus.AI_Satellite_Processed, VerificationStatus.Verified] }
        }
      }) : 0;

    res.json({
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
        isApproved: user?.isApproved,
      },
      insurer: ins ? {
        id: ins.id,
        name: ins.name,
        status: ins.status,
        userId: ins.userId,
      } : null,
      isActive,
      insurerId,
      assignedClaimsCount,
    });
  } catch (error) {
    Logger.error('Error checking SP status', { error, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Get insurer profile
router.get('/profile', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const profile = await insurerService.getInsurerProfile(req.userId);
    if (!profile) {
      return res.status(404).json({ message: 'Insurer profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update insurer profile
router.put('/profile', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const {
      name, email, phone, address,
      businessName, serviceDescription,
      licenseExpiryDate, state, district, serviceArea
    } = req.body;

    // 1. Update User record
    const userUpdateData: any = {};
    if (name) userUpdateData.name = name;
    if (email) userUpdateData.email = email.toLowerCase();
    if (phone) userUpdateData.mobileNumber = phone;

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: req.userId },
        data: userUpdateData,
      });
    }

    // 2. Update Insurer record
    const insurerUpdateData: any = {};
    if (name) insurerUpdateData.name = name;
    if (email) insurerUpdateData.email = email.toLowerCase();
    if (phone) insurerUpdateData.phone = phone;
    if (address !== undefined) insurerUpdateData.address = address;
    if (businessName !== undefined) insurerUpdateData.businessName = businessName;
    if (serviceDescription !== undefined) insurerUpdateData.serviceDescription = serviceDescription;
    if (licenseExpiryDate !== undefined) insurerUpdateData.licenseExpiryDate = licenseExpiryDate ? new Date(licenseExpiryDate) : null;
    if (state !== undefined) insurerUpdateData.state = state;
    if (district !== undefined) insurerUpdateData.district = district;
    if (serviceArea !== undefined) insurerUpdateData.serviceArea = serviceArea;

    const updatedProfile = await prisma.insurer.update({
      where: { userId: req.userId },
      data: insurerUpdateData,
    });

    // Check for sensitive field changes (Business Name or License Expiry)
    if (businessName !== undefined || licenseExpiryDate !== undefined) {
      // 1. Log specialized audit entry
      await auditLogService.log({
        userId: req.userId,
        action: 'sp_profile_sensitive_update',
        details: {
          businessNameUpdated: businessName !== undefined,
          licenseExpiryUpdated: licenseExpiryDate !== undefined,
          newBusinessName: businessName,
          newLicenseExpiry: licenseExpiryDate
        },
        resourceType: 'insurer',
        resourceId: updatedProfile.id
      });

      // 2. Notify Admins
      try {
        const admins = await prisma.user.findMany({
          where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] }, status: 'active' },
          select: { id: true }
        });

        await Promise.all(admins.map(admin =>
          NotificationService.create(
            admin.id,
            'Insurer Profile Update (Sensitive)',
            `Insurer "${updatedProfile.name}" has updated their ${businessName !== undefined ? 'Business Name' : ''}${businessName !== undefined && licenseExpiryDate !== undefined ? ' and ' : ''}${licenseExpiryDate !== undefined ? 'License Expiry' : ''}. Please verify for compliance.`,
            'warning'
          )
        ));
      } catch (notifError) {
        Logger.error('Failed to notify admins of sensitive SP profile update', { notifError, userId: req.userId });
      }
    }

    res.json({ message: 'Profile updated successfully', profile: updatedProfile });
  } catch (error: any) {
    Logger.error('Error updating insurer profile', { error, userId: req.userId });
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Email or phone number already in use' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Get assigned claims for an insurer
router.get('/claims/assigned', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const insurerId = await getInsurerId(req.userId);
    if (!insurerId) {
      return res.status(404).json({ message: 'Insurer not found' });
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

    const { claims, totalClaims } = await insurerService.getAssignedClaims(insurerId, page, limit, sort);
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

// Update claim status by insurer
router.put('/claims/:id/status', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const insurerId = await getInsurerId(req.userId);
    if (!insurerId) {
      return res.status(404).json({ message: 'Insurer not found' });
    }

    const updatedClaim = await insurerService.updateClaimStatus(id, insurerId, status, notes);
    if (!updatedClaim) {
      return res.status(404).json({ message: 'Claim not found or not assigned to this insurer' });
    }

    // Log Insurer action
    await auditLogService.logFromRequest(req, 'claim_status_updated', { status, notes }, 'claim', id);

    res.json({ message: 'Claim status updated successfully', claim: updatedClaim });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit inspection report by insurer
router.post('/claims/:id/report', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { report } = req.body;
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const insurerId = await getInsurerId(req.userId);
    if (!insurerId) {
      return res.status(404).json({ message: 'Insurer not found' });
    }

    const updatedClaim = await insurerService.submitInspectionReport(id, insurerId, report);
    if (!updatedClaim) {
      return res.status(404).json({ message: 'Claim not found or not assigned to this insurer' });
    }
    res.json({ message: 'Inspection report submitted successfully', claim: updatedClaim });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all claims for insurer (with pagination, search, filter)
router.get('/claims', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if Insurer is active/approved
    const isActive = await isInsurerActive(req.userId);
    if (!isActive) {
      return res.status(403).json({ message: 'Insurer account is pending approval. Please contact administrator.' });
    }

    const insurerId = await getInsurerId(req.userId);
    if (!insurerId) {
      return res.status(404).json({ message: 'Insurer not found' });
    }

    Logger.sp.claim(`Active Insurer ${req.userId} (insurerId: ${insurerId}) fetching assigned claims`);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where: any = { assignedToId: insurerId };

    Logger.sp.claim(`Query filter: assignedToId = ${insurerId}`);

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
      insurerId,
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
router.get('/claims/:id', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const insurerId = await getInsurerId(req.userId);
    if (!insurerId) {
      return res.status(404).json({ message: 'Insurer not found' });
    }

    const claim = await prisma.claim.findFirst({
      where: { id: req.params.id, assignedToId: insurerId },
      include: {
        farmer: { select: { id: true, name: true, email: true, mobileNumber: true, mobileNumberEncrypted: true } },
        policy: {
          select: {
            id: true,
            policyNumber: true,
            cropType: true,
            sumInsured: true,
            premium: true,
            farmerId: true,
            insurerId: true,
            insuredArea: true,
            startDate: true,
            endDate: true,
            cropDetails: true
          }
        },
      },
    });

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found or not assigned to this insurer' });
    }

    res.json(claim);
  } catch (error) {
    Logger.error('Error fetching claim', { error, claimId: req.params.id, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Save draft verification report
router.put('/claims/:id/draft', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const insurerId = await getInsurerId(req.userId);
    if (!insurerId) {
      return res.status(404).json({ message: 'Insurer not found' });
    }

    const { damageConfirmation, verificationNotes, estimatedLoss, recommendations } = req.body;

    const claim = await prisma.claim.updateMany({
      where: { id: req.params.id, assignedToId: insurerId },
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
      where: { id: req.params.id, assignedToId: insurerId },
      include: {
        farmer: { select: { name: true, email: true, mobileNumber: true } },
        policy: { select: { policyNumber: true, cropType: true, sumInsured: true, premium: true } },
      },
    });

    if (!updated) {
      return res.status(404).json({ message: 'Claim not found or not assigned to this insurer' });
    }

    res.json({ message: 'Draft saved successfully', claim: updated });
  } catch (error) {
    Logger.error('Error saving draft', { error, claimId: req.params.id, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit verification report
router.post('/claims/:id/submit', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const insurerId = await getInsurerId(req.userId);
    if (!insurerId) {
      return res.status(404).json({ message: 'Insurer not found' });
    }

    const { damageConfirmation, verificationNotes, estimatedLoss, recommendations } = req.body;

    if (!damageConfirmation) {
      return res.status(400).json({ message: 'Damage confirmation is required' });
    }

    const updated = await prisma.claim.updateMany({
      where: { id: req.params.id, assignedToId: insurerId },
      data: {
        verificationData: {
          damageConfirmation,
          verificationNotes,
          estimatedLoss,
          recommendations,
          submittedAt: new Date(),
          lastUpdated: new Date(),
        },
        inspectionReport: {
          damageConfirmation,
          verificationNotes,
          estimatedLoss,
          recommendations,
          submittedAt: new Date(),
        },
        status: (damageConfirmation === 'yes' || damageConfirmation === 'partial' || damageConfirmation === 'confirmed') ? ClaimStatus.approved : ClaimStatus.rejected,
        verificationStatus: VerificationStatus.Verified,
      },
    });

    const claim = await prisma.claim.findFirst({
      where: { id: req.params.id, assignedToId: insurerId },
      include: {
        farmer: { select: { name: true, email: true, mobileNumber: true } },
        policy: { select: { policyNumber: true, cropType: true, sumInsured: true, premium: true, farmerId: true, insurerId: true } },
      },
    });

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found or not assigned to this insurer' });
    }

    // Log Insurer action
    await auditLogService.logFromRequest(req, 'verification_report_submitted', { damageConfirmation, estimatedLoss }, 'claim', req.params.id);

    // Notify Farmer
    await NotificationService.notifyClaimStatusChange(
      claim.farmerId,
      claim.claimId,
      claim.status,
      recommendations // Pass recommendations/reason
    );

    res.json({ message: 'Verification report submitted successfully', claim });
  } catch (error) {
    Logger.error('Error submitting report', { error, claimId: req.params.id, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark claim as fraud suspect
router.post('/claims/:id/fraud-suspect', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const insurerId = await getInsurerId(req.userId);
    if (!insurerId) {
      return res.status(404).json({ message: 'Insurer not found' });
    }

    await prisma.claim.updateMany({
      where: { id: req.params.id, assignedToId: insurerId },
      data: {
        status: ClaimStatus.fraud_suspect,
        verificationStatus: VerificationStatus.fraud_suspect,
        fraudFlaggedAt: new Date(),
      },
    });

    const claim = await prisma.claim.findFirst({
      where: { id: req.params.id, assignedToId: insurerId },
      include: {
        farmer: { select: { name: true, email: true, mobileNumber: true } },
        policy: { select: { policyNumber: true, cropType: true, sumInsured: true, premium: true, farmerId: true, insurerId: true } },
      },
    });

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found or not assigned to this insurer' });
    }

    // Notify Farmer
    await NotificationService.notifyClaimStatusChange(
      claim.farmerId,
      claim.claimId,
      'fraud_suspect',
      'Pending verification'
    );

    res.json({ message: 'Claim marked as fraud suspect', claim });
  } catch (error) {
    Logger.error('Error marking fraud suspect', { error, claimId: req.params.id, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Process Payout (Settlement)
router.post('/claims/:id/payout', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const insurerId = await getInsurerId(req.userId);
    if (!insurerId) {
      return res.status(404).json({ message: 'Insurer not found' });
    }

    const { transactionId, amount, notes } = req.body;
    if (!transactionId || !amount) {
      return res.status(400).json({ message: 'Transaction ID and Amount are required' });
    }

    // Verify claim ownership and get policy details
    const claim = await prisma.claim.findFirst({
      where: { id: req.params.id, assignedToId: insurerId },
      include: { policy: { select: { sumInsured: true, policyNumber: true } } }
    });

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found or not assigned to you' });
    }

    if (claim.status !== ClaimStatus.approved) {
      return res.status(400).json({ message: 'Only APPROVED claims can be settled.' });
    }

    // Safety Check: Payout amount cannot exceed Sum Insured
    const payoutAmount = parseFloat(amount);
    if (payoutAmount > claim.policy.sumInsured) {
      return res.status(400).json({
        message: `Payout amount (₹${payoutAmount}) cannot exceed Policy Sum Insured (₹${claim.policy.sumInsured})`
      });
    }

    const updatedClaim = await (prisma.claim as any).update({
      where: { id: req.params.id },
      data: {
        payoutStatus: 'paid',
        payoutTransactionId: transactionId,
        payoutAmount: parseFloat(amount),
        payoutDate: new Date(),
        status: ClaimStatus.resolved,
        resolutionDetails: `Payout Processed. Txn: ${transactionId}. Notes: ${notes || ''}`,
        resolutionDate: new Date(),
      },
      include: {
        farmer: { select: { name: true, email: true } }
      }
    });

    // Notify Farmer
    await NotificationService.create(
      claim.farmerId,
      'Claim Payout Processed 💰',
      `Your claim payout of ₹${amount} has been processed. Transaction ID: ${transactionId}. The amount will reflect in your bank account shortly.`,
      'success'
    );

    // Audit Log
    await auditLogService.logFromRequest(req, 'claim_payout_processed', { transactionId, amount }, 'claim', req.params.id);

    res.json({ message: 'Payout processed successfully', claim: updatedClaim });
  } catch (error) {
    Logger.error('Error processing payout', { error, claimId: req.params.id, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete claim (soft delete - mark as cancelled)
router.delete('/claims/:id', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const insurerId = await getInsurerId(req.userId);
    if (!insurerId) {
      return res.status(404).json({ message: 'Insurer not found' });
    }

    // Instead of actually deleting, mark as cancelled
    const updated = await (prisma.claim as any).updateMany({
      where: { id: req.params.id, assignedToId: insurerId },
      data: {
        status: ClaimStatus.cancelled,
        deletedAt: new Date(),
      },
    });

    if (updated.count === 0) {
      return res.status(404).json({ message: 'Claim not found or not assigned to this insurer' });
    }

    res.json({ message: 'Claim cancelled successfully' });
  } catch (error) {
    Logger.error('Error deleting claim', { error, claimId: req.params.id, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all farmers assigned to this insurer
router.get('/farmers', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const insurerId = await getInsurerId(req.userId);
    if (!insurerId) {
      return res.status(404).json({ message: 'Insurer not found' });
    }

    // 1. Get farmers from existing policies
    const policies = await prisma.policy.findMany({
      where: { insurerId },
      select: { farmerId: true },
    });

    // 2. Get farmers from policy requests sent to this insurer
    const requests = await prisma.policyRequest.findMany({
      where: { insurerId },
      select: { farmerId: true },
    });

    // Combine and unique IDs
    const farmerIds = [...new Set([
      ...policies.map((p) => p.farmerId),
      ...requests.map((r) => r.farmerId)
    ])];

    const farmers = await prisma.user.findMany({
      where: { id: { in: farmerIds }, role: UserRole.FARMER },
      include: { farmDetails: true },
      orderBy: { name: 'asc' },
    });

    // Flatten farmDetails into the user object for easier frontend consumption
    const mappedFarmers = farmers.map(f => {
      const { farmDetails, ...user } = f;
      return {
        ...user,
        ...farmDetails,
        id: f.id, // Ensure id is preserved
      };
    });

    res.json(mappedFarmers);
  } catch (error) {
    Logger.error('Error fetching farmers', { error, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single farmer by ID
router.get('/farmers/:id', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const insurerId = await getInsurerId(req.userId);
    if (!insurerId) {
      return res.status(404).json({ message: 'Insurer not found' });
    }

    const farmerId = req.params.id;

    const policy = await prisma.policy.findFirst({ where: { farmerId, insurerId } });
    if (!policy) {
      return res.status(403).json({ message: 'Access denied: This farmer is not assigned to you' });
    }

    const farmer = await prisma.user.findUnique({
      where: { id: farmerId },
      include: { farmDetails: true },
    });

    if (!farmer || farmer.role !== UserRole.FARMER) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    const { farmDetails, ...userDetails } = farmer;
    const fullFarmer = {
      ...userDetails,
      ...farmDetails,
      id: farmer.id,
    };

    const [policies, claims] = await Promise.all([
      prisma.policy.findMany({ where: { farmerId, insurerId } }),
      prisma.claim.findMany({ where: { farmerId, assignedToId: insurerId } }),
    ]);

    res.json({
      farmer: fullFarmer,
      policies,
      claims,
      farmDetails,
    });
  } catch (error) {
    Logger.error('Error fetching farmer', { error, farmerId: req.params.id, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update a farmer (for insurer to add farmers)
router.post('/farmers', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const insurerId = await getInsurerId(req.userId);
    if (!insurerId) {
      return res.status(404).json({ message: 'Insurer not found' });
    }

    const {
      name, mobileNumber, email, gender, dob,
      aadhaarNumber, casteCategory, farmerType, farmerCategory, loaneeStatus,
      address, village, tehsil, district, state, pincode,
      farmName, cropType, cropName, cropVariety, cropSeason, insuranceUnit,
      landRecordKhasra, landRecordKhatauni, surveyNumber, landAreaSize,
      latitude, longitude, insuranceLinked, wildAnimalAttackCoverage,
      bankName, bankAccountNo, bankIfsc
    } = req.body;

    if (!name || !mobileNumber || !aadhaarNumber) {
      return res.status(400).json({ message: 'Name, mobile number, and Aadhaar number are required' });
    }

    const trimmedMobile = mobileNumber.trim();
    const aadhaarHash = AadhaarService.hashAadhaar(aadhaarNumber);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { mobileNumber: trimmedMobile },
          { farmDetails: { aadhaarHash } }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ message: 'A farmer with this mobile number or Aadhaar already exists' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          mobileNumber: trimmedMobile,
          mobileNumberEncrypted: KmsService.encrypt(trimmedMobile),
          email: email?.trim().toLowerCase() || null,
          gender: gender || null,
          dateOfBirth: dob || null,
          role: UserRole.FARMER,
          status: UserStatus.active,
          isApproved: true,
        }
      });

      // Create farm details
      await tx.farmDetails.create({
        data: {
          farmerId: user.id,
          aadhaarHash,
          farmName: farmName || null,
          address: address || null,
          village: village || null,
          tehsil: tehsil || null,
          district: district || null,
          state: state || null,
          pincode: pincode || null,
          casteCategory: casteCategory || null,
          farmerType: farmerType || null,
          farmerCategory: farmerCategory || null,
          loaneeStatus: loaneeStatus || null,
          insuranceUnit: insuranceUnit || null,
          landRecordKhasra: landRecordKhasra || null,
          landRecordKhatauni: landRecordKhatauni || null,
          surveyNumber: surveyNumber || null,
          landAreaSize: landAreaSize ? parseFloat(landAreaSize) : null,
          latitude: latitude || null,
          longitude: longitude || null,
          cropType: cropType || null,
          cropName: cropName || null,
          cropVariety: cropVariety || null,
          cropSeason: cropSeason || null,
          insuranceLinked: insuranceLinked === true || insuranceLinked === 'true',
          wildAnimalAttackCoverage: wildAnimalAttackCoverage === true || wildAnimalAttackCoverage === 'true',
          bankName: bankName || null,
          bankAccountNo: bankAccountNo || null,
          bankIfsc: bankIfsc || null,
        } as any
      });

      return user;
    });

    res.status(201).json({ message: 'Farmer added successfully', farmer: result });
  } catch (error: any) {
    Logger.error('Error creating farmer', { error, userId: req.userId });
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'A user with this mobile number or Aadhaar already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update farmer
router.put('/farmers/:id', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const insurerId = await getInsurerId(req.userId);
    if (!insurerId) {
      return res.status(404).json({ message: 'Insurer not found' });
    }

    // Verify that this farmer has a policy with this insurer
    const policy = await prisma.policy.findFirst({ where: { farmerId: req.params.id, insurerId } });

    if (!policy) {
      return res.status(403).json({ message: 'Access denied: This farmer is not assigned to you' });
    }

    const {
      name, mobileNumber, email, gender, dob,
      casteCategory, farmerType, farmerCategory, loaneeStatus,
      address, village, tehsil, district, state, pincode,
      farmName, cropType, cropName, cropVariety, cropSeason, insuranceUnit,
      landRecordKhasra, landRecordKhatauni, surveyNumber, landAreaSize,
      latitude, longitude, insuranceLinked, wildAnimalAttackCoverage,
      bankName, bankAccountNo, bankIfsc
    } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // Update User
      const user = await tx.user.update({
        where: { id: req.params.id },
        data: {
          name: name?.trim(),
          email: email?.trim().toLowerCase(),
          mobileNumber: mobileNumber?.trim(),
          mobileNumberEncrypted: mobileNumber ? KmsService.encrypt(mobileNumber.trim()) : undefined,
          gender,
          dateOfBirth: dob,
        },
        select: { id: true, name: true, email: true, mobileNumber: true, status: true },
      });

      // Update FarmDetails
      await tx.farmDetails.update({
        where: { farmerId: req.params.id },
        data: {
          farmName,
          address,
          village,
          tehsil,
          district,
          state,
          pincode,
          casteCategory,
          farmerType,
          farmerCategory,
          loaneeStatus,
          insuranceUnit,
          landRecordKhasra,
          landRecordKhatauni,
          surveyNumber,
          landAreaSize: landAreaSize ? parseFloat(landAreaSize) : undefined,
          latitude,
          longitude,
          cropType,
          cropName,
          cropVariety,
          cropSeason,
          insuranceLinked: insuranceLinked !== undefined ? (insuranceLinked === true || insuranceLinked === 'true') : undefined,
          wildAnimalAttackCoverage: wildAnimalAttackCoverage !== undefined ? (wildAnimalAttackCoverage === true || wildAnimalAttackCoverage === 'true') : undefined,
          bankName,
          bankAccountNo,
          bankIfsc,
        } as any
      });

      return user;
    });

    res.json({ message: 'Farmer updated successfully', farmer: result });
  } catch (error) {
    Logger.error('Error updating farmer', { error, farmerId: req.params.id, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete farmer (soft delete - just remove from insurer's list)
router.delete('/farmers/:id', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const insurerId = await getInsurerId(req.userId);
    if (!insurerId) {
      return res.status(404).json({ message: 'Insurer not found' });
    }

    // Note: We don't actually delete the farmer, just remove their policies for this SP (soft delete)
    await (prisma.policy as any).updateMany({
      where: { farmerId: req.params.id, insurerId },
      data: { deletedAt: new Date() }
    });

    res.json({ message: 'Farmer removed from your list successfully' });
  } catch (error) {
    Logger.error('Error deleting farmer', { error, farmerId: req.params.id, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reports for insurer (inspection reports from claims)
router.get('/reports', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const insurerId = await getInsurerId(req.userId);
    if (!insurerId) {
      return res.status(404).json({ message: 'Insurer not found' });
    }

    // Get all claims with either inspection reports or forwarded AI reports
    const claims = await prisma.claim.findMany({
      where: {
        assignedToId: insurerId,
        OR: [
          { inspectionReport: { not: null as any } },
          { verificationStatus: VerificationStatus.AI_Satellite_Processed }
        ]
      },
      select: {
        id: true,
        claimId: true,
        inspectionReport: true,
        aiReport: true,
        status: true,
        verificationStatus: true,
        createdAt: true,
        updatedAt: true,
        farmer: { select: { id: true, name: true, email: true, mobileNumber: true } },
        policy: { select: { id: true, policyNumber: true, cropType: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map claims to reports, prioritizing inspection reports but including AI reports if forwarded
    const reports: any[] = [];

    claims.forEach((claim) => {
      // 1. Add Inspection Report REPLACEMENT: Only if claim is finalized (Approved/Rejected)
      const isFinalized = claim.status === 'approved' || claim.status === 'rejected';

      if (claim.inspectionReport && isFinalized) {
        reports.push({
          _id: `${claim.id}_inspection`,
          id: claim.id,
          name: `Final Inspection Report - ${claim.claimId}`,
          type: 'Inspection Report',
          date: claim.updatedAt || claim.createdAt,
          status: claim.status,
          claimId: claim.claimId,
          farmer: claim.farmer,
          policy: claim.policy,
          content: claim.inspectionReport,
          reportType: 'INSURER_INSPECTION'
        });
      }
    });

    res.json(reports);
  } catch (error) {
    Logger.error('Error fetching reports', { error, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single report by ID
router.get('/reports/:id', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const insurerId = await getInsurerId(req.userId);
    if (!insurerId) {
      return res.status(404).json({ message: 'Insurer not found' });
    }

    const reportId = req.params.id;
    const baseId = reportId.replace('_ai', '').replace('_inspection', '');

    const claim = await prisma.claim.findFirst({
      where: {
        id: baseId,
        assignedToId: insurerId,
        OR: [
          { inspectionReport: { not: null as any } },
          { verificationStatus: VerificationStatus.AI_Satellite_Processed }
        ],
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
