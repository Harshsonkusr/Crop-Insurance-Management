/**
 * Audit Log Service
 * Centralized audit logging for sensitive actions
 */

import { prisma } from '../db';

interface AuditLogData {
  userId?: string;
  action: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
  changes?: { before?: any; after?: any };
}

class AuditLogService {
  /**
   * Log an audit event
   */
  async log(data: AuditLogData) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          details: data.details,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          resourceType: data.resourceType,
          resourceId: data.resourceId,
          changes: data.changes,
        },
      });
    } catch (error) {
      // Don't fail the main operation if audit logging fails
      // Note: This is already proper error handling, no console.log needed
    }
  }

  /**
   * Log with automatic IP and user agent extraction from request
   */
  async logFromRequest(req: any, action: string, details: any, resourceType?: string, resourceId?: string) {
    await this.log({
      userId: req.userId,
      action,
      details,
      ipAddress: req.ip || req.socket?.remoteAddress,
      userAgent: req.get('user-agent'),
      resourceType,
      resourceId,
    });
  }

  /**
   * Log policy creation
   */
  async logPolicyCreation(userId: string, policyId: string, policyData: any) {
    await this.log({
      userId,
      action: 'policy_created',
      details: { policyId, ...policyData },
      resourceType: 'policy',
      resourceId: policyId,
    });
  }

  /**
   * Log claim creation
   */
  async logClaimCreation(userId: string, claimId: string, claimData: any) {
    await this.log({
      userId,
      action: 'claim_created',
      details: { claimId, ...claimData },
      resourceType: 'claim',
      resourceId: claimId,
    });
  }

  /**
   * Log admin override
   */
  async logAdminOverride(adminId: string, resourceType: string, resourceId: string, reason: string, changes: any) {
    await this.log({
      userId: adminId,
      action: 'admin_override',
      details: { reason, changes },
      resourceType,
      resourceId,
      changes,
    });
  }

  /**
   * Log SP approval/rejection
   */
  async logSPAction(spId: string, action: string, resourceType: string, resourceId: string, details: any) {
    await this.log({
      userId: spId,
      action: `sp_${action}`,
      details,
      resourceType,
      resourceId,
    });
  }
}

export const auditLogService = new AuditLogService();

