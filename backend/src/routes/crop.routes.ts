import { Router } from 'express';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';
import { prisma } from '../db';

const router = Router();

// Helper to get insurer ID from user ID
const getInsurerId = async (userId: string): Promise<string | null> => {
  const insurer = await prisma.insurer.findUnique({ where: { userId } });
  return insurer ? insurer.id : null;
};

// Get crops managed by authenticated insurer (Insurer only)
router.get('/crops', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const insurerId = await getInsurerId(req.userId);
    if (!insurerId) {
      return res.status(404).json({ message: 'Insurer profile not found' });
    }
    const crops = await prisma.crop.findMany({ where: { insurerId } });
    res.json(crops);
  } catch (error) {
    console.error('Error fetching crops:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get crops by insurer ID (for admin/insurer viewing)
router.get('/insurer/:insurerId/crops', authenticateToken, authorizeRoles(['INSURER', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { insurerId } = req.params;

    // If not admin, verify the insurer ID belongs to the authenticated user
    if (req.role === 'INSURER' && req.userId) {
      const userInsurerId = await getInsurerId(req.userId);
      if (!userInsurerId || userInsurerId.toString() !== insurerId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const crops = await prisma.crop.findMany({ where: { insurerId } });
    res.json(crops);
  } catch (error) {
    console.error('Error fetching crops:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new crop (Insurer only)
router.post('/crops', authenticateToken, authorizeRoles(['INSURER']), async (req: AuthRequest, res) => {
  const { name, description, expectedYield, cultivationSeason } = req.body;

  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const insurerId = await getInsurerId(req.userId);
    if (!insurerId) {
      return res.status(404).json({ message: 'Insurer profile not found' });
    }

    const newCrop = await prisma.crop.create({
      data: {
        name,
        description,
        expectedYield,
        cultivationSeason,
        insurerId,
      },
    });
    res.status(201).json({ message: 'Crop added successfully', crop: newCrop });
  } catch (error) {
    console.error('Error creating crop:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
