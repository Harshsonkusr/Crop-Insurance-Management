import { Router } from 'express';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';

const router = Router();

// Get farmer profile
router.get('/farmer/profile', authenticateToken, authorizeRoles(['FARMER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const farmDetails = await prisma.farmDetails.findUnique({ where: { farmerId: req.userId } });

    // Format response to match frontend expectations
    const profile = {
      personalInfo: {
        name: user.name,
        email: user.email || '',
        phone: user.mobileNumber || '',
      },
      farmInfo: {
        farmName: farmDetails?.farmName || '',
        address: farmDetails?.location || '', // Using location field from FarmDetails
        farmType: farmDetails?.cropType || '', // Using cropType as farmType
      },
      notificationPreferences: {
        email: false, // Default values - can be extended with a UserPreferences model
        sms: false,
      },
    };

    res.json(profile);
  } catch (error) {
    console.error('Error fetching farmer profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update farmer profile
router.put('/farmer/profile', authenticateToken, authorizeRoles(['FARMER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { personalInfo, farmInfo, notificationPreferences } = req.body;

    // Update user information
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (personalInfo) {
      if (personalInfo.name) user.name = personalInfo.name;
      if (personalInfo.email !== undefined) user.email = personalInfo.email;
      if (personalInfo.phone !== undefined) user.mobileNumber = personalInfo.phone;
    }

    await prisma.user.update({
      where: { id: req.userId },
      data: {
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
      },
    });

    // Update or create farm details
    if (farmInfo) {
      await prisma.farmDetails.upsert({
        where: { farmerId: req.userId },
        update: {
          farmName: farmInfo.farmName ?? undefined,
          location: farmInfo.address ?? undefined,
          cropType: farmInfo.farmType ?? undefined,
        },
        create: {
          farmerId: req.userId,
          farmName: farmInfo.farmName || '',
          location: farmInfo.address || '',
          cropType: farmInfo.farmType || '',
        },
      });
    }

    // Note: notificationPreferences would typically be stored in a separate UserPreferences model
    // For now, we'll just acknowledge the update

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating farmer profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update farmer password
router.put('/farmer/password', authenticateToken, authorizeRoles(['FARMER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || !user.password) {
      return res.status(404).json({ message: 'User not found or password not set' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.userId }, data: { password: hashedPassword } });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

