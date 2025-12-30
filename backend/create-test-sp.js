const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/claimeasy';

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function createTestServiceProvider() {
  try {
    console.log('Creating test service provider...');

    // Create user account
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        name: 'Test Insurance Provider',
        email: 'provider@test.com',
        password: hashedPassword,
        role: 'SERVICE_PROVIDER',
        status: 'active',
        isApproved: true,
      },
    });

    console.log('Created user:', user.id);

    // Create service provider record
    const serviceProvider = await prisma.serviceProvider.create({
      data: {
        userId: user.id,
        name: 'Test Insurance Provider',
        email: 'provider@test.com',
        phone: '+91-9876543210',
        address: '123 Insurance Street, Mumbai, Maharashtra',
        serviceType: 'Crop Insurance',
        status: 'active',
        kycVerified: true,
        licenseNumber: 'LIC123456789',
      },
    });

    console.log('Created service provider:', serviceProvider.id);
    console.log('✅ Test service provider created successfully!');
    console.log('Login credentials: provider@test.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error creating test service provider:', error);
    process.exit(1);
  }
}

createTestServiceProvider();
