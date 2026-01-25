/**
 * Frontend Logging Utility
 * Provides consistent logging across the frontend application
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMeta {
  [key: string]: any;
}

class FrontendLogger {
  private isDevelopment = import.meta.env.DEV;

  private formatLog(level: LogLevel, category: string, message: string, meta?: LogMeta): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${category}] ${message}${metaStr}`;
  }

  private log(level: LogLevel, category: string, message: string, meta?: LogMeta) {
    const logMessage = this.formatLog(level, category, message, meta);

    // Always log to console in development
    if (this.isDevelopment) {
      const colors: Record<LogLevel, string> = {
        error: '\x1b[31m', // Red
        warn: '\x1b[33m',  // Yellow
        info: '\x1b[32m',  // Green
        debug: '\x1b[36m', // Cyan
      };
      const reset = '\x1b[0m';
      const color = colors[level] || '';
      console.log(`${color}${logMessage}${reset}`);
    } else {
      // In production, only log errors and warnings
      if (level === 'error' || level === 'warn') {
        console[level](logMessage);
      }
    }

    // Optionally send to backend logging service in production
    if (!this.isDevelopment && (level === 'error' || level === 'warn')) {
      // TODO: Send to backend logging endpoint
      // fetch('/api/logs', { method: 'POST', body: JSON.stringify({ level, category, message, meta }) });
    }
  }

  // Admin Operations
  admin = {
    action: (message: string, meta?: LogMeta) => this.log('info', 'ADMIN', message, meta),
    view: (message: string, meta?: LogMeta) => this.log('info', 'ADMIN', `VIEW: ${message}`, meta),
    approve: (message: string, meta?: LogMeta) => this.log('info', 'ADMIN', `APPROVE: ${message}`, meta),
    reject: (message: string, meta?: LogMeta) => this.log('warn', 'ADMIN', `REJECT: ${message}`, meta),
    delete: (message: string, meta?: LogMeta) => this.log('warn', 'ADMIN', `DELETE: ${message}`, meta),
    error: (message: string, meta?: LogMeta) => this.log('error', 'ADMIN', message, meta),
  };

  // Farmer Operations
  farmer = {
    register: (message: string, meta?: LogMeta) => this.log('info', 'FARMER', `REGISTER: ${message}`, meta),
    login: (message: string, meta?: LogMeta) => this.log('info', 'FARMER', `LOGIN: ${message}`, meta),
    policy: (message: string, meta?: LogMeta) => this.log('info', 'FARMER', `POLICY: ${message}`, meta),
    claim: (message: string, meta?: LogMeta) => this.log('info', 'FARMER', `CLAIM: ${message}`, meta),
    request: (message: string, meta?: LogMeta) => this.log('info', 'FARMER', `REQUEST: ${message}`, meta),
    error: (message: string, meta?: LogMeta) => this.log('error', 'FARMER', message, meta),
  };

  // Insurer Operations
  // Insurer Operations
  insurer = {
    login: (message: string, meta?: LogMeta) => this.log('info', 'INSURER', `LOGIN: ${message}`, meta),
    view: (message: string, meta?: LogMeta) => this.log('info', 'INSURER', `VIEW: ${message}`, meta),
    policy: (message: string, meta?: LogMeta) => this.log('info', 'INSURER', `POLICY: ${message}`, meta),
    claim: (message: string, meta?: LogMeta) => this.log('info', 'INSURER', `CLAIM: ${message}`, meta),
    approve: (message: string, meta?: LogMeta) => this.log('info', 'INSURER', `APPROVE: ${message}`, meta),
    reject: (message: string, meta?: LogMeta) => this.log('warn', 'INSURER', `REJECT: ${message}`, meta),
    error: (message: string, meta?: LogMeta) => this.log('error', 'INSURER', message, meta),
  };

  // Policy Request Operations
  policyRequest = {
    create: (message: string, meta?: LogMeta) => this.log('info', 'POLICY_REQUEST', `CREATE: ${message}`, meta),
    view: (message: string, meta?: LogMeta) => this.log('info', 'POLICY_REQUEST', `VIEW: ${message}`, meta),
    issue: (message: string, meta?: LogMeta) => this.log('info', 'POLICY_REQUEST', `ISSUE: ${message}`, meta),
    reject: (message: string, meta?: LogMeta) => this.log('warn', 'POLICY_REQUEST', `REJECT: ${message}`, meta),
    error: (message: string, meta?: LogMeta) => this.log('error', 'POLICY_REQUEST', message, meta),
  };

  // Generic methods
  info = (message: string, meta?: LogMeta) => this.log('info', 'GENERAL', message, meta);
  warn = (message: string, meta?: LogMeta) => this.log('warn', 'GENERAL', message, meta);
  error = (message: string, meta?: LogMeta) => this.log('error', 'GENERAL', message, meta);
  debug = (message: string, meta?: LogMeta) => this.log('debug', 'GENERAL', message, meta);
}

export const logger = new FrontendLogger();
export default logger;

