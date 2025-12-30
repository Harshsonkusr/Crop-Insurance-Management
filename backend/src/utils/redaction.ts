/**
 * PII Redaction Utilities
 * Masks sensitive data in logs to prevent data leaks
 */

export class RedactionService {
  /**
   * Mask phone number (shows only last 4 digits)
   */
  static maskPhone(phone: string | null | undefined): string {
    if (!phone) return '***';
    if (phone.length < 4) return '***';
    return `***${phone.slice(-4)}`;
  }

  /**
   * Mask email (shows only first 2 chars and domain)
   */
  static maskEmail(email: string | null | undefined): string {
    if (!email) return '***';
    const [local, domain] = email.split('@');
    if (!domain) return '***';
    if (local.length <= 2) return `***@${domain}`;
    return `${local.slice(0, 2)}***@${domain}`;
  }

  /**
   * Mask Aadhaar (shows only last 4 digits)
   */
  static maskAadhaar(aadhaar: string | null | undefined): string {
    if (!aadhaar) return '***';
    if (aadhaar.length < 4) return '***';
    return `****-****-${aadhaar.slice(-4)}`;
  }

  /**
   * Mask Aadhaar hash (shows only first 8 chars)
   */
  static maskAadhaarHash(hash: string | null | undefined): string {
    if (!hash) return '***';
    if (hash.length < 8) return '***';
    return `${hash.slice(0, 8)}...`;
  }

  /**
   * Redact PII from object recursively
   */
  static redactObject(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    
    const redacted = Array.isArray(obj) ? [...obj] : { ...obj };
    
    for (const key in redacted) {
      const value = redacted[key];
      const keyLower = key.toLowerCase();
      
      // Redact phone numbers
      if (keyLower.includes('phone') || keyLower.includes('mobile')) {
        redacted[key] = this.maskPhone(value);
      }
      // Redact emails
      else if (keyLower.includes('email')) {
        redacted[key] = this.maskEmail(value);
      }
      // Redact Aadhaar
      else if (keyLower.includes('aadhaar')) {
        if (keyLower.includes('hash')) {
          redacted[key] = this.maskAadhaarHash(value);
        } else {
          redacted[key] = this.maskAadhaar(value);
        }
      }
      // Recursively redact nested objects
      else if (value && typeof value === 'object') {
        redacted[key] = this.redactObject(value);
      }
    }
    
    return redacted;
  }

  /**
   * Redact PII from log metadata
   */
  static redactLogMeta(meta: any): any {
    if (!meta) return meta;
    return this.redactObject(meta);
  }
}

