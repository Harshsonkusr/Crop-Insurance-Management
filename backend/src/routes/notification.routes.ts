import { Router } from 'express';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';

const router = Router();

// Get notification preferences for Service Provider
router.get('/service-provider/notifications', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // For now, return default preferences
    // In future, can be stored in UserPreferences model
    res.json({
      email: true,
      sms: true,
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update notification preferences for Service Provider
router.put('/service-provider/notifications', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { email, sms } = req.body;

    // For now, just acknowledge the update
    // In future, store in UserPreferences model
    console.log('Notification preferences updated for user:', req.userId, { email, sms });

    res.json({ 
      message: 'Notification preferences updated successfully',
      preferences: { email, sms }
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notification preferences for Farmer
router.get('/farmer/notifications', authenticateToken, authorizeRoles(['FARMER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // For now, return default preferences
    // In future, can be stored in UserPreferences model
    res.json({
      email: false,
      sms: false,
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update notification preferences for Farmer
router.put('/farmer/notifications', authenticateToken, authorizeRoles(['FARMER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { email, sms } = req.body;

    // For now, just acknowledge the update
    // In future, store in UserPreferences model
    console.log('Notification preferences updated for user:', req.userId, { email, sms });

    res.json({ 
      message: 'Notification preferences updated successfully',
      preferences: { email, sms }
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;



