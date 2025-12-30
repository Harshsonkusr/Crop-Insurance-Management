/**
 * File Validation and Scanning Service
 * Validates file types, sizes, and scans for malware
 */

import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

interface FileValidationResult {
  valid: boolean;
  error?: string;
  fileSize?: number;
  mimeType?: string;
  checksum?: string;
}

// Allowed file types and size limits
const FILE_LIMITS = {
  image: {
    types: ['image/jpeg', 'image/jpg', 'image/png'],
    maxSize: 10 * 1024 * 1024, // 10 MB
    extensions: ['.jpg', '.jpeg', '.png'],
  },
  document: {
    types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSize: 20 * 1024 * 1024, // 20 MB
    extensions: ['.pdf', '.doc', '.docx'],
  },
  video: {
    types: ['video/mp4'],
    maxSize: 50 * 1024 * 1024, // 50 MB
    extensions: ['.mp4'],
  },
};

export class FileValidationService {
  /**
   * Validate file type and size
   */
  static async validateFile(
    filePath: string,
    expectedKind: 'image' | 'document' | 'video'
  ): Promise<FileValidationResult> {
    try {
      const stats = await fs.promises.stat(filePath);
      const fileSize = stats.size;

      // Check file size
      const limits = FILE_LIMITS[expectedKind];
      if (fileSize > limits.maxSize) {
        return {
          valid: false,
          error: `File size exceeds limit of ${limits.maxSize / 1024 / 1024}MB`,
        };
      }

      // Check file extension
      const ext = path.extname(filePath).toLowerCase();
      if (!limits.extensions.includes(ext)) {
        return {
          valid: false,
          error: `Invalid file extension. Allowed: ${limits.extensions.join(', ')}`,
        };
      }

      // Detect MIME type (basic check)
      // In production, use a library like 'file-type' for accurate MIME detection
      const mimeType = this.detectMimeType(ext);

      // Generate checksum
      const checksum = await this.generateChecksum(filePath);

      return {
        valid: true,
        fileSize,
        mimeType,
        checksum,
      };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message || 'File validation failed',
      };
    }
  }

  /**
   * Generate SHA-256 checksum for file
   */
  static async generateChecksum(filePath: string): Promise<string> {
    const fileBuffer = await fs.promises.readFile(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  /**
   * Detect MIME type from extension (basic)
   * In production, use 'file-type' library for accurate detection
   */
  private static detectMimeType(ext: string): string {
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.mp4': 'video/mp4',
    };
    return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * Scan file for malware (placeholder - integrate with ClamAV or 3rd-party API)
   */
  static async scanFile(filePath: string): Promise<{ clean: boolean; result?: any }> {
    // TODO: Integrate with ClamAV or cloud scanning service
    // Example with ClamAV:
    // const { exec } = require('child_process');
    // return new Promise((resolve) => {
    //   exec(`clamdscan ${filePath}`, (error, stdout) => {
    //     if (error) {
    //       resolve({ clean: false, result: stdout });
    //     } else {
    //       resolve({ clean: true });
    //     }
    //   });
    // });

    // For now, return clean (no scanning implemented)
    return { clean: true };
  }

  /**
   * Validate image dimensions (if needed)
   */
  static async validateImageDimensions(filePath: string, maxWidth?: number, maxHeight?: number): Promise<boolean> {
    // TODO: Use sharp or jimp to read image dimensions
    // For now, skip dimension validation
    return true;
  }
}

