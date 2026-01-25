import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../db';
import { Logger } from '../utils/logger';

const router = Router();

// Get all notifications for the authenticated user
router.get('/notifications', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Optional filter: only unread
    const unreadOnly = req.query.unread === 'true';
    const whereClause: any = { userId: req.userId };
    if (unreadOnly) {
      whereClause.read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: whereClause }),
      prisma.notification.count({ where: { userId: req.userId, read: false } })
    ]);

    res.json({
      notifications,
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    Logger.error('Error fetching notifications', { error, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark a specific notification as read
router.put('/notifications/:id/read', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: { id, userId: req.userId! }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true }
    });

    res.json(updated);
  } catch (error) {
    Logger.error('Error marking notification as read', { error, notificationId: req.params.id });
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.post('/notifications/mark-all-read', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const updated = await prisma.notification.updateMany({
      where: { userId: req.userId!, read: false },
      data: { read: true }
    });

    res.json({ message: 'All notifications marked as read', count: updated.count });
  } catch (error) {
    Logger.error('Error marking all notifications as read', { error, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
