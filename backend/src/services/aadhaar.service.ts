/**
 * Aadhaar Service
 * Handles Aadhaar hashing using HMAC-SHA256
 * NEVER stores raw Aadhaar numbers
 */

import crypto from 'crypto';
import { prisma } from '../db';

// HMAC key should be stored in Secrets Manager and rotated every 90 days
const getHmacKey = (): string => {
  const key = process.env.AADHAAR_HMAC_KEY;
  if (!key) {
    throw new Error('AADHAAR_HMAC_KEY not configured');
  }
  return key;
};

export class AadhaarService {
  /**
   * Hash Aadhaar number using HMAC-SHA256
   * This is a one-way hash - cannot be reversed
   */
  static hashAadhaar(aadhaar: string): string {
    // Remove spaces and validate format (12 digits)
    const cleaned = aadhaar.replace(/\s+/g, '');
    if (!/^\d{12}$/.test(cleaned)) {
      throw new Error('Invalid Aadhaar format. Must be 12 digits.');
    }
    
    const key = getHmacKey();
    const hash = crypto.createHmac('sha256', key).update(cleaned).digest('hex');
    return hash;
  }

  /**
   * Verify if an Aadhaar hash matches a given Aadhaar number
   */
  static verifyAadhaar(aadhaar: string, hash: string): boolean {
    const computedHash = this.hashAadhaar(aadhaar);
    return crypto.timingSafeEqual(
      Buffer.from(computedHash),
      Buffer.from(hash)
    );
  }

  /**
   * Find farmer by Aadhaar hash
   */
  static async findFarmerByAadhaar(aadhaar: string) {
    const hash = this.hashAadhaar(aadhaar);
    const farmDetails = await prisma.farmDetails.findUnique({
      where: { aadhaarHash: hash },
      include: { farmer: true },
    });
    return farmDetails?.farmer || null;
  }

  /**
   * Check if farmer exists by Aadhaar or phone
   * Also checks for policies linked to Aadhaar or policy number
   */
  static async checkFarmerExists(aadhaar?: string, phone?: string, policyNumber?: string) {
    const conditions: any[] = [];
    
    if (phone) {
      conditions.push({ mobileNumber: phone });
    }
    
    if (aadhaar) {
      const hash = this.hashAadhaar(aadhaar);
      const farmDetails = await prisma.farmDetails.findUnique({
        where: { aadhaarHash: hash },
        select: { farmerId: true },
      });
      if (farmDetails) {
        conditions.push({ id: farmDetails.farmerId });
      }
      
      // Also check for policies linked to this Aadhaar hash
      const policiesByAadhaar = await prisma.policy.findMany({
        where: {
          farmer: {
            farmDetails: {
              aadhaarHash: hash,
            },
          },
        },
        select: { farmerId: true },
      });
      
      if (policiesByAadhaar.length > 0) {
        const farmerIds = [...new Set(policiesByAadhaar.map(p => p.farmerId))];
        conditions.push({ id: { in: farmerIds } });
      }
    }
    
    // Check by policy number if provided
    if (policyNumber) {
      const policy = await prisma.policy.findUnique({
        where: { policyNumber },
        select: { farmerId: true },
      });
      if (policy) {
        conditions.push({ id: policy.farmerId });
      }
    }
    
    if (conditions.length === 0) return null;
    
    return await prisma.user.findFirst({
      where: {
        OR: conditions,
        role: 'FARMER',
      },
      include: {
        policies: {
          where: { status: 'Active' },
          select: { id: true, policyNumber: true, serviceProvider: { select: { name: true } } },
        },
      },
    });
  }

  /**
   * Store Aadhaar hash in FarmDetails
   */
  static async storeAadhaarHash(farmerId: string, aadhaar: string) {
    const hash = this.hashAadhaar(aadhaar);
    
    await prisma.farmDetails.upsert({
      where: { farmerId },
      update: { aadhaarHash: hash },
      create: {
        farmerId,
        aadhaarHash: hash,
      },
    });
    
    return hash;
  }
}

