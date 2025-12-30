/**
 * Session Management Service
 * Handles multi-device session management with JWT and refresh tokens
 */

import { prisma } from '../db';
import jwt from 'jsonwebtoken';
import { SessionStatus } from '@prisma/client';
import { KmsService } from './kms.service';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '1h'; // Short TTL
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export class SessionService {
  /**
   * Create a new session with JWT and refresh token
   */
  static async createSession(
    userId: string,
    deviceInfo?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Generate JWT
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    // Generate refresh token
    const refreshToken = jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    // Encrypt refresh token before storing
    const encryptedRefreshToken = KmsService.encrypt(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Store session in DB
    const session = await prisma.session.create({
      data: {
        userId,
        token: refreshToken, // Store refresh token (encrypted in production)
        refreshToken: encryptedRefreshToken,
        deviceInfo: deviceInfo || {},
        ipAddress,
        userAgent,
        status: 'active',
        expiresAt,
      },
    });

    return {
      token,
      refreshToken,
      sessionId: session.id,
    };
  }

  /**
   * Refresh JWT token using refresh token
   */
  static async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Find session
      const session = await prisma.session.findFirst({
        where: {
          token: refreshToken,
          status: 'active',
          expiresAt: { gt: new Date() },
        },
      });

      if (!session) {
        throw new Error('Session not found or expired');
      }

      // Generate new JWT
      const newToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      // Update last activity
      await prisma.session.update({
        where: { id: session.id },
        data: { lastActivity: new Date() },
      });

      return { token: newToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Revoke a session
   */
  static async revokeSession(sessionId: string, userId: string) {
    await prisma.session.updateMany({
      where: {
        id: sessionId,
        userId, // Ensure user can only revoke their own sessions
      },
      data: {
        status: 'revoked',
      },
    });
  }

  /**
   * Revoke all sessions for a user (logout everywhere)
   */
  static async revokeAllSessions(userId: string) {
    await prisma.session.updateMany({
      where: {
        userId,
        status: 'active',
      },
      data: {
        status: 'revoked',
      },
    });
  }

  /**
   * Get all active sessions for a user
   */
  static async getUserSessions(userId: string) {
    return await prisma.session.findMany({
      where: {
        userId,
        status: 'active',
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActivity: 'desc' },
    });
  }

  /**
   * Update session last activity
   */
  static async updateActivity(sessionId: string) {
    await prisma.session.update({
      where: { id: sessionId },
      data: { lastActivity: new Date() },
    });
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpired() {
    await prisma.session.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        status: 'active',
      },
      data: {
        status: 'expired',
      },
    });
  }

  /**
   * Check for suspicious activity (too many active sessions)
   */
  static async checkSuspiciousActivity(userId: string, maxSessions: number = 10): Promise<boolean> {
    const activeSessions = await prisma.session.count({
      where: {
        userId,
        status: 'active',
        expiresAt: { gt: new Date() },
      },
    });

    return activeSessions > maxSessions;
  }
}

