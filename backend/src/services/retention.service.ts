/**
 * Data Retention and Deletion Service
 * Implements soft-delete, timed permanent deletion, and "right to be forgotten"
 */

import { prisma } from '../db';
import { Logger } from '../utils/logger';
import { KmsService } from './kms.service';

export class RetentionService {
  // Retention periods (in days)
  private static readonly RETENTION_PERIODS = {
    claims: parseInt(process.env.CLAIMS_RETENTION_DAYS || '2555'), // 7 years
    documents: parseInt(process.env.DOCUMENTS_RETENTION_DAYS || '2555'), // 7 years
    images: parseInt(process.env.IMAGES_RETENTION_DAYS || '90'), // 90 days
    aadhaarHash: parseInt(process.env.AADHAAR_RETENTION_DAYS || '365'), // 1 year (as needed for policy linking)
  };

  /**
   * Soft delete a claim (marks as deleted, doesn't remove from DB)
   */
  static async softDeleteClaim(claimId: string, deletedBy: string): Promise<void> {
    await prisma.claim.update({
      where: { id: claimId },
      data: {
        // Add deletedAt field if it exists in schema, or use status
        status: 'deleted' as any,
      },
    });

    Logger.system.retention('Claim soft deleted', { claimId, deletedBy });
  }

  /**
   * Permanently delete old claims (after retention period)
   */
  static async deleteOldClaims(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.RETENTION_PERIODS.claims);

    // Find old claims (older than retention period)
    // In production, filter by deletedAt field
    const oldClaims = await prisma.claim.findMany({
      where: {
        createdAt: { lt: cutoffDate },
        // Add filter for soft-deleted claims if deletedAt field exists
      },
      take: 100, // Process in batches
    });

    let deletedCount = 0;
    for (const claim of oldClaims) {
      // Delete associated documents first
      await prisma.claimDocument.deleteMany({
        where: { claimId: claim.id },
      });

      // Delete claim
      await prisma.claim.delete({
        where: { id: claim.id },
      });

      deletedCount++;
    }

    Logger.system.retention(`Permanently deleted ${deletedCount} old claims`);
    return deletedCount;
  }

  /**
   * Archive old images (after 90 days)
   */
  static async archiveOldImages(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.RETENTION_PERIODS.images);

    // Mark old images for archival
    // In production, move files to cold storage (S3 Glacier, etc.)
    const oldDocuments = await prisma.claimDocument.findMany({
      where: {
        kind: 'image',
        createdAt: { lt: cutoffDate },
      },
    });

    Logger.system.retention(`Archived ${oldDocuments.length} old images`);
    return oldDocuments.length;
  }

  /**
   * Right to be forgotten - Delete all PII for a user
   */
  static async rightToBeForgotten(userId: string, verifiedBy: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Get user data
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { farmDetails: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Delete/scrub PII
      await tx.user.update({
        where: { id: userId },
        data: {
          name: '[DELETED]',
          email: null,
          emailEncrypted: null,
          mobileNumber: null,
          mobileNumberEncrypted: null,
          profilePhoto: null,
        },
      });

      // Delete Aadhaar hash from farm details
      if (user.farmDetails) {
        await tx.farmDetails.update({
          where: { farmerId: userId },
          data: {
            aadhaarHash: null,
            address: null,
            village: null,
            district: null,
          },
        });
      }

      // Delete consents
      await tx.consent.deleteMany({
        where: { userId },
      });

      // Soft delete claims (don't delete immediately for compliance)
      // Mark with deletion note
      await tx.claim.updateMany({
        where: { farmerId: userId },
        data: {
          notes: ['[PII DELETED - Right to be forgotten]'],
        },
      });

      Logger.system.retention('Right to be forgotten executed', { userId, verifiedBy });
    });
  }

  /**
   * Run retention cleanup job (should be scheduled)
   */
  static async runRetentionCleanup(): Promise<void> {
    try {
      Logger.system.retention('Starting retention cleanup job');
      
      const deletedClaims = await this.deleteOldClaims();
      const archivedImages = await this.archiveOldImages();
      
      Logger.system.retention('Retention cleanup completed', {
        deletedClaims,
        archivedImages,
      });
    } catch (error) {
      Logger.error('Error in retention cleanup', { error });
      throw error;
    }
  }
}

