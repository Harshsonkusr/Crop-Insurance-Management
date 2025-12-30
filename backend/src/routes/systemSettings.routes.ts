import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { prisma } from '../db';

const router = express.Router();

// Create a new system setting
router.post('/system-settings', authenticateToken, authorizeRoles(['ADMIN']), async (req, res) => {
  try {
    const { settingName, settingValue } = req.body;
    const newSetting = await prisma.systemSettings.create({ data: { settingName, settingValue } });
    res.status(201).json(newSetting);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all system settings
router.get('/system-settings', authenticateToken, authorizeRoles(['ADMIN']), async (req, res) => {
  try {
    const settings = await prisma.systemSettings.findMany();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single system setting by name
router.get('/system-settings/:settingName', authenticateToken, authorizeRoles(['ADMIN']), async (req, res) => {
  try {
    const setting = await prisma.systemSettings.findUnique({ where: { settingName: req.params.settingName } });
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a system setting by name
router.put('/system-settings/:settingName', authenticateToken, authorizeRoles(['ADMIN']), async (req, res) => {
  try {
    const { settingValue } = req.body;
    const updatedSetting = await prisma.systemSettings.update({
      where: { settingName: req.params.settingName },
      data: { settingValue, lastUpdated: new Date() },
    });
    if (!updatedSetting) {
      return res.status(404).json({ message: 'Setting not found' });
    }
    res.json(updatedSetting);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a system setting by name
router.delete('/system-settings/:settingName', authenticateToken, authorizeRoles(['ADMIN']), async (req, res) => {
  try {
    await prisma.systemSettings.delete({ where: { settingName: req.params.settingName } });
    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
