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

    const farmDetails = (await prisma.farmDetails.findUnique({ where: { farmerId: req.userId } })) as any;

    // Format response to match frontend expectations
    const profile = {
      personalInfo: {
        name: user.name,
        email: user.email || '',
        phone: user.mobileNumber || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth || '',
      },
      farmInfo: {
        farmName: farmDetails?.farmName || '',
        address: farmDetails?.address || '',
        village: farmDetails?.village || '',
        tehsil: farmDetails?.tehsil || '',
        district: farmDetails?.district || '',
        state: farmDetails?.state || '',
        pincode: farmDetails?.pincode || '',
        casteCategory: farmDetails?.casteCategory || '',
        farmerType: farmDetails?.farmerType || '',
        farmerCategory: farmDetails?.farmerCategory || '',
        loaneeStatus: farmDetails?.loaneeStatus || '',
        insuranceUnit: farmDetails?.insuranceUnit || '',
        landRecordKhasra: farmDetails?.landRecordKhasra || '',
        landRecordKhatauni: farmDetails?.landRecordKhatauni || '',
        surveyNumber: farmDetails?.surveyNumber || '',
        landAreaSize: farmDetails?.landAreaSize || '',
        latitude: farmDetails?.latitude || '',
        longitude: farmDetails?.longitude || '',
        cropType: farmDetails?.cropType || '',
        cropName: farmDetails?.cropName || '',
        cropVariety: farmDetails?.cropVariety || '',
        cropSeason: farmDetails?.cropSeason || '',
        insuranceLinked: farmDetails?.insuranceLinked || false,
        wildAnimalAttackCoverage: farmDetails?.wildAnimalAttackCoverage || false,
        bankName: farmDetails?.bankName || '',
        bankAccountNo: farmDetails?.bankAccountNo || '',
        bankIfsc: farmDetails?.bankIfsc || '',
        satbaraImage: farmDetails?.satbaraImage || '',
        patwariMapImage: farmDetails?.patwariMapImage || '',
        sowingCertificate: farmDetails?.sowingCertificate || '',
        bankPassbookImage: farmDetails?.bankPassbookImage || '',
        aadhaarCardImage: farmDetails?.aadhaarCardImage || '',
        landImage1: farmDetails?.landImage1 || '',
        landImage1Gps: farmDetails?.landImage1Gps || '',
        landImage2: farmDetails?.landImage2 || '',
        landImage2Gps: farmDetails?.landImage2Gps || '',
        landImage3: farmDetails?.landImage3 || '',
        landImage3Gps: farmDetails?.landImage3Gps || '',
        landImage4: farmDetails?.landImage4 || '',
        landImage4Gps: farmDetails?.landImage4Gps || '',
        landImage5: farmDetails?.landImage5 || '',
        landImage5Gps: farmDetails?.landImage5Gps || '',
        landImage6: farmDetails?.landImage6 || '',
        landImage6Gps: farmDetails?.landImage6Gps || '',
        landImage7: farmDetails?.landImage7 || '',
        landImage7Gps: farmDetails?.landImage7Gps || '',
        landImage8: farmDetails?.landImage8 || '',
        landImage8Gps: farmDetails?.landImage8Gps || '',
      },
      notificationPreferences: {
        email: false,
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
      // Mobile number, gender, and date of birth are usually set once during registration
      // but we could allow updating gender or DOB if needed. 
      // For now, let's keep it simple.
      if (personalInfo.gender !== undefined) user.gender = personalInfo.gender;
      if (personalInfo.dateOfBirth !== undefined) user.dateOfBirth = personalInfo.dateOfBirth;
    }

    await prisma.user.update({
      where: { id: req.userId },
      data: {
        name: user.name,
        email: user.email,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        // Only update fields that are actually provided and intended to be editable
      },
    });

    // Update or create farm details
    if (farmInfo) {
      // Filter out fields that shouldn't be updated (registration data)
      // or allow everything if the UI allows it.
      // For now, let's allow updating some core farm information.
      await prisma.farmDetails.upsert({
        where: { farmerId: req.userId },
        update: {
          farmName: farmInfo.farmName ?? undefined,
          address: farmInfo.address ?? undefined,
          // villlage, district, tehsil, state are LOCKED (Registration data)
          bankName: farmInfo.bankName ?? undefined,
          bankAccountNo: farmInfo.bankAccountNo ?? undefined,
          bankIfsc: farmInfo.bankIfsc ?? undefined,
          cropType: farmInfo.cropType ?? undefined,
          cropName: farmInfo.cropName ?? undefined,
          cropVariety: farmInfo.cropVariety ?? undefined,
          cropSeason: farmInfo.cropSeason ?? undefined,
        },
        create: {
          farmerId: req.userId,
          farmName: farmInfo.farmName || '',
          address: farmInfo.address || '',
          village: farmInfo.village || '',
          tehsil: farmInfo.tehsil || '',
          district: farmInfo.district || '',
          state: farmInfo.state || '',
          pincode: farmInfo.pincode || '',
          cropType: farmInfo.cropType || '',
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

