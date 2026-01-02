import { prisma } from './db';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

async function seed() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@claimeasy.com' },
    update: {},
    create: {
      email: 'superadmin@claimeasy.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: UserRole.SUPER_ADMIN,
      status: 'active',
      isApproved: true,
    },
  });
  console.log(`✅ Created Super Admin: ${superAdmin.email}`);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@claimeasy.com' },
    update: {},
    create: {
      email: 'admin@claimeasy.com',
      password: hashedPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
      status: 'active',
      isApproved: true,
    },
  });
  console.log(`✅ Created Admin: ${admin.email}`);

  // Create Farmer
  const farmer = await prisma.user.upsert({
    where: { mobileNumber: '1234567890' },
    update: {},
    create: {
      mobileNumber: '1234567890',
      name: 'Test Farmer',
      role: UserRole.FARMER,
      status: 'active',
    },
  });
  console.log(`✅ Created Farmer: ${farmer.mobileNumber}`);

  console.log('🏁 Seeding completed!');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
