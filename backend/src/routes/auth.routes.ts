import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { generateOTP, sendOTP } from '../utils/otp';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../db';
import { UserRole, UserStatus } from '@prisma/client';
import { Logger } from '../utils/logger';
import { AadhaarService } from '../services/aadhaar.service';
import { ConsentService } from '../services/consent.service';
import { ExternalPolicyService } from '../services/externalPolicy.service';
import { KmsService } from '../services/kms.service';
import { auditLogService } from '../services/auditLog.service';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Admin/Insurer Login
router.get('/debug-farmers', async (req, res) => {
  try {
    const farmers = await prisma.user.findMany({
      where: { role: 'FARMER' },
      select: { id: true, name: true, mobileNumber: true, status: true }
    });
    res.json(farmers);
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.post('/login/admin-insurer', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    Logger.auth.login('Login attempt', { email });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      Logger.auth.failed('User not found', { email });
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // User found, checking credentials

    // Check if user has a password (Admin and Insurer should have passwords)
    if (!user.password) {
      // User has no password set
      return res.status(400).json({
        message: 'Account setup incomplete. Please contact administrator to set your password.'
      });
    }

    // Check if user is banned
    if (user.status === 'banned') {
      return res.status(403).json({ message: 'Account has been banned. Please contact administrator.' });
    }

    // Check if Insurer is approved
    if (user.role === 'INSURER' && !user.isApproved) {
      return res.status(403).json({
        message: 'Your account is under review. Please wait for admin approval. You will be notified once your account is approved.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Invalid password
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.role === 'FARMER') {
      return res.status(403).json({
        message: 'Farmers must use mobile number and OTP to login. Please select "Farmer" role.'
      });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    // Login successful
    res.json({ token, user: { role: user.role, name: user.name, profilePhoto: user.profilePhoto } });
  } catch (error) {
    Logger.error('Login error', { error, email });
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Send OTP to Farmer
router.post('/send-otp', async (req, res) => {
  const { mobileNumber } = req.body;

  try {
    // Trim and normalize mobile number (remove spaces, special characters except digits)
    const trimmedMobile = mobileNumber ? mobileNumber.trim().replace(/\D/g, '') : '';

    if (!trimmedMobile || trimmedMobile.length < 10) {
      Logger.auth.failed('OTP request failed: Invalid mobile number', { mobileNumber });
      return res.status(400).json({ message: 'Please enter a valid mobile number (at least 10 digits)' });
    }

    // Try to find user with exact match first
    let user = await prisma.user.findFirst({
      where: {
        mobileNumber: trimmedMobile,
        role: UserRole.FARMER
      }
    });

    // If not found, try with the original (in case it's stored differently)
    if (!user) {
      user = await prisma.user.findFirst({
        where: {
          mobileNumber: { contains: trimmedMobile },
          role: UserRole.FARMER
        }
      });
    }

    if (!user) {
      Logger.auth.failed('OTP request failed: Farmer not found', {
        mobileNumber: trimmedMobile,
        originalMobileNumber: mobileNumber
      });
      return res.status(404).json({
        message: 'Farmer not found. Please check your mobile number or register first.'
      });
    }

    const otp = generateOTP();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otp,
        otpExpires: new Date(Date.now() + 10 * 60 * 1000), // OTP valid for 10 minutes
      },
    });

    await sendOTP(trimmedMobile, otp);
    Logger.auth.otp('OTP sent successfully', { userId: user.id, mobileNumber: trimmedMobile });

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    Logger.error('OTP send error', { error, mobileNumber: req.body.mobileNumber });
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP and Login Farmer
router.post('/verify-otp', async (req, res) => {
  const { mobileNumber, otp } = req.body;

  try {
    // Trim and normalize mobile number
    const trimmedMobile = mobileNumber ? mobileNumber.trim().replace(/\D/g, '') : '';

    if (!trimmedMobile || trimmedMobile.length < 10) {
      Logger.auth.failed('OTP verification failed: Invalid mobile number', { mobileNumber });
      return res.status(400).json({ message: 'Please enter a valid mobile number' });
    }

    if (!otp || otp.trim().length !== 6) {
      Logger.auth.failed('OTP verification failed: Invalid OTP format', { mobileNumber: trimmedMobile });
      return res.status(400).json({ message: 'Please enter a valid 6-digit OTP' });
    }

    // Try to find user with exact match first
    let user = await prisma.user.findFirst({
      where: {
        mobileNumber: trimmedMobile,
        role: UserRole.FARMER
      }
    });

    // If not found, try with the original (in case it's stored differently)
    if (!user) {
      user = await prisma.user.findFirst({
        where: {
          mobileNumber: { contains: trimmedMobile },
          role: UserRole.FARMER
        }
      });
    }

    if (!user || user.otp !== otp.trim() || !user.otpExpires || user.otpExpires < new Date()) {
      Logger.auth.failed('OTP verification failed: Invalid or expired OTP', {
        mobileNumber: trimmedMobile,
        hasUser: !!user,
        otpMatch: user ? user.otp === otp.trim() : false,
        otpExpired: user ? (user.otpExpires ? user.otpExpires < new Date() : true) : false
      });
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { otp: null, otpExpires: null },
    });

    // Create session with multi-device support
    const { SessionService } = await import('../services/session.service');
    const session = await SessionService.createSession(
      user.id,
      req.body.deviceInfo,
      req.ip,
      req.get('user-agent')
    );

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

    // RULE: External policies must auto-fetch using AadhaarHash / Phone when farmer logs in
    // Try to sync external policies (async, don't wait - non-blocking)
    const farmDetails = await prisma.farmDetails.findUnique({ where: { farmerId: user.id } });
    if (farmDetails?.aadhaarHash || trimmedMobile) {
      // Auto-fetch external policies on login using AadhaarHash (if available) or Phone
      // Pass empty string for aadhaar - syncExternalPolicies will use aadhaarHash from farmDetails
      ExternalPolicyService.syncExternalPolicies(user.id, '', trimmedMobile)
        .then((policies) => {
          if (policies && policies.length > 0) {
            Logger.policy.synced('External policies auto-fetched on login', {
              userId: user.id,
              policyCount: policies.length
            });
          }
        })
        .catch(err => {
          // Log error but don't fail login
          Logger.error('Failed to auto-fetch external policies on login (non-critical)', {
            error: err?.message || String(err),
            userId: user.id
          });
        });
    }

    // Log login
    await auditLogService.log({
      userId: user.id,
      action: 'farmer_logged_in',
      details: {},
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    Logger.auth.login('Farmer logged in successfully', { userId: user.id, mobileNumber: trimmedMobile });

    res.json({
      token,
      refreshToken: session.refreshToken,
      user: { role: user.role, name: user.name, profilePhoto: user.profilePhoto }
    });
  } catch (error) {
    Logger.error('OTP verification error', { error, mobileNumber: req.body.mobileNumber });
    res.status(500).json({ message: 'Server error' });
  }
});

// Insurer Registration (public, requires admin approval)
router.post('/signup/insurer', async (req, res) => {
  const {
    name, email, password, phone,
    businessName, address, servicesProvided,
    gstNumber, panNumber, spType,
    licenseNumber, licenseExpiry, aiAssessmentCertified,
    serviceArea, state, district
  } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Name, email, password, and phone are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { mobileNumber: phone },
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'A user with this email or phone number already exists. Please try logging in or use different credentials.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new insurer user with pending approval
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        mobileNumber: phone.trim(),
        role: UserRole.INSURER,
        status: UserStatus.pending,
        isApproved: false,
        insurer: {
          create: {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            address: address || '',
            state: state || '',
            district: district || '',
            businessName: businessName || '',
            insurerType: spType || 'Insurance Company',
            serviceDescription: servicesProvided || '',
            gstNumber: gstNumber || null,
            panNumber: panNumber || null,
            bankName: req.body.bankName || null,
            bankAccountNo: req.body.bankAccountNo || null,
            bankIfsc: req.body.bankIfsc || null,
            licenseNumber: licenseNumber || null,
            licenseExpiryDate: licenseExpiry ? new Date(licenseExpiry) : null,
            aiCertified: aiAssessmentCertified || false,
            serviceArea: serviceArea || '',
            serviceType: 'Crop Insurance', // Default value
            status: 'pending',
          } as any,
        },
      },
    });

    res.status(201).json({
      message: 'Registration successful! Your account is under review. You will be notified via email once your account is approved by an administrator.',
      requiresApproval: true
    });
  } catch (error: any) {
    Logger.error('Insurer signup error', { error });
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'A user with this email or phone number already exists.' });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Note: Admin accounts can only be created by Super Admin/Admin
// through the admin panel (/api/admin/users endpoint)
// Public signup is available for Farmers (OTP) and Insurers (with approval)

// Signup for Farmer (creates account and sends OTP)
router.post('/signup/farmer', upload.fields([
  { name: 'satbaraImage', maxCount: 1 },
  { name: 'patwariMapImage', maxCount: 1 },
  { name: 'sowingCertificate', maxCount: 1 },
  { name: 'bankPassbookImage', maxCount: 1 },
  { name: 'aadhaarCardImage', maxCount: 1 },
  { name: 'landImage1', maxCount: 1 },
  { name: 'landImage2', maxCount: 1 },
  { name: 'landImage3', maxCount: 1 },
  { name: 'landImage4', maxCount: 1 },
  { name: 'landImage5', maxCount: 1 },
  { name: 'landImage6', maxCount: 1 },
  { name: 'landImage7', maxCount: 1 },
  { name: 'landImage8', maxCount: 1 },
]), async (req, res) => {
  const {
    name, gender, dob, casteCategory, farmerType, farmerCategory, loaneeStatus,
    mobileNumber, aadhaarNumber, address, village, tehsil, district, state, pincode,
    farmName, cropType, cropName, cropVariety, cropSeason, insuranceUnit,
    landRecordKhasra, landRecordKhatauni, surveyNumber, landAreaSize,
    latitude, longitude, wildAnimalAttackCoverage,
    bankName, bankAccountNo, bankIfsc,
    consentGranted,
    landImage1Gps, landImage2Gps, landImage3Gps, landImage4Gps,
    landImage5Gps, landImage6Gps, landImage7Gps, landImage8Gps,
    insuranceLinked
  } = req.body;

  // Log farmer registration attempt

  try {
    // Validate required fields
    if (!name || !mobileNumber) {
      Logger.security.validation('Farmer signup validation failed: Missing name or mobileNumber');
      return res.status(400).json({ message: 'Name and mobile number are required' });
    }

    // Aadhaar is mandatory
    if (!aadhaarNumber) {
      return res.status(400).json({ message: 'Aadhaar number is required' });
    }

    // Consent is mandatory for Aadhaar usage
    if (!consentGranted || consentGranted === 'false') {
      return res.status(400).json({
        message: 'Consent is required to use Aadhaar for policy lookup and verification',
        requiresConsent: true,
      });
    }

    // Trim and validate mobile number
    const trimmedMobile = mobileNumber.trim();
    if (trimmedMobile.length < 10) {
      return res.status(400).json({ message: 'Please enter a valid mobile number (at least 10 digits)' });
    }

    // Check if farmer already exists by Aadhaar, phone, or linked policies
    const existingUser = await AadhaarService.checkFarmerExists(aadhaarNumber, trimmedMobile);
    if (existingUser) {
      Logger.auth.failed('Farmer already exists - redirecting to login', {
        mobileNumber: trimmedMobile,
        hasPolicies: existingUser.policies && existingUser.policies.length > 0
      });
      return res.status(409).json({
        message: 'A farmer with this Aadhaar number, mobile number, or linked policy already exists. Please login.',
        existingUser: true,
        redirectToLogin: true,
        hasPolicies: existingUser.policies && existingUser.policies.length > 0,
      });
    }

    // Handle files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const getFilePath = (fieldname: string) => {
      const file = files?.[fieldname]?.[0];
      if (!file) return undefined;
      // Store relative path for web usage locally
      return `uploads/${file.filename}`;
    };

    // Create new farmer user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Encrypt PII
      const encryptedMobile = KmsService.encrypt(trimmedMobile);

      // Create user
      const otp = generateOTP();
      const userData: any = {
        name: name.trim(),
        mobileNumber: trimmedMobile,
        mobileNumberEncrypted: encryptedMobile,
        gender: gender || null,
        dateOfBirth: dob || null,
        role: UserRole.FARMER,
        status: UserStatus.active,
        otp,
        otpExpires: new Date(Date.now() + 10 * 60 * 1000),
      };
      const newUser = await tx.user.create({ data: userData });

      // Hash Aadhaar (do this inside transaction)
      const aadhaarHash = AadhaarService.hashAadhaar(aadhaarNumber);

      // Create farm details with Aadhaar hash (all in same transaction)
      const farmData: any = {
        farmerId: newUser.id,
        aadhaarHash,
        farmName: farmName || null,
        address: address || null,
        village: village || null,
        tehsil: tehsil || null,
        district: district || null,
        state: state || null,
        pincode: pincode || null,
        casteCategory: casteCategory || null,
        farmerType: farmerType || null,
        farmerCategory: farmerCategory || null,
        loaneeStatus: loaneeStatus || null,
        insuranceUnit: insuranceUnit || null,
        landRecordKhasra: landRecordKhasra || null,
        landRecordKhatauni: landRecordKhatauni || null,
        surveyNumber: surveyNumber || null,
        landAreaSize: landAreaSize ? parseFloat(landAreaSize) : null,
        latitude: latitude || null,
        longitude: longitude || null,
        cropType: cropType || null,
        cropName: cropName || null,
        cropVariety: cropVariety || null,
        cropSeason: cropSeason || null,
        insuranceLinked: insuranceLinked === 'Yes' || insuranceLinked === 'true' || insuranceLinked === true, // Map to boolean
        wildAnimalAttackCoverage: wildAnimalAttackCoverage === 'true' || wildAnimalAttackCoverage === true,
        bankName: bankName || null,
        bankAccountNo: bankAccountNo || null,
        bankIfsc: bankIfsc || null,
        satbaraImage: getFilePath('satbaraImage'),
        patwariMapImage: getFilePath('patwariMapImage'),
        sowingCertificate: getFilePath('sowingCertificate'),
        bankPassbookImage: getFilePath('bankPassbookImage'),
        aadhaarCardImage: getFilePath('aadhaarCardImage'),
        landImage1: getFilePath('landImage1'),
        landImage1Gps: landImage1Gps || null,
        landImage2: getFilePath('landImage2'),
        landImage2Gps: landImage2Gps || null,
        landImage3: getFilePath('landImage3'),
        landImage3Gps: landImage3Gps || null,
        landImage4: getFilePath('landImage4'),
        landImage4Gps: landImage4Gps || null,
        landImage5: getFilePath('landImage5'),
        landImage5Gps: landImage5Gps || null,
        landImage6: getFilePath('landImage6'),
        landImage6Gps: landImage6Gps || null,
        landImage7: getFilePath('landImage7'),
        landImage7Gps: landImage7Gps || null,
        landImage8: getFilePath('landImage8'),
        landImage8Gps: landImage8Gps || null,
      };
      await tx.farmDetails.create({ data: farmData });

      return { user: newUser, otp };
    });

    // Farmer registration successful

    // Record consent (after transaction to ensure user exists)
    try {
      const consentText = ConsentService.getConsentText('aadhaar_linking' as any);
      await ConsentService.recordConsent(
        result.user.id,
        'aadhaar_linking' as any,
        consentText,
        req.ip,
        req.get('user-agent')
      );

      const policySyncConsent = ConsentService.getConsentText('policy_sync' as any);
      await ConsentService.recordConsent(
        result.user.id,
        'policy_sync' as any,
        policySyncConsent,
        req.ip,
        req.get('user-agent')
      );
    } catch (consentError) {
      Logger.error('Failed to record consent (non-critical)', { error: consentError, userId: result.user.id });
      // Don't fail registration if consent recording fails
    }

    // DO NOT send OTP automatically - farmer will request it manually via "Send OTP" button
    // OTP is already generated and stored in the database, ready for when farmer requests it
    Logger.farmer.registered('Farmer registered successfully - OTP ready for manual request', {
      userId: result.user.id,
      mobileNumber: trimmedMobile
    });

    // Try to sync external policies (async, don't wait - non-blocking)
    // This runs in background and won't affect registration even if it fails
    ExternalPolicyService.syncExternalPolicies(result.user.id, aadhaarNumber, trimmedMobile)
      .then((policies) => {
        if (policies && policies.length > 0) {
          Logger.policy.synced('External policies synced for farmer', {
            userId: result.user.id,
            policyCount: policies.length
          });
        } else {
          Logger.policy.synced('No external policies found for farmer', { userId: result.user.id });
        }
      })
      .catch(err => {
        // Log error but don't fail registration
        Logger.error('Failed to sync external policies (non-critical)', {
          error: err?.message || String(err),
          errorStack: err?.stack,
          userId: result.user.id
        });
      });

    // Log registration
    await auditLogService.log({
      userId: result.user.id,
      action: 'farmer_registered',
      details: { hasAadhaar: true },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      message: 'Account created successfully. Please click "Send OTP" to receive your verification code.',
      requiresOtpVerification: true,
      requiresManualOtpRequest: true, // Indicates OTP needs to be requested manually
      otp: process.env.NODE_ENV === 'development' ? result.otp : undefined // Only in dev mode
    });
  } catch (error: any) {
    Logger.error('Farmer signup error', {
      error: error.message,
      stack: error.stack,
      mobileNumber: req.body.mobileNumber
    });
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'A farmer with this mobile number or Aadhaar already exists.' });
    }
    if (error.message?.includes('Aadhaar')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({
      message: 'Server error during signup',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current user (authenticated)
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        role: true,
        name: true,
        email: true,
        mobileNumber: true,
        profilePhoto: true,
        status: true,
        isApproved: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is banned
    if (user.status === 'banned') {
      return res.status(403).json({ message: 'Account has been banned' });
    }

    res.json(user);
  } catch (error) {
    Logger.error('Error fetching current user', { error, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot Password - Step 1: Request Reset Link
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { insurer: true } // Check if user is insurer
    });

    if (!user) {
      // Security: Don't reveal if user exists or not
      return res.json({ message: 'If this email exists, a password reset link has been sent.' });
    }

    if (user.role === 'FARMER') {
      return res.status(400).json({
        message: 'Farmers do not use passwords. Please login with OTP.'
      });
    }

    // Generate token (simple random string for demo, JWT in production)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Store token in user record
    await (prisma.user as any).update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires: resetExpires
      }
    });

    // Mock Email sending
    Logger.auth.otp('Password reset requested', { email, resetToken });

    res.json({
      message: 'Password reset link sent to your email.',
      // DEMO ONLY: Return token to allow testing without email server
      demoResetToken: resetToken,
      demoResetLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`
    });

  } catch (error) {
    Logger.error('Forgot password error', { error, email });
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot Password - Step 2: Reset Password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Find user by valid token
    const user = await (prisma.user as any).findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear token
    await (prisma.user as any).update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null
      }
    });

    Logger.auth.login('Password reset successfully', { userId: user.id });
    res.json({ message: 'Password reset successfully. You can now login with your new password.' });

  } catch (error) {
    Logger.error('Reset password error', { error });
    res.status(500).json({ message: 'Server error' });
  }
});

// Change Password (Authenticated)
router.put('/change-password', authenticateToken, async (req: AuthRequest, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || !user.password) {
      return res.status(404).json({ message: 'User not found or password login not available' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashedPassword }
    });

    Logger.auth.login('Password changed successfully', { userId: user.id });
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    Logger.error('Change password error', { error, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
