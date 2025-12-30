import { prisma } from '../db';
import { AiSatelliteService } from './aiSatellite.service';
import { ClaimStatus, VerificationStatus } from '@prisma/client';
import { auditLogService } from './auditLog.service';
import { aiTaskQueueService } from './aiTaskQueue.service';
import { Logger } from '../utils/logger';

export class ClaimService {
  private aiSatelliteService: AiSatelliteService;

  constructor() {
    this.aiSatelliteService = new AiSatelliteService();
  }

  async createClaim(
    claimData: {
      policyId: string;
      dateOfIncident: Date;
      description: string;
      locationOfIncident: string;
      amountClaimed?: number;
      chosenPolicyId?: string; // For policy conflict resolution
    },
    farmerId: string,
    documents: string[],
    images: string[],
    idempotencyKey?: string
  ) {
    // Generate unique claimId
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const claimId = `CLM-${new Date().getFullYear()}-${timestamp.toString().slice(-6)}-${random}`;

    // Get policy data for AI matching (outside transaction)
    const policy = await prisma.policy.findUnique({
      where: { id: claimData.policyId },
      include: { serviceProvider: true },
    });

    if (!policy) {
      throw new Error('Policy not found');
    }

    // Verify policy belongs to farmer
    if (policy.farmerId !== farmerId) {
      throw new Error('Policy does not belong to this farmer');
    }

    // Verify policy is active
    if (policy.status !== 'Active') {
      throw new Error('Policy is not active');
    }

    // POLICY CONFLICT RESOLUTION: Check for multiple active policies covering same loss area
    // If multiple active policies exist, use chosen_policy_id or earliest matching insurer
    let chosenPolicyId: string | undefined = claimData.chosenPolicyId;
    
    if (!chosenPolicyId) {
      // Check for multiple active policies for this farmer
      const activePolicies = await prisma.policy.findMany({
        where: {
          farmerId,
          status: 'Active',
          startDate: { lte: claimData.dateOfIncident },
          endDate: { gte: claimData.dateOfIncident },
        },
        orderBy: { startDate: 'asc' }, // Earliest first
      });

      if (activePolicies.length > 1) {
        // Multiple policies found - use earliest matching insurer or require selection
        // For now, use the policyId provided (farmer selected it)
        chosenPolicyId = claimData.policyId;
        // In frontend, we should show policy selection UI when multiple policies exist
      } else if (activePolicies.length === 1) {
        chosenPolicyId = activePolicies[0].id;
      } else {
        chosenPolicyId = claimData.policyId; // Fallback to provided policy
      }
    }

    // RULE: Auto-assign claim to the insurer (SP) who issued the policy
    // INTERNAL POLICY CLAIM: Auto-route to SP who issued the internal policy
    // EXTERNAL POLICY CLAIM: Auto-route to insurer who originally created that policy
    // Both internal and external policies have serviceProviderId pointing to the insurer SP
    const assignedToId = policy.serviceProviderId;

    // Validate that service provider exists and is assigned
    if (!assignedToId) {
      throw new Error('Policy does not have an assigned service provider. Cannot create claim.');
    }

    // Verify the service provider exists
    const serviceProvider = await prisma.serviceProvider.findUnique({
      where: { id: assignedToId },
    });

    if (!serviceProvider) {
      throw new Error(`Service provider with ID ${assignedToId} not found. Cannot assign claim.`);
    }

    Logger.claim.created(`Creating claim for farmer ${farmerId}, assigning to SP ${assignedToId}`, {
      farmerId,
      policyId: claimData.policyId,
      assignedToId,
      policyServiceProviderId: policy.serviceProviderId,
      serviceProviderName: serviceProvider.name
    });

    const created = await prisma.$transaction(async (tx) => {

      const baseClaim = await tx.claim.create({
        data: {
          claimId,
          policyId: claimData.policyId,
          chosenPolicyId: chosenPolicyId || claimData.policyId, // Store chosen policy for conflict resolution
          farmerId,
          assignedToId, // Auto-assign to insurer
          description: claimData.description,
          locationOfIncident: claimData.locationOfIncident,
          dateOfIncident: claimData.dateOfIncident,
          dateOfClaim: new Date(),
          ...(claimData.amountClaimed && { amountClaimed: parseFloat(claimData.amountClaimed.toString()) } as any),
          status: ClaimStatus.pending,
          verificationStatus: VerificationStatus.Pending,
        } as any,
      });

      // Update idempotency key if provided (it was already created in the route handler with status 'pending')
      // Use upsert to handle both cases: key exists (update) or doesn't exist (create)
      if (idempotencyKey) {
        await tx.idempotencyKey.upsert({
          where: { key: idempotencyKey },
          update: {
            claimId: baseClaim.id,
            status: 'completed',
            // expiresAt remains the same as set during creation
          },
          create: {
            key: idempotencyKey,
            claimId: baseClaim.id,
            status: 'completed',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
        });
      }

      const docCreates = [
        ...documents.map((path) => ({ path, kind: 'document' as const })),
        ...images.map((path) => ({ path, kind: 'image' as const })),
      ];

      if (docCreates.length > 0) {
        await tx.claimDocument.createMany({
          data: docCreates.map((d) => ({ ...d, claimId: baseClaim.id })),
        });
      }

      return baseClaim;
    });

    // Get policy images for AI matching
    const policyImages = policy.policyImages as any[] || [];

    // Enqueue AI tasks for async processing (non-blocking - don't fail claim creation if this fails)
    if (images && images.length > 0) {
      try {
        // Enqueue OCR task
        await aiTaskQueueService.enqueueTask({
          claimId: created.id,
          taskType: 'ocr',
          inputData: { images, documents },
        });

        // Enqueue satellite analysis if location provided
        if (claimData.locationOfIncident) {
          await aiTaskQueueService.enqueueTask({
            claimId: created.id,
            taskType: 'satellite',
            inputData: {
              location: claimData.locationOfIncident,
              dateOfIncident: claimData.dateOfIncident,
              images,
              policyImages, // Include policy images for comparison
            },
          });
        }

        // Enqueue fraud detection with policy image matching
        await aiTaskQueueService.enqueueTask({
          claimId: created.id,
          taskType: 'fraud_detection',
          inputData: {
            claimData,
            images,
            documents,
            policyImages, // Policy images from policy creation for matching
            policyId: policy.id,
          },
        });
      } catch (aiError: any) {
        // Log AI task enqueueing errors but don't fail claim creation
        Logger.error('Failed to enqueue AI tasks for claim', {
          claimId: created.id,
          error: aiError.message,
          stack: aiError.stack
        });
      }
    }

    const claimWithDocs = await prisma.claim.findUnique({
      where: { id: created.id },
      include: { 
        documents: true,
        policy: { select: { policyNumber: true, cropType: true, sumInsured: true, serviceProviderId: true } },
        assignedTo: { 
          select: { 
            id: true,
            name: true, 
            email: true,
            userId: true
          } 
        },
        farmer: { select: { id: true, name: true, email: true, mobileNumber: true } },
      },
    });

    if (!claimWithDocs) {
      throw new Error('Claim was created but could not be retrieved');
    }

    // Verify claim was created with assignedToId
    if (!claimWithDocs.assignedToId) {
      Logger.error('Claim created without assignedToId', {
        claimId: claimWithDocs.id,
        claimIdFormatted: claimWithDocs.claimId,
        farmerId: claimWithDocs.farmerId,
        policyId: claimData.policyId
      });
      throw new Error('Claim was created but not assigned to a service provider');
    }

    Logger.claim.created(`Claim retrieved after creation: ${claimWithDocs.claimId}`, {
      claimId: claimWithDocs.id,
      claimIdFormatted: claimWithDocs.claimId,
      farmerId: claimWithDocs.farmerId,
      assignedToId: claimWithDocs.assignedToId,
      amountClaimed: (claimWithDocs as any).amountClaimed,
      status: claimWithDocs.status,
      assignedToName: claimWithDocs.assignedTo?.name
    });

    return {
      ...claimWithDocs,
      documents: claimWithDocs.documents.filter((d) => d.kind === 'document').map((d) => d.path) || [],
      images: claimWithDocs.documents.filter((d) => d.kind === 'image').map((d) => d.path) || [],
    };
  }

  async getClaims(query: any, page: number, limit: number, sort: any) {
    const skip = (page - 1) * limit;
    const where: any = query || {};

    const claims = await prisma.claim.findMany({
      where,
      orderBy: sort,
      skip,
      take: limit,
      include: {
        farmer: { select: { name: true, email: true, mobileNumber: true } },
        assignedTo: { select: { name: true, email: true, phone: true } },
      },
    });
    const totalClaims = await prisma.claim.count({ where });
    return { claims, totalClaims };
  }

  async getClaimById(id: string) {
    const claim = await prisma.claim.findUnique({
      where: { id },
      include: {
        farmer: { select: { name: true, email: true, mobileNumber: true } },
        assignedTo: { select: { name: true, email: true, phone: true } },
        documents: true,
      },
    });
    if (!claim) return null;
    return {
      ...claim,
      documents: claim.documents.filter((d) => d.kind === 'document').map((d) => d.path),
      images: claim.documents.filter((d) => d.kind === 'image').map((d) => d.path),
    };
  }

  async updateClaim(id: string, updateData: any) {
    const claim = await prisma.claim.update({ where: { id }, data: updateData }).catch(() => null);
    return claim;
  }

  async getMyClaims(farmerId: string) {
    try {
      Logger.claim.created(`Fetching claims for farmer ${farmerId}`, { farmerId });
      
      // First, check if there are any claims at all in the database
      const totalClaims = await prisma.claim.count();
      Logger.claim.created(`Total claims in database: ${totalClaims}`, { totalClaims });
      
      // Check claims for this specific farmer
      const claimsCount = await prisma.claim.count({ where: { farmerId } });
      Logger.claim.created(`Claims count for farmer ${farmerId}: ${claimsCount}`, { farmerId, claimsCount });
      
      // Get all claims for this farmer (without relations first to debug)
      const claimsRaw = await prisma.claim.findMany({
        where: { farmerId },
        select: {
          id: true,
          claimId: true,
          farmerId: true,
          policyId: true,
          assignedToId: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      
      Logger.claim.created(`Found ${claimsRaw.length} raw claims for farmer`, { 
        farmerId, 
        claimIds: claimsRaw.map(c => c.claimId),
        claimUuids: claimsRaw.map(c => c.id)
      });
      
      // Now get full claims with relations
      const claims = await prisma.claim.findMany({
        where: { farmerId },
        include: { 
          farmer: { 
            select: { 
              id: true,
              name: true, 
              email: true, 
              mobileNumber: true 
            } 
          },
          policy: { 
            select: { 
              id: true,
              policyNumber: true, 
              cropType: true, 
              sumInsured: true 
            } 
          },
          assignedTo: { 
            select: { 
              id: true,
              name: true, 
              email: true 
            } 
          },
          documents: {
            select: {
              id: true,
              path: true,
              kind: true,
              fileName: true
            }
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      
      Logger.claim.created(`Retrieved ${claims.length} claims with relations for farmer ${farmerId}`, {
        farmerId,
        claimCount: claims.length,
        claimIds: claims.map(c => c.claimId || c.id)
      });
      
      // Transform claims to include documents and images separately
      return claims.map(claim => ({
        ...claim,
        documents: claim.documents.filter((d) => d.kind === 'document').map((d) => d.path) || [],
        images: claim.documents.filter((d) => d.kind === 'image').map((d) => d.path) || [],
      }));
    } catch (error: any) {
      Logger.error('Error in getMyClaims', {
        error: error.message,
        stack: error.stack,
        farmerId
      });
      throw error;
    }
  }
}