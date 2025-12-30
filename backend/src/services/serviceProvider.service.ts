import { prisma } from '../db';

interface IInspectionReport {
  [key: string]: string;
}

export class ServiceProviderService {
  async getServiceProviderProfile(userId: string) {
    return prisma.serviceProvider.findUnique({ where: { userId } });
  }

  async getAssignedClaims(serviceProviderId: string, page: number, limit: number, sort: Record<string, 'asc' | 'desc'>) {
    const skip = (page - 1) * limit;
    const claims = await prisma.claim.findMany({
      where: { assignedToId: serviceProviderId },
      include: { farmer: { select: { name: true, email: true, mobileNumber: true } } },
      orderBy: sort,
      skip,
      take: limit,
    });
    const totalClaims = await prisma.claim.count({ where: { assignedToId: serviceProviderId } });
    return { claims, totalClaims };
  }

  async updateClaimStatus(claimId: string, serviceProviderId: string, status: string, notes?: string) {
    const claim = await prisma.claim.findFirst({ where: { id: claimId, assignedToId: serviceProviderId } });
    if (!claim) return null;
    return prisma.claim.update({
      where: { id: claimId },
      data: { status: status as any, notes: notes ? [notes] : [] },
      include: { farmer: { select: { name: true, email: true, mobileNumber: true } } },
    });
  }

  async submitInspectionReport(claimId: string, serviceProviderId: string, report: IInspectionReport) {
    const claim = await prisma.claim.findFirst({ where: { id: claimId, assignedToId: serviceProviderId } });
    if (!claim) return null;
    return prisma.claim.update({
      where: { id: claimId },
      data: { inspectionReport: report as any, status: 'Inspected' as any },
      include: { farmer: { select: { name: true, email: true, mobileNumber: true } } },
    });
  }
}
