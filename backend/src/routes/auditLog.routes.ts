import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { prisma } from '../db';

const router = express.Router();

// Get all audit logs with pagination, search, filter, and sort
router.get('/audit-logs', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, any> = {};
    const orderBy: Record<string, 'asc' | 'desc'> = {};

    // Search
    if (req.query.search) {
      const searchTerm = req.query.search as string;
      where.OR = [
        { action: { contains: searchTerm, mode: 'insensitive' } },
        { details: { path: ['message'], string_contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Filter by userId
    if (req.query.userId) {
      where.userId = req.query.userId;
    }

    // Filter by action
    if (req.query.action) {
      where.action = req.query.action;
    }

    // Sort
    if (req.query.sortBy) {
      const sortBy = req.query.sortBy as string;
      const order = (req.query.orderBy as string) === 'desc' ? 'desc' : 'asc';
      orderBy[sortBy] = order;
    } else {
      orderBy.timestamp = 'desc';
    }

    const [auditLogs, totalAuditLogs] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      auditLogs,
      currentPage: page,
      totalPages: Math.ceil(totalAuditLogs / limit),
      totalAuditLogs,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
