/**
 * Script to create test users in MongoDB
 * Run with: node create-test-users.js
 * Make sure MongoDB is running and MONGO_URI is set in .env
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema (simplified)
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true },
  password: { type: String },
  role: { type: String, required: true, enum: ['SUPER_ADMIN', 'ADMIN', 'SERVICE_PROVIDER', 'FARMER'] },
  name: { type: String, required: true },
  profilePhoto: { type: String },
  mobileNumber: { type: String, unique: true, sparse: true },
  otp: { type: String },
  otpExpires: { type: Date },
  status: { type: String, enum: ['active', 'banned', 'pending'], default: 'active' },
  isApproved: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function createTestUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/claim-easy');
    console.log('✅ Connected to MongoDB');

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Super Admin User (First Admin)
    const superAdminExists = await User.findOne({ email: 'superadmin@test.com' });
    if (!superAdminExists) {
      const superAdmin = new User({
        name: 'Super Admin',
        email: 'superadmin@test.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        status: 'active',
        isApproved: true
      });
      await superAdmin.save();
      console.log('✅ Created Super Admin user: superadmin@test.com / password123');
    } else {
      console.log('ℹ️  Super Admin user already exists');
    }

    // Create Admin User
    const adminExists = await User.findOne({ email: 'admin@test.com' });
    if (!adminExists) {
      const admin = new User({
        name: 'Admin User',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'active',
        isApproved: true
      });
      await admin.save();
      console.log('✅ Created Admin user: admin@test.com / password123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create Service Provider User (Approved)
    const providerExists = await User.findOne({ email: 'provider@test.com' });
    if (!providerExists) {
      const provider = new User({
        name: 'Service Provider',
        email: 'provider@test.com',
        password: hashedPassword,
        role: 'SERVICE_PROVIDER',
        status: 'active',
        isApproved: true
      });
      await provider.save();
      console.log('✅ Created Service Provider user: provider@test.com / password123');
    } else {
      console.log('ℹ️  Service Provider user already exists');
    }

    // Create Farmer User
    const farmerExists = await User.findOne({ mobileNumber: '1234567890' });
    if (!farmerExists) {
      const farmer = new User({
        name: 'Farmer User',
        mobileNumber: '1234567890',
        role: 'FARMER',
        status: 'active'
      });
      await farmer.save();
      console.log('✅ Created Farmer user: mobile 1234567890');
    } else {
      console.log('ℹ️  Farmer user already exists');
    }

    console.log('\n🎉 Test users created successfully!');
    console.log('\nLogin Credentials:');
    console.log('Super Admin: superadmin@test.com / password123');
    console.log('Admin: admin@test.com / password123');
    console.log('Service Provider: provider@test.com / password123');
    console.log('Farmer: mobile 1234567890 (use OTP flow)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    process.exit(1);
  }
}

createTestUsers();

