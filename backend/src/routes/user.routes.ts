import { Router } from 'express';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';
import { Logger } from '../utils/logger';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { UserRole, UserStatus } from '@prisma/client';
import { auditLogService } from '../services/auditLog.service';

const router = Router();

// Get pending Service Provider registrations (Super Admin/Admin only)
router.get('/users/pending', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: {
        role: UserRole.SERVICE_PROVIDER,
        isApproved: false,
        status: UserStatus.pending
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map id to _id for frontend compatibility
    const mappedUsers = pendingUsers.map(user => ({
      ...user,
      _id: user.id,
      id: user.id,
    }));

    res.json({ users: mappedUsers, total: mappedUsers.length });
  } catch (error) {
    Logger.error('Error fetching pending users', { error });
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/Reject Service Provider registration (Super Admin/Admin only)
router.put('/users/:id/approve', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { approved, rejectionReason } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== UserRole.SERVICE_PROVIDER) {
      return res.status(400).json({ message: 'This endpoint is only for Service Provider accounts' });
    }

    if (approved === true) {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: { isApproved: true, status: UserStatus.active },
        });

        await tx.serviceProvider.upsert({
          where: { userId: user.id },
          update: { status: 'active', kycVerified: true },
          create: {
            name: user.name,
            email: user.email || `${user.mobileNumber}@serviceprovider.local`,
            phone: user.mobileNumber || '',
            address: '',
            serviceType: 'Crop Insurance',
            status: 'active',
            kycVerified: true,
            userId: user.id,
          },
        });
      });

      // Log admin action
      await auditLogService.logAdminOverride(
        req.userId!,
        'user',
        id,
        'Service Provider approved',
        { before: { isApproved: user.isApproved, status: user.status }, after: { isApproved: true, status: UserStatus.active } }
      );
      
      // Map id to _id for frontend compatibility
      const mappedUser = { ...user, _id: user.id, id: user.id };
      res.json({ message: 'Service Provider account approved successfully', user: mappedUser });
    } else {
      // Reject the account
      await prisma.user.update({ where: { id: user.id }, data: { status: UserStatus.banned } });
      
      // Log admin action
      await auditLogService.logAdminOverride(
        req.userId!,
        'user',
        id,
        rejectionReason || 'Service Provider registration rejected',
        { before: { status: user.status }, after: { status: UserStatus.banned } }
      );

      // Map id to _id for frontend compatibility
      const mappedUser = { ...user, status: UserStatus.banned, _id: user.id, id: user.id };
      res.json({ 
        message: 'Service Provider registration rejected', 
        user: mappedUser,
        rejectionReason: rejectionReason || 'Registration rejected by administrator'
      });
    }
  } catch (error) {
    Logger.error('Error approving/rejecting user', { error, userId: req.params.id });
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (Admin only)
router.get('/users', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    const orderBy: any = {};

    if (req.query.search) {
      const searchTerm = req.query.search as string;
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { mobileNumber: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (req.query.role) where.role = req.query.role;
    if (req.query.status) where.status = req.query.status;

    if (req.query.sortBy) {
      const sortBy = req.query.sortBy as string;
      const order = (req.query.orderBy as string) === 'desc' ? 'desc' : 'asc';
      orderBy[sortBy] = order;
    } else {
      orderBy.createdAt = 'desc';
    }

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({ where, orderBy, skip, take: limit }),
      prisma.user.count({ where }),
    ]);

    const mappedUsers = users.map(u => ({ ...u, _id: u.id, id: u.id }));

    res.json({
      users: mappedUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single user by ID (Admin and Super Admin only)
router.get('/users/:id', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new user (Super Admin/Admin only)
// Super Admin can create: ADMIN, SERVICE_PROVIDER, FARMER
// Admin can create: SERVICE_PROVIDER, FARMER (NOT other admins)
router.post('/users', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req: AuthRequest, res) => {
  const { email, password, role, name, profilePhoto, mobileNumber } = req.body;

  try {
    // Get the current user making the request
    const currentUser = req.userId ? await prisma.user.findUnique({ where: { id: req.userId } }) : null;
    if (!currentUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Only SUPER_ADMIN can create ADMIN accounts
    if (role === 'ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ 
        message: 'Access denied: Only Super Admin can create Admin accounts. Please contact Super Admin.' 
      });
    }

    // Only SUPER_ADMIN and ADMIN can create SERVICE_PROVIDER
    if (role === 'SERVICE_PROVIDER' && !['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role as string)) {
      return res.status(403).json({ 
        message: 'Access denied: Only Super Admin or Admin can create Service Provider accounts.' 
      });
    }

    // Validate required fields based on role
    if (role === 'FARMER') {
      if (!name || !mobileNumber) {
        return res.status(400).json({ message: 'Name and mobile number are required for Farmer' });
      }
    } else {
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required for Admin/Service Provider' });
      }
    }

    // Check for existing users
    if (email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ message: 'User with that email already exists' });
      }
    }

    if (mobileNumber) {
      const existingMobile = await prisma.user.findUnique({ where: { mobileNumber } });
      if (existingMobile) {
        return res.status(400).json({ message: 'User with that mobile number already exists' });
      }
    }

    // Create user
    const userData: any = {
      name,
      role,
      status: 'active',
      isApproved: true,
    };

    if (role === 'FARMER') {
      userData.mobileNumber = mobileNumber;
      // Farmers don't need email/password
    } else {
      userData.email = email;
      userData.password = await bcrypt.hash(password, 10);
      if (mobileNumber) userData.mobileNumber = mobileNumber;
    }

    if (profilePhoto) userData.profilePhoto = profilePhoto;

    type CreatedUser = { id: string; name: string; role: UserRole; email?: string | null; mobileNumber?: string | null };
    let createdUser: CreatedUser | null = null;
    await prisma.$transaction(async (tx) => {
      createdUser = await tx.user.create({ data: userData });
      if (role === 'SERVICE_PROVIDER') {
        await tx.serviceProvider.create({
          data: {
            name: createdUser.name,
            email: createdUser.email || `${createdUser.mobileNumber}@serviceprovider.local`,
            phone: createdUser.mobileNumber || '',
            address: '',
            serviceType: 'Crop Insurance',
            status: 'active',
            userId: createdUser.id,
          },
        });
      }
    });

    if (!createdUser) {
      return res.status(500).json({ message: 'User not created' });
    }
    const savedUser = createdUser as CreatedUser;
    res.status(201).json({ message: 'User created successfully', user: { id: savedUser.id, name: savedUser.name, role: savedUser.role } });
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'User with that email or mobile number already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Edit an existing user (Admin and Super Admin only)
router.put('/users/:id', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { email, password, role, name, profilePhoto, mobileNumber } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const data: any = {};
    if (email) data.email = email;
    if (role) data.role = role;
    if (name) data.name = name;
    if (profilePhoto) data.profilePhoto = profilePhoto;
    if (mobileNumber) data.mobileNumber = mobileNumber;
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({ where: { id }, data });
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user status (ban/unban) (Admin and Super Admin only)
router.put('/users/:id/status', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await prisma.user.update({ where: { id }, data: { status } });
    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset user password (Admin and Super Admin only)
router.post('/users/:id/reset-password', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id }, data: { password: hashedPassword } });
    res.json({ message: 'User password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a user (Admin and Super Admin only)
router.delete('/users/:id', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.delete({ where: { id } }).catch(() => null);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all claims (Admin only) - Admin version with full access
router.get('/claims', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    const orderBy: any = {};

    if (req.query.search) {
      const searchTerm = req.query.search as string;
      where.OR = [
        { claimId: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (req.query.status) where.status = req.query.status as any;
    if (req.query.farmerId) where.farmerId = req.query.farmerId as string;
    if (req.query.assignedTo) where.assignedToId = req.query.assignedTo as string;

    if (req.query.sortBy) {
      const sortBy = req.query.sortBy as string;
      const order = (req.query.orderBy as string) === 'desc' ? 'desc' : 'asc';
      orderBy[sortBy] = order;
    } else {
      orderBy.dateOfClaim = 'desc';
    }

    const [claims, totalClaims] = await Promise.all([
      prisma.claim.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          farmer: { select: { name: true, email: true, mobileNumber: true } },
          policy: { select: { policyNumber: true, cropType: true } },
          assignedTo: { select: { name: true, email: true } },
        },
      }),
      prisma.claim.count({ where }),
    ]);

    res.json({
      claims,
      currentPage: page,
      totalPages: Math.ceil(totalClaims / limit),
      totalClaims,
    });
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get farm details for a specific farmer (Admin only)
router.get('/farm-details/:farmerId', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { farmerId } = req.params;
    const farmDetails = await prisma.farmDetails.findUnique({ where: { farmerId } });
    
    if (!farmDetails) {
      return res.status(404).json({ message: 'Farm details not found for this farmer' });
    }
    
    res.json(farmDetails);
  } catch (error) {
    console.error('Error fetching farm details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all policies (Admin only) - Admin version with full access
router.get('/policies', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    const orderBy: any = {};

    if (req.query.search) {
      const searchTerm = req.query.search as string;
      where.OR = [
        { policyNumber: { contains: searchTerm, mode: 'insensitive' } },
        { cropType: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (req.query.farmerId) where.farmerId = req.query.farmerId as string;
    if (req.query.status) where.status = req.query.status as any;

    if (req.query.sortBy) {
      const sortBy = req.query.sortBy as string;
      const order = (req.query.orderBy as string) === 'desc' ? 'desc' : 'asc';
      orderBy[sortBy] = order;
    } else {
      orderBy.createdAt = 'desc';
    }

    const [policies, totalPolicies] = await Promise.all([
      prisma.policy.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          farmer: { select: { name: true, email: true, mobileNumber: true } },
          serviceProvider: { select: { name: true, email: true } },
        },
      }),
      prisma.policy.count({ where }),
    ]);

    res.json({
      policies,
      currentPage: page,
      totalPages: Math.ceil(totalPolicies / limit),
      totalPolicies,
    });
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin AI Report Review Routes
import { adminReviewService } from '../services/adminReview.service';

// Get all claims pending admin review
router.get('/ai-reviews/pending', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = req.query.sortBy ? { [req.query.sortBy as string]: (req.query.orderBy as string) === 'desc' ? 'desc' : 'asc' } : { createdAt: 'desc' };

    const result = await adminReviewService.getPendingAdminReviews(page, limit, sort);

    res.json({
      claims: result.claims,
      currentPage: page,
      totalPages: Math.ceil(result.totalClaims / limit),
      totalClaims: result.totalClaims,
    });
  } catch (error) {
    Logger.error('Error fetching pending admin reviews', { error });
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific claim for admin review
router.get('/ai-reviews/:claimId', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { claimId } = req.params;
    const claim = await adminReviewService.getClaimForAdminReview(claimId);

    res.json({ claim });
  } catch (error: any) {
    Logger.error('Error fetching claim for admin review', { error, claimId: req.params.claimId });
    res.status(error.message === 'Claim not found' || error.message === 'Claim is not pending admin review' ? 404 : 500).json({ message: error.message });
  }
});

// Admin forwards AI report to Service Provider
router.post('/ai-reviews/:claimId/forward', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { claimId } = req.params;
    const { adminNotes, overrideData } = req.body;
    const adminId = (req as AuthRequest).userId!;

    const result = await adminReviewService.forwardReportToServiceProvider(
      claimId,
      adminId,
      adminNotes,
      overrideData
    );

    res.json(result);
  } catch (error: any) {
    Logger.error('Error forwarding AI report to SP', { error, claimId: req.params.claimId, adminId: (req as AuthRequest).userId });
    res.status(error.message.includes('not found') || error.message.includes('not pending') ? 404 : 500).json({ message: error.message });
  }
});

// Admin rejects AI report and sends for manual review
router.post('/ai-reviews/:claimId/reject', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { claimId } = req.params;
    const { rejectionReason, adminNotes } = req.body;
    const adminId = (req as AuthRequest).userId!;

    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const result = await adminReviewService.rejectReportForManualReview(
      claimId,
      adminId,
      rejectionReason,
      adminNotes
    );

    res.json(result);
  } catch (error: any) {
    Logger.error('Error rejecting AI report', { error, claimId: req.params.claimId, adminId: (req as AuthRequest).userId });
    res.status(error.message.includes('not found') || error.message.includes('not pending') ? 404 : 500).json({ message: error.message });
  }
});

// Get admin review statistics
router.get('/ai-reviews/stats', authenticateToken, authorizeRoles(['ADMIN', 'SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const stats = await adminReviewService.getReviewStats();
    res.json(stats);
  } catch (error) {
    Logger.error('Error fetching admin review stats', { error });
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
