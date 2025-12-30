import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../db';

const router = Router();

// Get user preferences
router.get('/preferences', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: req.userId },
      update: {},
      create: {
        userId: req.userId,
        sidebarOpen: true,
        theme: 'light',
        language: 'en',
        notificationsEmail: true,
        notificationsSms: false,
        notificationsPush: true,
      },
    });

    res.json(preferences);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user preferences
router.put('/preferences', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { sidebarOpen, theme, language, notifications } = req.body;

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: req.userId },
      create: {
        userId: req.userId,
        sidebarOpen: sidebarOpen ?? true,
        theme: theme ?? 'light',
        language: language ?? 'en',
        notificationsEmail: notifications?.email ?? true,
        notificationsSms: notifications?.sms ?? false,
        notificationsPush: notifications?.push ?? true,
      },
      update: {
        sidebarOpen: sidebarOpen ?? undefined,
        theme: theme ?? undefined,
        language: language ?? undefined,
        notificationsEmail: notifications?.email ?? undefined,
        notificationsSms: notifications?.sms ?? undefined,
        notificationsPush: notifications?.push ?? undefined,
      },
    });
    res.json(preferences);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

