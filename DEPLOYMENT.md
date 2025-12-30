# 🚀 ClaimEasy Deployment Guide

This guide will help you deploy ClaimEasy to production.

## 📋 Prerequisites

- Node.js 22+ and npm
- PostgreSQL 15+
- Docker and Docker Compose (optional)
- Domain name and SSL certificate (for production)

## 🔧 Deployment Options

### Option 1: Frontend on Vercel (Current Choice)
If you want to deploy only the frontend to Vercel for now:
1.  **Connect your repo to Vercel.**
2.  **Build Settings**: Vercel should auto-detect Vite.
    *   Build Command: `npm run build`
    *   Output Directory: `dist`
3.  **Environment Variables**:
    *   Add `VITE_API_BASE_URL`: The URL of your backend (e.g., `https://your-backend.up.railway.app/api`).
4.  **Routing**: The included `vercel.json` handles SPA routing so your pages work on refresh.

---

### Option 2: Unified Deployment on Railway (Recommended for Full Stack)
This method deploys both Frontend and Backend as a single service using the `Dockerfile` in the root directory.

1.  **Push your code to GitHub.**
2.  **Create a new Project on Railway.**
3.  **Deploy from GitHub repo.**
4.  **Add Environment Variables in Railway:**
    *   `DATABASE_URL`: Your PostgreSQL connection string.
    *   `JWT_SECRET`: Secure random string.
    *   `ENCRYPTION_KEY`: 32-byte hex string.
    *   `AADHAAR_HMAC_KEY`: 32-byte hex string.
    *   `NODE_ENV`: `production`
    *   `PORT`: Railway will set this automatically.

The `Dockerfile` handles:
*   Building the Frontend (Vite) with `VITE_API_BASE_URL=/api`.
*   Building the Backend (TypeScript).
*   Serving the Frontend static files from the Backend.

---

### Option 3: Docker Compose (Local / VPS)
This is the easiest way to deploy the entire stack on a VPS or locally.

#### Step 1: Configure Environment Variables
Create a `.env` file in the root directory:
```bash
DB_PASSWORD=your-secure-database-password
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key
AADHAAR_HMAC_KEY=your-hmac-key
FRONTEND_URL=https://your-domain.com
```

#### Step 2: Build and Start
```bash
docker-compose up -d
docker-compose exec backend npx prisma migrate deploy
```
