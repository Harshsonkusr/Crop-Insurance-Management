import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { prisma } from '../db';
import { Logger } from '../utils/logger';

const router = Router();

// Add a new service provider (Admin and Super Admin only)
router.post('/service-providers', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  const { name, email, phone, address, serviceType, userId } = req.body;

  try {
    const existingEmail = await prisma.serviceProvider.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: 'Service provider with that email already exists' });
    }
    const existingPhone = await prisma.serviceProvider.findUnique({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ message: 'Service provider with that phone number already exists' });
    }

    await prisma.serviceProvider.create({
      data: { name, email, phone, address, serviceType, userId },
    });
    res.status(201).json({ message: 'Service provider created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all service providers with pagination, search, filter, and sort (Admin and Super Admin only)
router.get('/service-providers', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
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
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { phone: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Filter by serviceType
    if (req.query.serviceType) {
      where.serviceType = req.query.serviceType;
    }

    // Filter by status
    if (req.query.status) {
      where.status = req.query.status;
    }

    // Sort - only allow valid ServiceProvider fields
    if (req.query.sortBy) {
      const sortBy = req.query.sortBy as string;
      // Only allow sorting by valid ServiceProvider fields
      const validSortFields = ['name', 'email', 'phone', 'serviceType', 'status', 'createdAt', 'updatedAt'];
      if (validSortFields.includes(sortBy)) {
        const order = (req.query.orderBy as string) === 'desc' ? 'desc' : 'asc';
        orderBy[sortBy] = order;
      }
    } else {
      orderBy.createdAt = 'desc';
    }

    const [serviceProviders, totalServiceProviders] = await Promise.all([
      prisma.serviceProvider.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              mobileNumber: true,
              status: true,
              isApproved: true,
            }
          }
        }
      }),
      prisma.serviceProvider.count({ where }),
    ]);

    // Map id to _id for frontend compatibility
    const mappedProviders = serviceProviders.map(sp => ({
      ...sp,
      _id: sp.id,
      id: sp.id,
    }));

    res.json({
      serviceProviders: mappedProviders,
      currentPage: page,
      totalPages: Math.ceil(totalServiceProviders / limit),
      totalServiceProviders,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all approved and active service providers (for farmers to select from)
// IMPORTANT: This route must come BEFORE /service-providers/:id to avoid route conflicts
// RULE: Only APPROVED SPs must be visible to farmers during "New Policy Request"
router.get('/service-providers/approved', authenticateToken, authorizeRoles(['FARMER']), async (req, res) => {
  try {
    const allProviders = await prisma.serviceProvider.findMany({
      where: {
        status: 'active',
        kycVerified: true, // Only KYC verified SPs
        user: {
          isApproved: true, // Only approved SPs
          status: 'active',
        },
      },
      include: {
        user: {
          select: {
            isApproved: true,
            status: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Double-check: Only return APPROVED SPs
    const mappedProviders = allProviders
      .filter((sp: any) => {
        // Must be approved, active, and KYC verified
        return sp.user.isApproved === true && 
               sp.user.status === 'active' && 
               sp.status === 'active' && 
               sp.kycVerified === true;
      })
      .map((sp: any) => ({
        id: sp.id,
        _id: sp.id,
        name: sp.name,
        email: sp.email,
        phone: sp.phone,
        serviceType: sp.serviceType,
        address: sp.address,
        licenseNumber: sp.licenseNumber,
        kycVerified: sp.kycVerified,
        status: sp.status,
        createdAt: sp.createdAt,
      }));

    res.json(mappedProviders);
  } catch (error) {
    Logger.error('Error fetching approved service providers', { error });
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single service provider by ID (Admin and Super Admin only)
router.get('/service-providers/:id', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const serviceProvider = await prisma.serviceProvider.findUnique({ 
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            mobileNumber: true,
            status: true,
            isApproved: true,
            createdAt: true,
          }
        }
      }
    });
    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }
    // Map id to _id for frontend compatibility
    const response = {
      ...serviceProvider,
      _id: serviceProvider.id,
      id: serviceProvider.id,
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a service provider (Admin and Super Admin only)
router.put('/service-providers/:id', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address, serviceType, status, userId } = req.body;

  try {
    const serviceProvider = await prisma.serviceProvider.update({
      where: { id },
      data: { name, email, phone, address, serviceType, status, userId },
    });
    res.json({ message: 'Service provider updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a service provider (Admin and Super Admin only)
router.delete('/service-providers/:id', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  const { id } = req.params;

  try {
    const serviceProvider = await prisma.serviceProvider.delete({ where: { id } }).catch(() => null);
    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }
    res.json({ message: 'Service provider deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
