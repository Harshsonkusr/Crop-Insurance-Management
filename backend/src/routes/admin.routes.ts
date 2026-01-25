import { Router } from 'express';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';
import { Logger } from '../utils/logger';
import { prisma } from '../db';
import { auditLogService } from '../services/auditLog.service';
import { ClaimStatus, VerificationStatus } from '@prisma/client';
import { MockAIService } from '../services/ai.service';

const router = Router();

// Get all claims with AI reports ready for admin review
router.get('/claims/ai-ready', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const [claims, total] = await Promise.all([
      prisma.claim.findMany({
        where: {
          verificationStatus: VerificationStatus.AI_Processed_Admin_Review,
        },
        include: {
          farmer: {
            select: {
              id: true,
              name: true,
              email: true,
              mobileNumber: true,
            },
          },
          policy: {
            select: {
              id: true,
              policyNumber: true,
              cropType: true,
              sumInsured: true,
              insurerId: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          documents: true,
          _count: {
            select: {
              documents: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.claim.count({
        where: {
          verificationStatus: VerificationStatus.AI_Processed_Admin_Review,
        },
      }),
    ]);

    res.json({
      claims,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    Logger.error('Error fetching AI ready claims for admin', { error });
    res.status(500).json({ message: 'Server error' });
  }
});

// Get detailed AI report for a specific claim
router.get('/claims/:claimId/ai-report', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { claimId } = req.params;

    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            email: true,
            mobileNumber: true,
          },
        },
        policy: {
          select: {
            id: true,
            policyNumber: true,
            cropType: true,
            sumInsured: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        documents: true,
      },
    });

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    if (claim.verificationStatus !== VerificationStatus.AI_Processed_Admin_Review) {
      return res.status(400).json({ message: 'Claim is not ready for admin review' });
    }

    // Fetch AI tasks separately since there's no direct relation
    const aiTasks = await prisma.aiTask.findMany({
      where: { claimId: claim.id },
      select: {
        id: true,
        taskType: true,
        status: true,
        outputData: true,
        completedAt: true,
        errorMessage: true,
      },
    });

    res.json({
      claim: {
        id: claim.id,
        claimId: claim.claimId,
        description: claim.description,
        locationOfIncident: claim.locationOfIncident,
        dateOfIncident: claim.dateOfIncident,
        amountClaimed: claim.amountClaimed,
        aiDamagePercent: claim.aiDamagePercent,
        aiRecommendedAmount: claim.aiRecommendedAmount,
        aiValidationFlags: claim.aiValidationFlags,
        aiReport: claim.aiReport,
        status: claim.status,
        verificationStatus: claim.verificationStatus,
        farmer: (claim as any).farmer,
        policy: (claim as any).policy,
        assignedTo: (claim as any).assignedTo,
        documents: (claim as any).documents,
        aiTasks: aiTasks,
        createdAt: claim.createdAt,
      },
    });
  } catch (error) {
    Logger.error('Error fetching AI report for admin', { error, claimId: req.params.claimId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Trigger AI Analysis for a claim
router.post('/claims/:claimId/analyze', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { claimId } = req.params;

    const claim = await prisma.claim.findUnique({
      where: { id: claimId }
    });

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Run Mock AI Analysis
    const aiReport = await MockAIService.analyzeClaim(claim);

    // Update Claim with Report and Status
    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: {
        verificationStatus: VerificationStatus.AI_Processed_Admin_Review,
        aiDamagePercent: aiReport.damageAssessment.aiEstimatedDamage,
        aiReport: aiReport as any, // Cast to any or Json input type
        aiValidationFlags: aiReport.fraudCheck.flags,
        // Also log this event
        updatedAt: new Date()
      }
    });

    // Log admin action
    await auditLogService.log({
      userId: req.userId!,
      action: 'RUN_AI_ANALYSIS',
      resourceType: 'CLAIM',
      resourceId: claimId,
      details: {
        aiDamageDetected: aiReport.damageAssessment.aiEstimatedDamage,
        isFraudSuspect: aiReport.fraudCheck.isSuspect
      },
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    res.json({
      message: 'AI Analysis completed successfully',
      report: aiReport,
      claim: updatedClaim
    });

  } catch (error) {
    Logger.error('Error running AI analysis', { error, claimId: req.params.claimId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Forward AI report to Insurer
router.post('/claims/:claimId/forward-to-insurer', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { claimId } = req.params;
    const { adminNotes } = req.body;

    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: {
        assignedTo: true,
        farmer: true,
        policy: true,
      },
    });

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    if (claim.verificationStatus !== VerificationStatus.AI_Processed_Admin_Review) {
      return res.status(400).json({ message: 'Claim is not ready for forwarding' });
    }

    if (!claim.assignedToId) {
      return res.status(400).json({ message: 'Claim is not assigned to an insurer' });
    }

    // Update claim verification status to AI_Satellite_Processed (ready for Insurer review)
    await prisma.claim.update({
      where: { id: claimId },
      data: {
        verificationStatus: VerificationStatus.AI_Satellite_Processed,
      },
    });

    // Log admin action
    await auditLogService.log({
      userId: req.userId!,
      action: 'FORWARD_AI_REPORT',
      resourceType: 'CLAIM',
      resourceId: claimId,
      details: {
        verificationStatus: {
          from: VerificationStatus.AI_Processed_Admin_Review,
          to: VerificationStatus.AI_Satellite_Processed
        },
        adminNotes: adminNotes || null,
      },
      changes: {
        before: { verificationStatus: VerificationStatus.AI_Processed_Admin_Review },
        after: { verificationStatus: VerificationStatus.AI_Satellite_Processed }
      },
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    Logger.info(`Admin ${req.userId} forwarded AI report for claim ${claimId} to Insurer ${claim.assignedToId}`, {
      claimId,
      adminId: req.userId,
      insurerId: claim.assignedToId,
    });

    res.json({
      message: 'AI report forwarded to insurer successfully',
      claimId: claim.claimId,
      forwardedTo: {
        id: claim.assignedTo!.id,
        name: claim.assignedTo!.name,
        email: claim.assignedTo!.email,
      },
    });
  } catch (error) {
    Logger.error('Error forwarding AI report to Insurer', { error, claimId: req.params.claimId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject AI report and send back for manual review
router.post('/claims/:claimId/reject-ai-report', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { claimId } = req.params;
    const { reason, adminNotes } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: {
        assignedTo: true,
        farmer: true,
        policy: true,
      },
    });

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    if (claim.verificationStatus !== VerificationStatus.AI_Processed_Admin_Review) {
      return res.status(400).json({ message: 'Claim is not ready for admin review' });
    }

    // Update claim verification status to Manual_Review
    await prisma.claim.update({
      where: { id: claimId },
      data: {
        verificationStatus: VerificationStatus.Manual_Review,
      },
    });

    // Log admin action
    await auditLogService.log({
      userId: req.userId!,
      action: 'REJECT_AI_REPORT',
      resourceType: 'CLAIM',
      resourceId: claimId,
      details: {
        verificationStatus: {
          from: VerificationStatus.AI_Processed_Admin_Review,
          to: VerificationStatus.Manual_Review
        },
        rejectionReason: reason,
        adminNotes: adminNotes || null,
      },
      changes: {
        before: { verificationStatus: VerificationStatus.AI_Processed_Admin_Review },
        after: { verificationStatus: VerificationStatus.Manual_Review }
      },
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    Logger.info(`Admin ${req.userId} rejected AI report for claim ${claimId}, sent for manual review`, {
      claimId,
      adminId: req.userId,
      reason,
    });

    res.json({
      message: 'AI report rejected and sent for manual review',
      claimId: claim.claimId,
      reason,
    });
  } catch (error) {
    Logger.error('Error rejecting AI report', { error, claimId: req.params.claimId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Get admin dashboard stats for AI claims
router.get('/dashboard/ai-stats', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const [
      aiReadyClaims,
      totalClaims,
      aiProcessedToday,
      aiRejectedToday,
    ] = await Promise.all([
      prisma.claim.count({
        where: { verificationStatus: VerificationStatus.AI_Processed_Admin_Review },
      }),
      prisma.claim.count(),
      prisma.claim.count({
        where: {
          verificationStatus: VerificationStatus.AI_Satellite_Processed,
          updatedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
          },
        },
      }),
      prisma.auditLog.count({
        where: {
          action: 'REJECT_AI_REPORT',
          timestamp: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
          },
        },
      }),
    ]);

    res.json({
      aiReadyClaims,
      totalClaims,
      aiProcessedToday,
      aiRejectedToday,
      aiProcessingRate: totalClaims > 0 ? ((aiReadyClaims + aiProcessedToday) / totalClaims * 100).toFixed(2) : '0.00',
    });
  } catch (error) {
    Logger.error('Error fetching admin AI stats', { error });
    res.status(500).json({ message: 'Server error' });
  }
});


export default router;
