/**
 * Centralized Logging Utility
 * Provides consistent logging across the application
 */

import fs from 'fs';
import path from 'path';
import { RedactionService } from './redaction';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const errorLogPath = path.join(logsDir, 'error.log');
const combinedLogPath = path.join(logsDir, 'combined.log');

// Helper to format log message with PII redaction
const formatLog = (level: string, message: string, meta?: any): string => {
  const timestamp = new Date().toISOString();
  // Redact PII from metadata before logging
  const redactedMeta = meta ? RedactionService.redactLogMeta(meta) : undefined;
  const metaStr = redactedMeta ? ` ${JSON.stringify(redactedMeta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaStr}\n`;
};

// Helper to write to file
const writeToFile = (filePath: string, content: string) => {
  try {
    fs.appendFileSync(filePath, content, 'utf8');
  } catch (error) {
    // Fallback to console if file write fails
    process.stdout.write(content);
  }
};

// Helper to write to console (only in development)
const writeToConsole = (level: string, message: string, meta?: any) => {
  if (process.env.NODE_ENV !== 'production') {
    const colors: Record<string, string> = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m',  // Yellow
      INFO: '\x1b[32m',  // Green
      DEBUG: '\x1b[36m', // Cyan
    };
    const reset = '\x1b[0m';
    const color = colors[level] || '';
    const metaStr = meta ? ` ${JSON.stringify(meta, null, 2)}` : '';
    process.stdout.write(`${color}[${level}]${reset} ${message}${metaStr}\n`);
  }
};

export class Logger {
  // Authentication & User Management
  static auth = {
    login: (message: string, meta?: any) => {
      const log = formatLog('INFO', `AUTH LOGIN: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `AUTH LOGIN: ${message}`, meta);
    },
    logout: (message: string, meta?: any) => {
      const log = formatLog('INFO', `AUTH LOGOUT: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `AUTH LOGOUT: ${message}`, meta);
    },
    signup: (message: string, meta?: any) => {
      const log = formatLog('INFO', `AUTH SIGNUP: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `AUTH SIGNUP: ${message}`, meta);
    },
    otp: (message: string, meta?: any) => {
      const log = formatLog('INFO', `AUTH OTP: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `AUTH OTP: ${message}`, meta);
    },
    failed: (message: string, meta?: any) => {
      const log = formatLog('WARN', `AUTH FAILED: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToFile(errorLogPath, log);
      writeToConsole('WARN', `AUTH FAILED: ${message}`, meta);
    },
  };

  // Farmer Operations
  static farmer = {
    registered: (message: string, meta?: any) => {
      const log = formatLog('INFO', `FARMER REGISTERED: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `FARMER REGISTERED: ${message}`, meta);
    },
    profile: (message: string, meta?: any) => {
      const log = formatLog('INFO', `FARMER PROFILE: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `FARMER PROFILE: ${message}`, meta);
    },
    policies: (message: string, meta?: any) => {
      const log = formatLog('INFO', `FARMER POLICIES: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `FARMER POLICIES: ${message}`, meta);
    },
    claims: (message: string, meta?: any) => {
      const log = formatLog('INFO', `FARMER CLAIMS: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `FARMER CLAIMS: ${message}`, meta);
    },
  };

  // Service Provider Operations
  static sp = {
    registered: (message: string, meta?: any) => {
      const log = formatLog('INFO', `SP REGISTERED: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `SP REGISTERED: ${message}`, meta);
    },
    approved: (message: string, meta?: any) => {
      const log = formatLog('INFO', `SP APPROVED: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `SP APPROVED: ${message}`, meta);
    },
    rejected: (message: string, meta?: any) => {
      const log = formatLog('WARN', `SP REJECTED: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('WARN', `SP REJECTED: ${message}`, meta);
    },
    policy: (message: string, meta?: any) => {
      const log = formatLog('INFO', `SP POLICY: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `SP POLICY: ${message}`, meta);
    },
    claim: (message: string, meta?: any) => {
      const log = formatLog('INFO', `SP CLAIM: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `SP CLAIM: ${message}`, meta);
    },
  };

  // Admin Operations
  static admin = {
    action: (message: string, meta?: any) => {
      const log = formatLog('INFO', `ADMIN ACTION: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `ADMIN ACTION: ${message}`, meta);
    },
    override: (message: string, meta?: any) => {
      const log = formatLog('WARN', `ADMIN OVERRIDE: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToFile(errorLogPath, log);
      writeToConsole('WARN', `ADMIN OVERRIDE: ${message}`, meta);
    },
    system: (message: string, meta?: any) => {
      const log = formatLog('INFO', `ADMIN SYSTEM: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `ADMIN SYSTEM: ${message}`, meta);
    },
  };

  // Policy Operations
  static policy = {
    created: (message: string, meta?: any) => {
      const log = formatLog('INFO', `POLICY CREATED: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `POLICY CREATED: ${message}`, meta);
    },
    updated: (message: string, meta?: any) => {
      const log = formatLog('INFO', `POLICY UPDATED: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `POLICY UPDATED: ${message}`, meta);
    },
    synced: (message: string, meta?: any) => {
      const log = formatLog('INFO', `POLICY SYNCED: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `POLICY SYNCED: ${message}`, meta);
    },
    requested: (message: string, meta?: any) => {
      const log = formatLog('INFO', `POLICY REQUESTED: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `POLICY REQUESTED: ${message}`, meta);
    },
    issued: (message: string, meta?: any) => {
      const log = formatLog('INFO', `POLICY ISSUED: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `POLICY ISSUED: ${message}`, meta);
    },
  };

  // Claim Operations
  static claim = {
    created: (message: string, meta?: any) => {
      const log = formatLog('INFO', `CLAIM CREATED: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `CLAIM CREATED: ${message}`, meta);
    },
    updated: (message: string, meta?: any) => {
      const log = formatLog('INFO', `CLAIM UPDATED: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `CLAIM UPDATED: ${message}`, meta);
    },
    ai: (message: string, meta?: any) => {
      const log = formatLog('INFO', `CLAIM AI: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `CLAIM AI: ${message}`, meta);
    },
    status: (message: string, meta?: any) => {
      const log = formatLog('INFO', `CLAIM STATUS: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `CLAIM STATUS: ${message}`, meta);
    },
    fraud: (message: string, meta?: any) => {
      const log = formatLog('WARN', `CLAIM FRAUD: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToFile(errorLogPath, log);
      writeToConsole('WARN', `CLAIM FRAUD: ${message}`, meta);
    },
  };

  // Security & System
  static security = {
    rateLimit: (message: string, meta?: any) => {
      const log = formatLog('WARN', `SECURITY RATELIMIT: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToFile(errorLogPath, log);
      writeToConsole('WARN', `SECURITY RATELIMIT: ${message}`, meta);
    },
    validation: (message: string, meta?: any) => {
      const log = formatLog('WARN', `SECURITY VALIDATION: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('WARN', `SECURITY VALIDATION: ${message}`, meta);
    },
    file: (message: string, meta?: any) => {
      const log = formatLog('INFO', `SECURITY FILE: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `SECURITY FILE: ${message}`, meta);
    },
    consent: (message: string, meta?: any) => {
      const log = formatLog('INFO', `SECURITY CONSENT: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `SECURITY CONSENT: ${message}`, meta);
    },
  };

  // Database & System
  static db = {
    connect: (message: string, meta?: any) => {
      const log = formatLog('INFO', `DB CONNECT: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `DB CONNECT: ${message}`, meta);
    },
    query: (message: string, meta?: any) => {
      const log = formatLog('DEBUG', `DB QUERY: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('DEBUG', `DB QUERY: ${message}`, meta);
    },
    error: (message: string, meta?: any) => {
      const log = formatLog('ERROR', `DB ERROR: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToFile(errorLogPath, log);
      writeToConsole('ERROR', `DB ERROR: ${message}`, meta);
    },
  };

  static system = {
    start: (message: string, meta?: any) => {
      const log = formatLog('INFO', `SYSTEM START: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `SYSTEM START: ${message}`, meta);
    },
    stop: (message: string, meta?: any) => {
      const log = formatLog('INFO', `SYSTEM STOP: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `SYSTEM STOP: ${message}`, meta);
    },
    health: (message: string, meta?: any) => {
      const log = formatLog('INFO', `SYSTEM HEALTH: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `SYSTEM HEALTH: ${message}`, meta);
    },
    file: (message: string, meta?: any) => {
      const log = formatLog('INFO', `SYSTEM FILE: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `SYSTEM FILE: ${message}`, meta);
    },
    maintenance: (message: string, meta?: any) => {
      const log = formatLog('INFO', `SYSTEM MAINTENANCE: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `SYSTEM MAINTENANCE: ${message}`, meta);
    },
    job: (message: string, meta?: any) => {
      const log = formatLog('INFO', `SYSTEM JOB: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `SYSTEM JOB: ${message}`, meta);
    },
    metrics: (message: string, meta?: any) => {
      const log = formatLog('INFO', `SYSTEM METRICS: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `SYSTEM METRICS: ${message}`, meta);
    },
    retention: (message: string, meta?: any) => {
      const log = formatLog('INFO', `SYSTEM RETENTION: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('INFO', `SYSTEM RETENTION: ${message}`, meta);
    },
    alert: (message: string, meta?: any) => {
      const log = formatLog('WARN', `SYSTEM ALERT: ${message}`, meta);
      writeToFile(combinedLogPath, log);
      writeToFile(errorLogPath, log);
      writeToConsole('WARN', `SYSTEM ALERT: ${message}`, meta);
    },
  };

  // Generic methods
  static info = (message: string, meta?: any) => {
    const log = formatLog('INFO', message, meta);
    writeToFile(combinedLogPath, log);
    writeToConsole('INFO', message, meta);
  };

  static warn = (message: string, meta?: any) => {
    const log = formatLog('WARN', message, meta);
    writeToFile(combinedLogPath, log);
    writeToFile(errorLogPath, log);
    writeToConsole('WARN', message, meta);
  };

  static error = (message: string, meta?: any) => {
    const log = formatLog('ERROR', message, meta);
    writeToFile(combinedLogPath, log);
    writeToFile(errorLogPath, log);
    writeToConsole('ERROR', message, meta);
  };

  static debug = (message: string, meta?: any) => {
    if (process.env.NODE_ENV === 'development') {
      const log = formatLog('DEBUG', message, meta);
      writeToFile(combinedLogPath, log);
      writeToConsole('DEBUG', message, meta);
    }
  };
}

export default Logger;
