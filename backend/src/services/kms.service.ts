/**
 * KMS Encryption Service
 * Handles encryption/decryption of PII using KMS-managed keys
 * For production, integrate with AWS KMS, Google Cloud KMS, or Azure Key Vault
 */

import crypto from 'crypto';

// In production, these should come from KMS/Secrets Manager
// For now, using environment variables with key rotation support
const getEncryptionKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY not configured');
  }
  // Key should be 32 bytes for AES-256
  return crypto.scryptSync(key, 'salt', 32);
};

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

export class KmsService {
  /**
   * Encrypt sensitive PII data
   */
  static encrypt(plaintext: string): string {
    if (!plaintext) return '';
    
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Return: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt sensitive PII data
   */
  static decrypt(ciphertext: string): string {
    if (!ciphertext) return '';
    
    try {
      const key = getEncryptionKey();
      const parts = ciphertext.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid ciphertext format');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];
      
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Rotate encryption key (for key rotation every 90 days)
   * In production, this should trigger re-encryption of all data
   */
  static async rotateKey(): Promise<void> {
    // TODO: Implement key rotation logic
    // 1. Generate new key
    // 2. Re-encrypt all encrypted fields with new key
    // 3. Update key in Secrets Manager
  }
}

