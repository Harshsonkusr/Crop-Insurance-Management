# 🚀 ClaimEasy Deployment Guide

This guide will help you deploy ClaimEasy to production.

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Docker and Docker Compose (optional, for containerized deployment)
- Domain name and SSL certificate (for production)

## 🔧 Deployment Options

### Option 1: Unified Deployment on Railway (Recommended)

This method deploys both Frontend and Backend as a single service using the Dockerfile in the root directory.

1.  **Push your code to GitHub.**
2.  **Create a new Project on Railway.**
3.  **Deploy from GitHub repo.**
4.  **Add Environment Variables in Railway:**
    *   `DATABASE_URL`: Your PostgreSQL connection string.
    *   `JWT_SECRET`: Secure random string.
    *   `ENCRYPTION_KEY`: 32-byte hex string.
    *   `AADHAAR_HMAC_KEY`: 32-byte hex string.
    *   `NODE_ENV`: `production`
    *   `PORT`: Railway will set this automatically (defaults to 5000 if not set, but Railway overrides it).
    *   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (if using Cloudinary).

The `Dockerfile` handles:
*   Building the Frontend (Vite) with `VITE_API_BASE_URL=/api`.
*   Building the Backend (TypeScript).
*   Serving the Frontend static files from the Backend.

### Option 2: Docker Compose (Local / VPS)

This is the easiest way to deploy the entire stack on a VPS or locally.

#### Step 1: Clone and Setup

```bash
git clone <repository-url>
cd ClaimEasy
```

#### Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
DB_PASSWORD=your-secure-database-password

# JWT Secret (generate using: node backend/scripts/generate-keys.js)
JWT_SECRET=your-jwt-secret-key

# Encryption Key (generate using: node backend/scripts/generate-keys.js)
ENCRYPTION_KEY=your-encryption-key

# Aadhaar HMAC Key (generate using: node backend/scripts/generate-keys.js)
AADHAAR_HMAC_KEY=your-hmac-key

# Frontend URL
FRONTEND_URL=https://your-domain.com
```

#### Step 3: Generate Keys

```bash
cd backend
node scripts/generate-keys.js
```

Copy the generated keys to your `.env` file.

#### Step 4: Build and Start

```bash
docker-compose up -d
```

#### Step 5: Run Database Migrations

```bash
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma generate
```

#### Step 6: Create Admin User

```bash
docker-compose exec backend npm run create:admin
```

### Option 3: Manual Deployment

#### Backend Deployment

1. **Install Dependencies**

```bash
cd backend
npm install
```

2. **Configure Environment**

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Build TypeScript**

```bash
npm run build
```

4. **Setup Database**

```bash
npx prisma migrate deploy
npx prisma generate
```

5. **Start Server**

```bash
npm start
```

#### Frontend Deployment

1. **Install Dependencies**

```bash
npm install
```

2. **Build**

```bash
npm run build
```

3. **Serve**
Serve the `dist` directory using a static file server (e.g., Nginx, serve).
