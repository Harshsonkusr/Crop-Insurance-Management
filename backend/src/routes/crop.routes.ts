import { Router } from 'express';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';
import { prisma } from '../db';

const router = Router();

// Helper to get service provider ID from user ID
const getServiceProviderId = async (userId: string): Promise<string | null> => {
  const serviceProvider = await prisma.serviceProvider.findUnique({ where: { userId } });
  return serviceProvider ? serviceProvider.id : null;
};

// Get crops managed by authenticated service provider (Service Provider only)
router.get('/crops', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const serviceProviderId = await getServiceProviderId(req.userId);
    if (!serviceProviderId) {
      return res.status(404).json({ message: 'Service Provider profile not found' });
    }
    const crops = await prisma.crop.findMany({ where: { serviceProviderId } });
    res.json(crops);
  } catch (error) {
    console.error('Error fetching crops:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get crops by service provider ID (for admin/service provider viewing)
router.get('/service-provider/:serviceProviderId/crops', authenticateToken, authorizeRoles(['SERVICE_PROVIDER', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { serviceProviderId } = req.params;
    
    // If not admin, verify the service provider ID belongs to the authenticated user
    if (req.role === 'SERVICE_PROVIDER' && req.userId) {
      const userServiceProviderId = await getServiceProviderId(req.userId);
      if (!userServiceProviderId || userServiceProviderId.toString() !== serviceProviderId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    const crops = await prisma.crop.findMany({ where: { serviceProviderId } });
    res.json(crops);
  } catch (error) {
    console.error('Error fetching crops:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new crop (Service Provider only)
router.post('/crops', authenticateToken, authorizeRoles(['SERVICE_PROVIDER']), async (req: AuthRequest, res) => {
  const { name, description, expectedYield, cultivationSeason } = req.body;

  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const serviceProviderId = await getServiceProviderId(req.userId);
    if (!serviceProviderId) {
      return res.status(404).json({ message: 'Service Provider profile not found' });
    }

    const newCrop = await prisma.crop.create({
      data: {
        name,
        description,
        expectedYield,
        cultivationSeason,
        serviceProviderId,
      },
    });
    res.status(201).json({ message: 'Crop added successfully', crop: newCrop });
  } catch (error) {
    console.error('Error creating crop:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
