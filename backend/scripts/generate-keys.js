/**
 * Script to generate secure keys for environment variables
 * Run: node scripts/generate-keys.js
 */

const crypto = require('crypto');

console.log('🔐 Generating secure keys for Claimeasy...\n');

// Generate JWT Secret (64 bytes = 512 bits)
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('JWT_SECRET=' + jwtSecret);

// Generate Encryption Key (32 bytes for AES-256)
const encryptionKey = crypto.randomBytes(32).toString('hex');
console.log('ENCRYPTION_KEY=' + encryptionKey);

// Generate Aadhaar HMAC Key (32 bytes)
const aadhaarHmacKey = crypto.randomBytes(32).toString('hex');
console.log('AADHAAR_HMAC_KEY=' + aadhaarHmacKey);

console.log('\n✅ Keys generated successfully!');
console.log('\n📝 Copy these values to your .env file in the backend directory.');
console.log('⚠️  Keep these keys secure and never commit them to version control!');
console.log('⚠️  In production, use a secrets manager (AWS Secrets Manager, etc.)');

