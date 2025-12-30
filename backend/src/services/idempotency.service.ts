/**
 * Idempotency Service
 * Prevents duplicate requests using Idempotency-Key header
 */

import { prisma } from '../db';
import { IdempotencyStatus } from '@prisma/client';

export class IdempotencyService {
  /**
   * Check if idempotency key exists and return cached response if available
   */
  static async checkIdempotency(key: string): Promise<any | null> {
    const record = await prisma.idempotencyKey.findUnique({
      where: { key },
    });
    
    if (!record) return null;
    
    // Check if expired
    if (record.expiresAt < new Date()) {
      await prisma.idempotencyKey.delete({ where: { key } });
      return null;
    }
    
    // If completed, return cached response
    if (record.status === 'completed' && record.responseBody) {
      return record.responseBody;
    }
    
    // If pending or failed, return null to allow retry
    return null;
  }

  /**
   * Create idempotency record
   */
  static async createIdempotencyKey(
    key: string,
    requestBody?: any,
    expiresInHours: number = 24
  ) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);
    
    return await prisma.idempotencyKey.create({
      data: {
        key,
        status: 'pending',
        requestBody: requestBody || null,
        expiresAt,
      },
    });
  }

  /**
   * Mark idempotency key as completed with response
   */
  static async markCompleted(key: string, claimId: string, responseBody: any) {
    await prisma.idempotencyKey.update({
      where: { key },
      data: {
        status: 'completed',
        claimId,
        responseBody,
      },
    });
  }

  /**
   * Mark idempotency key as failed
   */
  static async markFailed(key: string, error: string) {
    await prisma.idempotencyKey.update({
      where: { key },
      data: {
        status: 'failed',
        responseBody: { error },
      },
    });
  }

  /**
   * Clean up expired idempotency keys
   */
  static async cleanupExpired() {
    await prisma.idempotencyKey.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }
}

