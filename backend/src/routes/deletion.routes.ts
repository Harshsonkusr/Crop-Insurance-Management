/**
 * Data Deletion Routes
 * Implements "right to be forgotten" and retention management
 */

import { Router } from 'express';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';
import { RetentionService } from '../services/retention.service';
import { Logger } from '../utils/logger';
import { auditLogService } from '../services/auditLog.service';
import { prisma } from '../db';

const router = Router();

// Admin: Right to be forgotten (delete all PII for a user)
router.post('/deletion/right-to-be-forgotten/:userId', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    const { verificationCode, reason } = req.body;

    if (!verificationCode || verificationCode !== 'DELETE_PII_CONFIRM') {
      return res.status(400).json({ 
        message: 'Verification code required. Use "DELETE_PII_CONFIRM" to confirm deletion.' 
      });
    }

    if (!reason) {
      return res.status(400).json({ message: 'Reason for deletion is required' });
    }

    await RetentionService.rightToBeForgotten(userId, req.userId!);

    // Log deletion action
    await auditLogService.logFromRequest(
      req,
      'right_to_be_forgotten',
      { deletedUserId: userId, reason },
      'user',
      userId
    );

    res.json({ message: 'User PII deleted successfully' });
  } catch (error: any) {
    Logger.error('Error executing right to be forgotten', { error, userId: req.params.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Run retention cleanup manually
router.post('/deletion/retention-cleanup', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const result = await RetentionService.runRetentionCleanup();
    
    await auditLogService.logFromRequest(
      req,
      'retention_cleanup_manual',
      { result },
      'system',
      'retention'
    );

    res.json({ message: 'Retention cleanup completed', result });
  } catch (error: any) {
    Logger.error('Error in retention cleanup', { error });
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get retention statistics
router.get('/deletion/retention-stats', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    // Get counts of items eligible for deletion
    const claimsCutoff = new Date();
    claimsCutoff.setDate(claimsCutoff.getDate() - 2555); // 7 years

    const oldClaimsCount = await prisma.claim.count({
      where: {
        createdAt: { lt: claimsCutoff },
      },
    });

    const imagesCutoff = new Date();
    imagesCutoff.setDate(imagesCutoff.getDate() - 90); // 90 days

    const oldImagesCount = await prisma.claimDocument.count({
      where: {
        kind: 'image',
        createdAt: { lt: imagesCutoff },
      },
    });

    res.json({
      oldClaimsEligibleForDeletion: oldClaimsCount,
      oldImagesEligibleForArchival: oldImagesCount,
      retentionPeriods: {
        claims: '7 years',
        documents: '7 years',
        images: '90 days',
        aadhaarHash: '1 year',
      },
    });
  } catch (error: any) {
    Logger.error('Error fetching retention stats', { error });
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

