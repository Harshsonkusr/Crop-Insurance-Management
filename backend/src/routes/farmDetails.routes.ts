import { Router } from 'express';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';
import { prisma } from '../db';
import { AadhaarService } from '../services/aadhaar.service';

const router = Router();

// Get farm details for authenticated farmer (Farmer only) - matches frontend /farm-details
router.get('/farm-details', authenticateToken, authorizeRoles(['FARMER']), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const farmDetails = await prisma.farmDetails.findUnique({ where: { farmerId: req.userId } });
    res.json(farmDetails || null);
  } catch (error) {
    console.error('Error fetching farm details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new farm details (Farmer only) - matches frontend POST /farm-details
router.post('/farm-details', authenticateToken, authorizeRoles(['FARMER']), async (req: AuthRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    console.log('Farm details POST request body:', req.body);
    
    // Safely destructure with defaults
    const {
      farmName,
      location,
      area,
      crops,
      soilType,
      irrigationMethod,
      ownerName,
      aadhaarNumber,
      cropType,
      latitude,
      longitude,
      farmSize,
      farmId
    } = req.body || {};

    // Check if farm details already exist for this farmer
    const existingFarm = await prisma.farmDetails.findUnique({ where: { farmerId: req.userId } });
    
    if (existingFarm) {
      return res.status(400).json({ message: 'Farm details already exist. Use update endpoint instead.' });
    }

    // Safely parse area/farmSize
    let parsedArea: number | null = null;
    if (area !== undefined && area !== null && area !== '') {
      parsedArea = typeof area === 'string' ? parseFloat(area) : area;
      if (isNaN(parsedArea as number)) parsedArea = null;
    } else if (farmSize !== undefined && farmSize !== null && farmSize !== '') {
      parsedArea = typeof farmSize === 'string' ? parseFloat(farmSize) : parseFloat(farmSize);
      if (isNaN(parsedArea as number)) parsedArea = null;
    }

    const newFarmDetails = await prisma.farmDetails.create({
      data: {
        farmerId: req.userId,
        farmId: farmId || undefined,
        farmName: farmName || ownerName || 'My Farm',
        location: location || (latitude && longitude ? `${latitude}, ${longitude}` : ''),
        area: parsedArea,
        crops: crops || (cropType ? [cropType] : []),
        soilType: soilType || undefined,
        irrigationMethod: irrigationMethod || undefined,
        ownerName: ownerName || undefined,
        aadhaarHash: aadhaarNumber ? AadhaarService.hashAadhaar(aadhaarNumber) : undefined,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        farmSize: farmSize || undefined,
        cropType: cropType || undefined,
      },
    });
    res.status(201).json({ message: 'Farm details added successfully', farmDetails: newFarmDetails });
  } catch (error: any) {
    console.error('Error creating farm details:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: `Validation error: ${error.message}` });
    }
    res.status(500).json({ message: 'Server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
});

// Update farm details (Farmer only) - matches frontend PUT /farm-details/:id
router.put('/farm-details/:id', authenticateToken, authorizeRoles(['FARMER']), async (req: AuthRequest, res) => {
  const { id } = req.params;
  if (!req.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    console.log('Farm details PUT request body:', req.body);
    
    // Safely destructure with defaults
    const {
      farmName,
      location,
      area,
      crops,
      soilType,
      irrigationMethod,
      ownerName,
      aadhaarNumber,
      cropType,
      latitude,
      longitude,
      farmSize,
      farmId
    } = req.body || {};

    const updateData: any = {};
    if (farmName !== undefined) updateData.farmName = farmName;
    if (location !== undefined) updateData.location = location;
    
    // Safely parse area/farmSize
    if (area !== undefined && area !== null && area !== '') {
      const parsedArea = typeof area === 'string' ? parseFloat(area) : area;
      if (!isNaN(parsedArea)) updateData.area = parsedArea;
    } else if (farmSize !== undefined && farmSize !== null && farmSize !== '') {
      const parsedArea = typeof farmSize === 'string' ? parseFloat(farmSize) : parseFloat(farmSize);
      if (!isNaN(parsedArea)) updateData.area = parsedArea;
    }
    
    if (crops !== undefined) updateData.crops = crops;
    if (cropType !== undefined) updateData.crops = [cropType];
    if (soilType !== undefined) updateData.soilType = soilType;
    if (irrigationMethod !== undefined) updateData.irrigationMethod = irrigationMethod;
    if (ownerName !== undefined) updateData.ownerName = ownerName;
    if (aadhaarNumber !== undefined) updateData.aadhaarNumber = aadhaarNumber;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (farmSize !== undefined) updateData.farmSize = farmSize;
    if (cropType !== undefined) updateData.cropType = cropType;
    if (farmId !== undefined) updateData.farmId = farmId;

    const farmDetails = await prisma.farmDetails.update({
      where: { id, farmerId: req.userId },
      data: updateData,
    });

    if (!farmDetails) {
      return res.status(404).json({ message: 'Farm details not found' });
    }

    res.json({ message: 'Farm details updated successfully', farmDetails });
  } catch (error: any) {
    console.error('Error updating farm details:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: `Validation error: ${error.message}` });
    }
    res.status(500).json({ message: 'Server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
});

// Legacy routes for backward compatibility
router.get('/farmer/:farmerId/farm-details', authenticateToken, authorizeRoles(['FARMER']), async (req: AuthRequest, res) => {
  try {
    const { farmerId } = req.params;
    if (req.userId !== farmerId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const farmDetails = await prisma.farmDetails.findMany({ where: { farmerId } });
    res.json(farmDetails);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
