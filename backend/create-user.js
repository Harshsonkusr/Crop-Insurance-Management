/**
 * Script to create a single user (Admin or Service Provider)
 * Usage: node create-user.js <email> <password> <role> <name>
 * Example: node create-user.js ray24@gmail.com password123 ADMIN "Ray User"
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema (simplified)
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true },
  password: { type: String },
  role: { type: String, required: true, enum: ['ADMIN', 'SERVICE_PROVIDER', 'FARMER'] },
  name: { type: String, required: true },
  profilePhoto: { type: String },
  mobileNumber: { type: String, unique: true, sparse: true },
  otp: { type: String },
  otpExpires: { type: Date },
  status: { type: String, enum: ['active', 'banned'], default: 'active' },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function createUser() {
  try {
    const args = process.argv.slice(2);
    
    if (args.length < 4) {
      console.log('Usage: node create-user.js <email> <password> <role> <name>');
      console.log('Example: node create-user.js ray24@gmail.com password123 ADMIN "Ray User"');
      console.log('\nRoles: ADMIN, SERVICE_PROVIDER, FARMER');
      process.exit(1);
    }

    const [email, password, role, ...nameParts] = args;
    const name = nameParts.join(' ');

    if (!['ADMIN', 'SERVICE_PROVIDER', 'FARMER'].includes(role)) {
      console.error('Invalid role. Must be: ADMIN, SERVICE_PROVIDER, or FARMER');
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/claim-easy');
    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`\n⚠️  User with email "${email}" already exists.`);
      console.log('Options:');
      console.log('1. Use a different email');
      console.log('2. Update the existing user password');
      
      // Ask if user wants to update password
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('\nDo you want to update the password? (y/n): ', async (answer) => {
        if (answer.toLowerCase() === 'y') {
          const hashedPassword = await bcrypt.hash(password, 10);
          existingUser.password = hashedPassword;
          existingUser.role = role;
          existingUser.name = name;
          await existingUser.save();
          console.log(`✅ Updated user: ${email} / ${password} (${role})`);
        } else {
          console.log('Cancelled. User not updated.');
        }
        rl.close();
        await mongoose.disconnect();
        process.exit(0);
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      status: 'active'
    });

    await user.save();
    console.log(`\n✅ Created ${role} user successfully!`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Name: ${name}`);
    console.log(`Role: ${role}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    if (error.code === 11000) {
      console.error('A user with this email already exists.');
    }
    process.exit(1);
  }
}

createUser();

