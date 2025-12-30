import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Strict Transport Security (HTTPS only in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// Enhanced rate limiting with per-endpoint limits and database persistence
import { prisma } from '../db';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier?: (req: Request) => string; // Custom identifier function
}

// Default rate limit configurations per endpoint
const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  '/api/auth/send-otp': { maxRequests: 1000, windowMs: 60 * 60 * 1000 }, // 1000 per hour (effectively no limit)
  '/api/auth/verify-otp': { maxRequests: 100, windowMs: 60 * 60 * 1000 }, // 100 per hour
  '/api/claims': { maxRequests: 10, windowMs: 24 * 60 * 60 * 1000 }, // 10 per day
  '/api/uploads': { maxRequests: 60, windowMs: 60 * 1000 }, // 60 per minute
  default: { maxRequests: 100, windowMs: 15 * 60 * 1000 }, // 100 per 15 minutes
};

export const rateLimiter = (config?: RateLimitConfig) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const endpoint = req.path;
      
      // Skip rate limiting for send-otp endpoint (unlimited requests)
      if (endpoint === '/api/auth/send-otp' || endpoint === '/send-otp') {
        return next();
      }
      
      const limitConfig = config || RATE_LIMIT_CONFIGS[endpoint] || RATE_LIMIT_CONFIGS.default;
      
      // Get identifier (IP or user ID)
      let identifier: string;
      if (limitConfig.identifier) {
        identifier = limitConfig.identifier(req);
      } else {
        identifier = (req as any).userId || req.ip || req.socket?.remoteAddress || 'unknown';
      }

      const now = new Date();
      const windowEnd = new Date(now.getTime() + limitConfig.windowMs);

      // Clean up old rate limit records
      await prisma.rateLimit.deleteMany({
        where: {
          windowEnd: { lt: now },
        },
      });

      // Check or create rate limit record
      const existing = await prisma.rateLimit.findFirst({
        where: {
          identifier,
          endpoint,
          windowEnd: { gte: now },
        },
        orderBy: { windowStart: 'desc' },
      });

      if (existing) {
        if (existing.count >= limitConfig.maxRequests) {
          const retryAfter = Math.ceil((existing.windowEnd.getTime() - now.getTime()) / 1000);
          res.setHeader('Retry-After', retryAfter.toString());
          return res.status(429).json({
            message: 'Too many requests, please try again later.',
            retryAfter,
          });
        }

        // Increment count
        await prisma.rateLimit.update({
          where: { id: existing.id },
          data: { count: existing.count + 1 },
        });
      } else {
        // Create new rate limit record
        await prisma.rateLimit.create({
          data: {
            identifier,
            endpoint,
            count: 1,
            windowStart: now,
            windowEnd,
          },
        });
      }

      next();
    } catch (error) {
      // Don't block requests if rate limiting fails
      Logger.security.rateLimit('Rate limiting error', { error });
      next();
    }
  };
};

// Per-IP rate limiter
export const ipRateLimiter = rateLimiter();

// Per-user rate limiter
export const userRateLimiter = rateLimiter({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000,
  identifier: (req) => (req as any).userId || req.ip || 'unknown',
});

