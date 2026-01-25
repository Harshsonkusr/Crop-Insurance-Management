import { Router } from 'express';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';
import { prisma } from '../db';

const router = Router();

// Get dashboard summary data (Admin and Super Admin only)
router.get('/summary', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const [totalUsers, totalClaims, totalInsurers, claimsByStatus, recentAuditLogs] = await Promise.all([
      prisma.user.count(),
      prisma.claim.count(),
      prisma.insurer.count(),
      prisma.claim.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.auditLog.findMany({ orderBy: { timestamp: 'desc' }, take: 5 }),
    ]);

    const formattedClaimsByStatus = claimsByStatus.reduce((acc, c) => {
      let status = c.status.toLowerCase();
      // Map DB statuses to frontend categories
      if (status === 'under_review' || status === 'in_progress' || status === 'inspected') {
        status = 'in_review';
      }

      const existing = acc.find(item => item._id === status);
      if (existing) {
        existing.count += c._count.status;
      } else {
        acc.push({ _id: status, count: c._count.status });
      }
      return acc;
    }, [] as { _id: string, count: number }[]);

    res.json({
      totalUsers,
      totalClaims,
      totalInsurers,
      claimsByStatus: formattedClaimsByStatus,
      recentAuditLogs,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Insurer dashboard overview
router.get('/insurer/overview', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const insurer = await prisma.insurer.findUnique({ where: { userId: req.userId } });
    if (!insurer) {
      return res.status(404).json({ message: 'Insurer profile not found' });
    }

    // Get assigned claims
    const insurerId = insurer.id;

    const [
      totalClaimsAssigned,
      claimsPendingVerification,
      claimsApproved,
      claimsRejected,
      aiFlaggedClaims,
      pendingPayoutsData,
    ] = await Promise.all([
      prisma.claim.count({ where: { assignedToId: insurerId } }),
      prisma.claim.count({ where: { assignedToId: insurerId, status: 'pending' } }),
      prisma.claim.count({ where: { assignedToId: insurerId, status: 'approved' } }),
      prisma.claim.count({ where: { assignedToId: insurerId, status: 'rejected' } }),
      prisma.claim.count({
        where: {
          assignedToId: insurerId,
          verificationStatus: { in: ['fraud_suspect', 'Manual_Review', 'AI_Processed_Admin_Review'] },
        },
      }),
      prisma.claim.aggregate({
        where: {
          assignedToId: insurerId,
          status: 'approved',
        },
        _sum: {
          amountClaimed: true,
        },
      }),
    ]);

    const pendingPayouts = (pendingPayoutsData as any)?._sum?.amountClaimed || 0;

    // Count notifications/alerts (placeholder - can be enhanced with actual notification system)
    const notificationsAlerts = claimsPendingVerification + aiFlaggedClaims;

    res.json({
      totalClaimsAssigned,
      claimsPendingVerification,
      claimsApproved,
      claimsRejected,
      aiFlaggedClaims,
      pendingPayouts,
      notificationsAlerts,
    });
  } catch (error) {
    console.error('Error fetching insurer dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Farmer dashboard quick stats
router.get('/farmer/quick-stats', authenticateToken, authorizeRoles(['FARMER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const farmerId = req.userId;

    const [totalClaims, pendingClaims, approvedClaims, rejectedClaims, totalPolicies, activePolicies] =
      await Promise.all([
        prisma.claim.count({ where: { farmerId } }),
        prisma.claim.count({ where: { farmerId, status: 'pending' } }),
        prisma.claim.count({ where: { farmerId, status: 'approved' } }),
        prisma.claim.count({ where: { farmerId, status: 'rejected' } }),
        prisma.policy.count({ where: { farmerId } }),
        prisma.policy.count({ where: { farmerId, status: 'Active' } }),
      ]);

    // Format as quick stats array
    const quickStats = [
      {
        title: 'Total Claims',
        value: totalClaims.toString(),
        iconName: 'PlusCircle'
      },
      {
        title: 'Pending Claims',
        value: pendingClaims.toString(),
        iconName: 'Clock'
      },
      {
        title: 'Approved Claims',
        value: approvedClaims.toString(),
        iconName: 'CheckCircle2'
      },
      {
        title: 'Active Policies',
        value: activePolicies.toString(),
        iconName: 'CheckCircle2'
      }
    ];

    res.json(quickStats);
  } catch (error) {
    console.error('Error fetching farmer quick stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
