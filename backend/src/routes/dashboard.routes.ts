import { Router } from 'express';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';
import { prisma } from '../db';

const router = Router();

// Get dashboard summary data (Admin and Super Admin only)
router.get('/summary', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const [totalUsers, totalClaims, totalServiceProviders, claimsByStatus, recentAuditLogs] = await Promise.all([
      prisma.user.count(),
      prisma.claim.count(),
      prisma.serviceProvider.count(),
      prisma.claim.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.auditLog.findMany({ orderBy: { timestamp: 'desc' }, take: 5 }),
    ]);

    res.json({
      totalUsers,
      totalClaims,
      totalServiceProviders,
      claimsByStatus,
      recentAuditLogs,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Service Provider dashboard overview
router.get('/service-provider/overview', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const serviceProvider = await prisma.serviceProvider.findUnique({ where: { userId: req.userId } });
    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service Provider profile not found' });
    }

    // Get assigned claims
    const serviceProviderId = serviceProvider.id;

    const [
      totalClaimsAssigned,
      claimsPendingVerification,
      claimsApproved,
      claimsRejected,
      aiFlaggedClaims,
      resolvedClaims,
    ] = await Promise.all([
      prisma.claim.count({ where: { assignedToId: serviceProviderId } }),
      prisma.claim.count({ where: { assignedToId: serviceProviderId, status: 'pending' } }),
      prisma.claim.count({ where: { assignedToId: serviceProviderId, status: 'approved' } }),
      prisma.claim.count({ where: { assignedToId: serviceProviderId, status: 'rejected' } }),
      prisma.claim.count({
        where: {
          assignedToId: serviceProviderId,
          verificationStatus: { in: ['Manual_Review', 'Pending'] },
        },
      }),
      prisma.claim.findMany({
        where: {
          assignedToId: serviceProviderId,
          status: { in: ['approved', 'rejected', 'resolved'] },
          resolutionDate: { not: null },
        },
        select: { resolutionDate: true, dateOfClaim: true },
      }),
    ]);

    let averageVerificationTime = '0 days';
    if (resolvedClaims.length > 0) {
      const totalTime = resolvedClaims.reduce((sum, claim) => {
        if (claim.resolutionDate && claim.dateOfClaim) {
          return sum + (claim.resolutionDate.getTime() - claim.dateOfClaim.getTime());
        }
        return sum;
      }, 0);
      const avgTimeMs = totalTime / resolvedClaims.length;
      const avgTimeDays = Math.round(avgTimeMs / (1000 * 60 * 60 * 24));
      averageVerificationTime = `${avgTimeDays} days`;
    }

    // Count notifications/alerts (placeholder - can be enhanced with actual notification system)
    const notificationsAlerts = claimsPendingVerification + aiFlaggedClaims;

    res.json({
      totalClaimsAssigned,
      claimsPendingVerification,
      claimsApproved,
      claimsRejected,
      aiFlaggedClaims,
      averageVerificationTime,
      notificationsAlerts,
    });
  } catch (error) {
    console.error('Error fetching service provider dashboard:', error);
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
