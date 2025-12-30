import { prisma } from '../db';
import { Logger } from '../utils/logger';
import { auditLogService } from './auditLog.service';

export class AdminReviewService {

  /**
   * Get all claims that are pending admin review (AI processed but not yet forwarded to SP)
   */
  async getPendingAdminReviews(page: number = 1, limit: number = 10, sort: any = { createdAt: 'desc' }) {
    const skip = (page - 1) * limit;
    const where = { verificationStatus: 'AI_Processed_Admin_Review' as const };

    const claims = await prisma.claim.findMany({
      where,
      orderBy: sort,
      skip,
      take: limit,
      include: {
        farmer: { select: { name: true, email: true, mobileNumber: true } },
        assignedTo: { select: { name: true, email: true, phone: true } },
        policy: { select: { policyNumber: true, cropType: true, sumInsured: true } },
        documents: {
          select: {
            id: true,
            path: true,
            kind: true,
            fileName: true
          }
        },
      },
    });

    const totalClaims = await prisma.claim.count({ where });

    // Transform claims to include documents and images separately
    const transformedClaims = claims.map(claim => ({
      ...claim,
      documents: claim.documents.filter((d) => d.kind === 'document').map((d) => d.path) || [],
      images: claim.documents.filter((d) => d.kind === 'image').map((d) => d.path) || [],
    }));

    return { claims: transformedClaims, totalClaims };
  }

  /**
   * Get a specific claim for admin review with full AI details
   */
  async getClaimForAdminReview(claimId: string) {
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: {
        farmer: { select: { name: true, email: true, mobileNumber: true } },
        assignedTo: { select: { name: true, email: true, phone: true } },
        policy: {
          select: {
            policyNumber: true,
            cropType: true,
            sumInsured: true,
            serviceProvider: { select: { name: true, email: true } }
          }
        },
        documents: {
          select: {
            id: true,
            path: true,
            kind: true,
            fileName: true,
            fileSize: true,
            mimeType: true
          }
        },
      },
    });

    if (!claim) {
      throw new Error('Claim not found');
    }

    if (claim.verificationStatus !== 'AI_Processed_Admin_Review') {
      throw new Error('Claim is not pending admin review');
    }

    // Transform documents and images
    const documents = claim.documents.filter((d) => d.kind === 'document').map((d) => d.path) || [];
    const images = claim.documents.filter((d) => d.kind === 'image').map((d) => d.path) || [];

    return {
      ...claim,
      documents,
      images,
    };
  }

  /**
   * Admin forwards AI report to Service Provider for final processing
   */
  async forwardReportToServiceProvider(
    claimId: string,
    adminId: string,
    adminNotes?: string,
    overrideData?: {
      damagePercent?: number;
      recommendedAmount?: number;
      validationFlags?: any;
    }
  ) {
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: { assignedTo: true }
    });

    if (!claim) {
      throw new Error('Claim not found');
    }

    if (claim.verificationStatus !== 'AI_Processed_Admin_Review') {
      throw new Error('Claim is not pending admin review');
    }

    if (!claim.assignedToId) {
      throw new Error('Claim is not assigned to a service provider');
    }

    // Update claim status and admin review details
    const updateData: any = {
      verificationStatus: 'AI_Satellite_Processed',
      adminOverrideAt: new Date(),
    };

    // Add admin notes if provided
    if (adminNotes) {
      updateData.notes = [...(claim.notes || []), `Admin Review: ${adminNotes}`];
    }

    // Apply admin overrides if provided
    if (overrideData) {
      if (overrideData.damagePercent !== undefined) {
        updateData.aiDamagePercent = overrideData.damagePercent;
      }
      if (overrideData.recommendedAmount !== undefined) {
        updateData.aiRecommendedAmount = overrideData.recommendedAmount;
      }
      if (overrideData.validationFlags !== undefined) {
        updateData.aiValidationFlags = overrideData.validationFlags;
      }
      updateData.adminOverrideReason = 'Admin reviewed and forwarded AI report to Service Provider';
    }

    await prisma.claim.update({
      where: { id: claimId },
      data: updateData,
    });

    // Log the admin action
    await auditLogService.log({
      userId: adminId,
      action: 'ADMIN_FORWARD_AI_REPORT',
      details: {
        claimId,
        claimIdFormatted: claim.claimId,
        assignedToSP: claim.assignedTo?.name,
        adminNotes,
        overrides: overrideData,
      },
      resourceType: 'claim',
      resourceId: claimId,
    });

    Logger.admin.action(`Admin ${adminId} forwarded AI report for claim ${claim.claimId} to SP ${claim.assignedTo?.name}`, {
      adminId,
      claimId,
      claimIdFormatted: claim.claimId,
      serviceProviderId: claim.assignedToId,
      serviceProviderName: claim.assignedTo?.name,
      adminNotes,
      overrides: overrideData,
    });

    return { success: true, message: 'AI report forwarded to Service Provider' };
  }

  /**
   * Admin rejects AI report and sends back for manual review
   */
  async rejectReportForManualReview(
    claimId: string,
    adminId: string,
    rejectionReason: string,
    adminNotes?: string
  ) {
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: { assignedTo: true }
    });

    if (!claim) {
      throw new Error('Claim not found');
    }

    if (claim.verificationStatus !== 'AI_Processed_Admin_Review') {
      throw new Error('Claim is not pending admin review');
    }

    // Update claim status to manual review
    const updateData: any = {
      verificationStatus: 'Manual_Review',
      adminOverrideAt: new Date(),
      adminOverrideReason: `Admin rejected AI report: ${rejectionReason}`,
    };

    if (adminNotes) {
      updateData.notes = [...(claim.notes || []), `Admin Rejection: ${adminNotes}`];
    }

    await prisma.claim.update({
      where: { id: claimId },
      data: updateData,
    });

    // Log the admin action
    await auditLogService.log({
      userId: adminId,
      action: 'ADMIN_REJECT_AI_REPORT',
      details: {
        claimId,
        claimIdFormatted: claim.claimId,
        rejectionReason,
        adminNotes,
      },
      resourceType: 'claim',
      resourceId: claimId,
    });

    Logger.admin.action(`Admin ${adminId} rejected AI report for claim ${claim.claimId} and sent for manual review`, {
      adminId,
      claimId,
      claimIdFormatted: claim.claimId,
      rejectionReason,
      adminNotes,
    });

    return { success: true, message: 'AI report rejected and sent for manual review' };
  }

  /**
   * Get admin review statistics
   */
  async getReviewStats() {
    const [
      pendingReviews,
      forwardedToday,
      rejectedToday,
      totalProcessed,
    ] = await Promise.all([
      prisma.claim.count({ where: { verificationStatus: 'AI_Processed_Admin_Review' } }),
      prisma.claim.count({
        where: {
          verificationStatus: 'AI_Satellite_Processed',
          adminOverrideAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        }
      }),
      prisma.claim.count({
        where: {
          verificationStatus: 'Manual_Review',
          adminOverrideAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        }
      }),
      prisma.claim.count({
        where: {
          OR: [
            { verificationStatus: 'AI_Satellite_Processed' },
            { verificationStatus: 'Manual_Review' }
          ],
          adminOverrideAt: { not: null }
        }
      }),
    ]);

    return {
      pendingReviews,
      forwardedToday,
      rejectedToday,
      totalProcessed,
    };
  }
}

export const adminReviewService = new AdminReviewService();
