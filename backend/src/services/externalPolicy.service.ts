/**
 * External Policy Service
 * Handles lookup and sync of policies from external insurers
 */

import { prisma } from '../db';
import { PolicySource, PolicySyncStatus } from '@prisma/client';
import { Logger } from '../utils/logger';
import { AadhaarService } from './aadhaar.service';
import { ConsentService, ConsentType } from './consent.service';
import { auditLogService } from './auditLog.service';

export class ExternalPolicyService {
  /**
   * Lookup policies from external insurer APIs
   * Requires mutual TLS or OAuth-signed request
   */
  static async lookupExternalPolicies(
    aadhaar: string,
    phone?: string,
    userId?: string
  ): Promise<any[]> {
    // Check consent first
    if (userId) {
      const hasConsent = await ConsentService.hasConsent(userId, 'aadhaar_lookup' as any);
      if (!hasConsent) {
        throw new Error('User consent required for Aadhaar lookup');
      }
    }

    // Hash Aadhaar for lookup
    const aadhaarHash = AadhaarService.hashAadhaar(aadhaar);

    // TODO: Integrate with actual external insurer APIs
    // This is a placeholder - in production, make authenticated API calls
    // Example:
    // const response = await fetch('https://insurer-api.com/policies', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${await getOAuthToken()}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ aadhaarHash, phone }),
    //   // Use mutual TLS in production
    // });

    // For now, return empty array (no external policies found)
    // In production, parse response and return policy data
    return [];
  }

  /**
   * Sync external policies for a farmer
   * RULE: External policies must auto-fetch using AadhaarHash / Phone when farmer logs in
   */
  static async syncExternalPolicies(
    farmerId: string,
    aadhaar: string,
    phone?: string
  ) {
    try {
      // Check if user has consent for policy sync
      const hasConsent = await ConsentService.hasConsent(farmerId, 'policy_sync' as any);
      if (!hasConsent) {
        Logger.policy.synced('Skipping external policy sync - no consent', { farmerId });
        return [];
      }

      // Get AadhaarHash from farmDetails if aadhaar not provided directly
      let aadhaarHash: string | null = null;
      if (!aadhaar) {
        const farmDetails = await prisma.farmDetails.findUnique({ where: { farmerId } });
        aadhaarHash = farmDetails?.aadhaarHash || null;
      } else {
        aadhaarHash = AadhaarService.hashAadhaar(aadhaar);
      }

      // If no AadhaarHash available, try phone lookup
      if (!aadhaarHash && !phone) {
        const user = await prisma.user.findUnique({ where: { id: farmerId } });
        phone = user?.mobileNumber || undefined;
      }

      const policies = await this.lookupExternalPolicies(aadhaar || '', phone, farmerId);

      if (!policies || policies.length === 0) {
        Logger.policy.synced('No external policies found to sync', { farmerId });
        return [];
      }

      Logger.policy.synced('Starting external policy sync', { farmerId, policyCount: policies.length });

      const syncedPolicies = [];

      for (const policyData of policies) {
        // RULE: External policies must automatically map to the insurer (SP) who issued them
        // Find or create service provider for external insurer
        let serviceProvider = await prisma.serviceProvider.findFirst({
          where: { email: policyData.insurerEmail },
        });

        if (!serviceProvider) {
          // Create placeholder SP for external insurer
          // In production, maintain a registry of external insurers
          // RULE: External policies auto-map to insurer SP
          const insurerUser = await prisma.user.create({
            data: {
              name: policyData.insurerName || 'External Insurer',
              email: policyData.insurerEmail,
              role: 'SERVICE_PROVIDER',
              status: 'active',
              isApproved: true,
            },
          });

          serviceProvider = await prisma.serviceProvider.create({
            data: {
              userId: insurerUser.id,
              name: policyData.insurerName || 'External Insurer',
              email: policyData.insurerEmail,
              phone: policyData.insurerPhone || '0000000000',
              serviceType: 'External Insurance',
              status: 'active',
              kycVerified: true,
            },
          });
        }

        // Create or update policy
        const policy = await prisma.policy.upsert({
          where: { policyNumber: policyData.policyNumber },
          update: {
            externalSyncAt: new Date(),
            syncStatus: 'synced',
            policyVerified: policyData.verified || false,
            insurerApiResponse: policyData,
          },
          create: {
            policyNumber: policyData.policyNumber,
            farmerId,
            serviceProviderId: serviceProvider.id,
            cropType: policyData.cropType,
            insuredArea: policyData.insuredArea,
            startDate: new Date(policyData.startDate),
            endDate: new Date(policyData.endDate),
            premium: policyData.premium,
            sumInsured: policyData.sumInsured,
            status: policyData.status || 'Active',
            source: 'external',
            externalSyncAt: new Date(),
            syncStatus: 'synced',
            policyVerified: policyData.verified || false,
            externalPolicyId: policyData.externalPolicyId,
            insurerApiResponse: policyData,
          },
        });

        syncedPolicies.push(policy);

        // Log sync
        await auditLogService.log({
          userId: farmerId,
          action: 'external_policy_synced',
          details: {
            policyId: policy.id,
            policyNumber: policy.policyNumber,
            source: 'external',
          },
        });
      }

      Logger.policy.synced('External policies synced successfully', { 
        farmerId, 
        count: syncedPolicies.length,
        syncedPolicyNumbers: syncedPolicies.map(p => p.policyNumber)
      });
      return syncedPolicies;
    } catch (error: any) {
      // Log detailed error information but don't throw - return empty array
      Logger.error('Failed to sync external policies (non-critical)', { 
        error: error?.message || String(error),
        errorStack: error?.stack,
        farmerId,
        hasAadhaar: !!aadhaar,
        hasPhone: !!phone
      });
      
      // Don't mark policies as stale or throw error - just return empty array
      // This ensures registration doesn't fail if external policy sync fails
      return [];
    }
  }

  /**
   * Background sync job for external policies
   */
  static async backgroundSync() {
    // Find all external policies that need syncing
    const policies = await prisma.policy.findMany({
      where: {
        source: 'external',
        OR: [
          { syncStatus: 'stale' },
          { externalSyncAt: null },
          {
            externalSyncAt: {
              lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Older than 24 hours
            },
          },
        ],
      },
      include: {
        farmer: {
          include: {
            farmDetails: true,
          },
        },
      },
      take: 100, // Process in batches
    });

    for (const policy of policies) {
      try {
        const farmDetails = policy.farmer.farmDetails;
        if (!farmDetails?.aadhaarHash) continue;

        // Note: We can't reverse the hash, so we need to store Aadhaar separately
        // OR require re-consent for background sync
        // For now, skip if no Aadhaar available
        Logger.policy.synced(`Skipping sync for policy ${policy.policyNumber} - Aadhaar not available for background sync`);
      } catch (error) {
        Logger.error(`Failed to sync policy ${policy.policyNumber}`, { error, policyNumber: policy.policyNumber });
        await prisma.policy.update({
          where: { id: policy.id },
          data: { syncStatus: 'failed' },
        });
      }
    }
  }

  /**
   * Manual re-verification of external policy
   */
  static async reverifyPolicy(policyId: string, aadhaar: string) {
    const policy = await prisma.policy.findUnique({
      where: { id: policyId },
      include: { farmer: true },
    });

    if (!policy || policy.source !== 'external') {
      throw new Error('Policy not found or not an external policy');
    }

    const policies = await this.lookupExternalPolicies(
      aadhaar,
      policy.farmer.mobileNumber || undefined,
      policy.farmerId
    );

    const matchingPolicy = policies.find((p) => p.policyNumber === policy.policyNumber);

    if (matchingPolicy) {
      await prisma.policy.update({
        where: { id: policyId },
        data: {
          syncStatus: 'synced',
          policyVerified: true,
          externalSyncAt: new Date(),
          insurerApiResponse: matchingPolicy,
        },
      });

      return { verified: true };
    }

    return { verified: false };
  }
}

