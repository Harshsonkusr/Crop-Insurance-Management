import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { prisma } from '../db';
import { Logger } from '../utils/logger';

const router = Router();

// Add a new insurer (Admin and Super Admin only)
router.post('/insurers', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  const { name, email, phone, address, serviceType, userId } = req.body;

  try {
    const existingEmail = await prisma.insurer.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: 'Insurer with that email already exists' });
    }
    const existingPhone = await prisma.insurer.findUnique({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ message: 'Insurer with that phone number already exists' });
    }

    await prisma.insurer.create({
      data: { name, email, phone, address, serviceType, userId },
    });
    res.status(201).json({ message: 'Insurer created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all insurers with pagination, search, filter, and sort (Admin and Super Admin only)
router.get('/insurers', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, any> = { deletedAt: null };
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

    // Sort - only allow valid Insurer fields
    if (req.query.sortBy) {
      const sortBy = req.query.sortBy as string;
      // Only allow sorting by valid Insurer fields
      const validSortFields = ['name', 'email', 'phone', 'serviceType', 'status', 'createdAt', 'updatedAt'];
      if (validSortFields.includes(sortBy)) {
        const order = (req.query.orderBy as string) === 'desc' ? 'desc' : 'asc';
        orderBy[sortBy] = order;
      }
    } else {
      orderBy.createdAt = 'desc';
    }

    const [insurers, totalInsurers] = await Promise.all([
      prisma.insurer.findMany({
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
      prisma.insurer.count({ where }),
    ]);

    // Map id to _id for frontend compatibility
    const mappedInsurers = insurers.map(ins => ({
      ...ins,
      _id: ins.id,
      id: ins.id,
    }));

    res.json({
      insurers: mappedInsurers,
      currentPage: page,
      totalPages: Math.ceil(totalInsurers / limit),
      totalInsurers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all approved and active insurers (for farmers to select from)
// IMPORTANT: This route must come BEFORE /insurers/:id to avoid route conflicts
// RULE: Only APPROVED Insurers must be visible to farmers during "New Policy Request"
router.get('/insurers/approved', authenticateToken, authorizeRoles(['FARMER']), async (req, res) => {
  try {
    const allInsurers = await prisma.insurer.findMany({
      where: {
        status: 'active',
        kycVerified: true, // Only KYC verified Insurers
        user: {
          isApproved: true, // Only approved Insurers
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

    // Double-check: Only return APPROVED Insurers
    const mappedInsurers = allInsurers
      .filter((ins: any) => {
        // Must be approved, active, and KYC verified
        return ins.user.isApproved === true &&
          ins.user.status === 'active' &&
          ins.status === 'active' &&
          ins.kycVerified === true;
      })
      .map((ins: any) => ({
        id: ins.id,
        _id: ins.id,
        name: ins.name,
        email: ins.email,
        phone: ins.phone,
        serviceType: ins.serviceType,
        address: ins.address,
        licenseNumber: ins.licenseNumber,
        kycVerified: ins.kycVerified,
        status: ins.status,
        createdAt: ins.createdAt,
      }));

    res.json(mappedInsurers);
  } catch (error) {
    Logger.error('Error fetching approved insurers', { error });
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single insurer by ID (Admin and Super Admin only)
router.get('/insurers/:id', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const insurer = await prisma.insurer.findUnique({
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
    if (!insurer) {
      return res.status(404).json({ message: 'Insurer not found' });
    }
    // Map id to _id for frontend compatibility
    const response = {
      ...insurer,
      _id: insurer.id,
      id: insurer.id,
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a insurer (Admin and Super Admin only)
router.put('/insurers/:id', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address, serviceType, status, userId } = req.body;

  try {
    const insurer = await prisma.insurer.update({
      where: { id },
      data: { name, email, phone, address, serviceType, status, userId },
    });
    res.json({ message: 'Insurer updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a insurer (Admin and Super Admin only)
router.delete('/insurers/:id', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const insurer = await tx.insurer.findUnique({
        where: { id },
        include: { policies: { select: { id: true } } }
      });

      if (!insurer) return null;

      const now = new Date();

      // 1. Soft Delete Crops
      await (tx.crop as any).updateMany({
        where: { insurerId: id },
        data: { deletedAt: now }
      });

      // 2. Soft Delete PolicyRequests
      await (tx.policyRequest as any).updateMany({
        where: { insurerId: id },
        data: { deletedAt: now }
      });

      // 3. Handle Claims and Policies
      const policyIds = insurer.policies.map(p => p.id);

      // Soft delete claims
      await (tx.claim as any).updateMany({
        where: {
          OR: [
            { assignedToId: id },
            { policyId: { in: policyIds } }
          ],
          deletedAt: null
        },
        data: {
          deletedAt: now,
          status: 'cancelled' as any
        }
      });

      // 4. Soft Delete Policies
      await (tx.policy as any).updateMany({
        where: { insurerId: id },
        data: { deletedAt: now }
      });

      // 5. Soft Delete Insurer
      await (tx.insurer as any).update({
        where: { id },
        data: { deletedAt: now, status: 'inactive' }
      });

      // 6. Soft Delete User
      await (tx.user as any).update({
        where: { id: insurer.userId },
        data: { deletedAt: now, status: 'banned' }
      });

      return true;
    });

    if (!result) {
      return res.status(404).json({ message: 'Insurer not found' });
    }

    res.json({ message: 'Insurer and all associated data deleted successfully' });
  } catch (error) {
    Logger.error('Error deleting insurer', { error, insurerId: id });
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
