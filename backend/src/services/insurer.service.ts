import { prisma } from '../db';
import { NotificationService } from './notification.service';

interface IInspectionReport {
  [key: string]: string;
}

export class InsurerService {
  async getInsurerProfile(userId: string) {
    return prisma.insurer.findUnique({ where: { userId } });
  }

  async getAssignedClaims(insurerId: string, page: number, limit: number, sort: Record<string, 'asc' | 'desc'>) {
    const skip = (page - 1) * limit;
    const claims = await prisma.claim.findMany({
      where: { assignedToId: insurerId },
      include: { farmer: { select: { name: true, email: true, mobileNumber: true } } },
      orderBy: sort,
      skip,
      take: limit,
    });
    const totalClaims = await prisma.claim.count({ where: { assignedToId: insurerId } });
    return { claims, totalClaims };
  }

  async updateClaimStatus(claimId: string, insurerId: string, status: string, notes?: string) {
    const claim = await prisma.claim.findFirst({ where: { id: claimId, assignedToId: insurerId } });
    if (!claim) return null;

    // REJECTION FRICTION: If AI damage is high (>30%), require notes for rejection
    if (status === 'rejected') {
      const aiDamage = claim.aiDamagePercent || 0;
      if (aiDamage > 30 && (!notes || notes.trim().length < 10)) {
        throw new Error(`This claim has a high AI damage assessment (${aiDamage}%). You must provide a detailed rejection reason (min 10 characters) to proceed.`);
      }

      // If AI damage is very high (>70%), flag for manual Admin audit on rejection
      if (aiDamage > 70) {
        await prisma.claim.update({
          where: { id: claimId },
          data: { verificationStatus: 'fraud_suspect' as any } // Flag for Admin to double check
        });
      }
    }

    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: { status: status as any, notes: notes ? [notes] : [] },
      include: { farmer: { select: { name: true, email: true, mobileNumber: true } } },
    });

    // Notify Farmer
    await NotificationService.notifyClaimStatusChange(
      claim.farmerId,
      claim.claimId,
      status,
      notes
    );

    return updatedClaim;
  }

  async submitInspectionReport(claimId: string, insurerId: string, report: IInspectionReport) {
    const claim = await prisma.claim.findFirst({ where: { id: claimId, assignedToId: insurerId } });
    if (!claim) return null;

    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: { inspectionReport: report as any, status: 'Inspected' as any },
      include: { farmer: { select: { name: true, email: true, mobileNumber: true } } },
    });

    // Notify Farmer
    await NotificationService.notifyClaimStatusChange(
      claim.farmerId,
      claim.claimId,
      'Inspected',
      'Field inspection completed. Report is under review.'
    );

    return updatedClaim;
  }
}
