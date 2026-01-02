import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { prisma } from './db';
import { Logger } from './utils/logger';
import { securityHeaders, rateLimiter } from './middleware/security';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import serviceProviderRoutes from './routes/serviceProvider.routes';
import claimRoutes from './routes/claim.routes';
import farmDetailsRoutes from './routes/farmDetails.routes';
import policyRoutes from './routes/policy.routes';
import cropRoutes from './routes/crop.routes';
import reportRoutes from './routes/report.routes';
import auditLogRoutes from './routes/auditLog.routes';
import systemSettingsRoutes from './routes/systemSettings.routes';
import serviceProviderActionsRoutes from './routes/serviceProviderActions.routes';
import dashboardRoutes from './routes/dashboard.routes';
import farmerRoutes from './routes/farmer.routes';
import notificationRoutes from './routes/notification.routes';
import userPreferencesRoutes from './routes/userPreferences.routes';
import consentRoutes from './routes/consent.routes';
import policyRequestRoutes from './routes/policyRequest.routes';
import sessionRoutes from './routes/session.routes';
import deletionRoutes from './routes/deletion.routes';
import adminRoutes from './routes/admin.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Serve static frontend files - DO THIS FIRST to avoid middleware interference
const frontendPath = path.resolve(process.cwd(), 'public');
app.use(express.static(frontendPath));

// CORS configuration - MUST be before other middleware
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5174', // Vite sometimes uses different port
  'http://localhost:5175', // Vite may use this port too
  'http://localhost:3000',
  'http://localhost:5173',
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all localhost origins
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined;
    if (isDevelopment) {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Don't throw error, just deny
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin',
    'Idempotency-Key',  // Allow idempotency key header for claim submissions
    'idempotency-key'   // Also allow lowercase version
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200,
  preflightContinue: false
};
app.use(cors(corsOptions));

// Security middleware (after CORS)
app.use(securityHeaders);
import { ipRateLimiter } from './middleware/security';
app.use(ipRateLimiter); // Global rate limiter

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', userRoutes);
app.use('/api/admin', serviceProviderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/service-provider', serviceProviderActionsRoutes);
app.use('/api', claimRoutes);
app.use('/api', farmDetailsRoutes);
app.use('/api', policyRoutes);
app.use('/api', cropRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', auditLogRoutes);
app.use('/api/admin', systemSettingsRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api', farmerRoutes);
app.use('/api', notificationRoutes);
app.use('/api', userPreferencesRoutes);
app.use('/api', consentRoutes);
app.use('/api', policyRequestRoutes);
app.use('/api', sessionRoutes);
app.use('/api/admin', deletionRoutes);
// Mount service provider routes for farmer access to approved providers
app.use('/api', serviceProviderRoutes);

// Serve uploaded files (documents and images)
const uploadsDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// SPA Fallback: Serve index.html for any unknown non-API routes
app.get('*path', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) {
      next();
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Error handling middleware (must be after all routes)
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
app.use(notFoundHandler);
app.use(errorHandler);

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'ENCRYPTION_KEY', 'AADHAAR_HMAC_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  Logger.error('Missing required environment variables', { missing: missingEnvVars });
  Logger.error('Please create a .env file with the required variables.');
  Logger.error('See backend/ENV_SETUP.md for setup instructions.');
  process.exit(1);
}

async function start() {
  try {
    await prisma.$connect();
    Logger.db.connect('Connected to PostgreSQL');
    
    // Start background jobs
    const { policySyncJob } = await import('./jobs/policySync.job');
    const { retentionJob } = await import('./jobs/retention.job');
    const { metricsJob } = await import('./jobs/metrics.job');
    
    policySyncJob.start();
    retentionJob.start();
    metricsJob.start();
    
    app.listen(port, () => {
      Logger.system.start(`Server running on port ${port}`);
    });
  } catch (err) {
    Logger.db.error('PostgreSQL connection error', { error: err });
    process.exit(1);
  }
}

start();
