/**
 * Consent Management Service
 * Handles user consent for Aadhaar lookup, policy linking, etc.
 */

import { prisma } from '../db';
import { ConsentType } from '@prisma/client';

export { ConsentType };

export class ConsentService {
  /**
   * Record user consent
   */
  static async recordConsent(
    userId: string,
    consentType: ConsentType,
    consentText: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    return await prisma.consent.create({
      data: {
        userId,
        consentType,
        consentText,
        granted: true,
        grantedAt: new Date(),
        ipAddress,
        userAgent,
      },
    });
  }

  /**
   * Check if user has granted consent for a specific type
   */
  static async hasConsent(userId: string, consentType: ConsentType): Promise<boolean> {
    const consent = await prisma.consent.findFirst({
      where: {
        userId,
        consentType,
        granted: true,
        revokedAt: null,
      },
      orderBy: { grantedAt: 'desc' },
    });
    
    return !!consent;
  }

  /**
   * Revoke consent
   */
  static async revokeConsent(userId: string, consentType: ConsentType) {
    await prisma.consent.updateMany({
      where: {
        userId,
        consentType,
        granted: true,
        revokedAt: null,
      },
      data: {
        granted: false,
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Get all consents for a user
   */
  static async getUserConsents(userId: string) {
    return await prisma.consent.findMany({
      where: { userId },
      orderBy: { grantedAt: 'desc' },
    });
  }

  /**
   * Get consent text template
   */
  static getConsentText(consentType: ConsentType): string {
    const templates: Record<ConsentType, string> = {
      aadhaar_lookup: 'I consent to Claimeasy using my Aadhaar number to lookup and verify my insurance policies with external insurers.',
      aadhaar_linking: 'I consent to Claimeasy linking my Aadhaar number to my account and policies for verification purposes.',
      policy_sync: 'I consent to Claimeasy synchronizing my insurance policies from external insurers using my Aadhaar number.',
      data_sharing: 'I consent to Claimeasy sharing my policy and claim data with authorized insurance service providers for claim processing.',
    };
    
    return templates[consentType] || 'Consent text not defined';
  }
}

