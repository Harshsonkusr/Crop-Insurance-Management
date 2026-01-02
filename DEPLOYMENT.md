# 🚀 ClaimEasy Unified Deployment Guide

This guide describes how to deploy ClaimEasy as a **single container** (Frontend + Backend) to platforms like **Render** or **Railway**.

## 📋 Prerequisites

- A GitHub repository with your code.
- A PostgreSQL database (Render Blueprint or External DB).
- Environment variables for security.

## 🔧 Deployment Steps (Render/Railway)

### Step 1: Push to GitHub
Ensure your latest changes are pushed to your repository:
```bash
git add .
git commit -m "Prepare for unified deployment"
git push origin main
```

### Step 2: Configure Environment Variables
In your deployment dashboard (Render/Railway), add the following environment variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `JWT_SECRET` | Secret for token signing (Run `node backend/scripts/generate-keys.js`) |
| `ENCRYPTION_KEY` | Key for data encryption (Run `node backend/scripts/generate-keys.js`) |
| `AADHAAR_HMAC_KEY` | Key for HMAC (Run `node backend/scripts/generate-keys.js`) |
| `NODE_ENV` | Set to `production` |
| `PORT` | Set to `5000` (Render/Railway usually detects this) |

### Step 3: Deploy on Render
1. Create a new **Web Service**.
2. Connect your GitHub repository.
3. Select **Docker** as the runtime.
4. Render will automatically use the `Dockerfile` in the root directory.
5. Add the environment variables in the **Env Vars** tab.
6. Click **Create Web Service**.

### Step 4: Real SMS Setup (Twilio)
To enable real SMS instead of logs:
1. Sign up at [Twilio.com](https://www.twilio.com/).
2. In the Twilio Console, copy your **Account SID** and **Auth Token**.
3. Click "Get a Trial Number" to get your **Twilio Phone Number**.
4. Add these to your Render/Railway Env Vars:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`
5. **Note:** On trial accounts, you must verify your own phone number in Twilio under "Verified Caller IDs" to receive SMS.

### Step 5: Custom Superadmin
To set your own admin email and password:
1. Add these Env Vars to Render/Railway:
   - `SUPER_ADMIN_EMAIL`
   - `SUPER_ADMIN_PASSWORD`
2. Run the seed command in your hosting dashboard shell:
   ```bash
   npm run db:seed
   ```

## 🛠️ Maintenance

### Running Migrations
The deployment process automatically runs `npx prisma migrate deploy` via the `start.sh` script.

### Seeding the Database
To seed the database with initial data:
```bash
# Locally
npm run db:seed
```

## 🔐 Security Keys
If you need new keys, run:
```bash
node backend/scripts/generate-keys.js
```
Copy the output into your environment variable settings.npx prisma migrate deploy
npx prisma generate
```

5. **Start Server**

```bash
# Production
npm start

# Or with PM2 (recommended)
npm install -g pm2
pm2 start dist/index.js --name claimeasy-backend
pm2 save
pm2 startup
```

#### Frontend Deployment

1. **Install Dependencies**

```bash
npm install
```

2. **Configure Environment**

```bash
cp .env.example .env
# Edit .env with your API URL
```

3. **Build for Production**

```bash
npm run build
```

4. **Deploy Static Files**

The `dist` folder contains the built frontend. Deploy it to:
- **Nginx**: Copy `dist/*` to `/var/www/html/`
- **Apache**: Copy `dist/*` to `/var/www/html/`
- **Vercel/Netlify**: Connect your repository and set build command to `npm run build`
- **AWS S3 + CloudFront**: Upload `dist/*` to S3 bucket and configure CloudFront

### Option 3: Cloud Platform Deployment

#### Vercel (Frontend)

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_BASE_URL`

#### Railway/Render (Backend)

1. Connect your GitHub repository
2. Set build command: `cd backend && npm install && npm run build`
3. Set start command: `cd backend && npm start`
4. Add environment variables from `.env.example`
5. Add PostgreSQL database addon

#### AWS Elastic Beanstalk

1. Install EB CLI: `npm install -g eb-cli`
2. Initialize: `eb init`
3. Create environment: `eb create`
4. Deploy: `eb deploy`

## 🔐 Security Checklist

- [ ] Change all default passwords
- [ ] Use strong, unique keys for JWT_SECRET, ENCRYPTION_KEY, AADHAAR_HMAC_KEY
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly (update FRONTEND_URL)
- [ ] Set up firewall rules
- [ ] Enable database backups
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerts
- [ ] Review and update security headers
- [ ] Enable file scanning (ClamAV or cloud service)

## 📊 Database Setup

### PostgreSQL Configuration

```sql
-- Create database
CREATE DATABASE claimeasy;

-- Create user (optional)
CREATE USER claimeasy WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE claimeasy TO claimeasy;
```

### Run Migrations

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

## 🔄 Environment Variables

### Backend (.env)

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens (min 32 chars)
- `ENCRYPTION_KEY` - 32-byte hex key for PII encryption
- `AADHAAR_HMAC_KEY` - 32-byte hex key for Aadhaar hashing

Optional variables:
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS
- `UPLOAD_DIR` - Upload directory path
- `MAX_FILE_SIZE` - Max file size in bytes

### Frontend (.env)

Required variables:
- `VITE_API_BASE_URL` - Backend API URL

## 🚀 Production Optimizations

### 1. Enable Caching

- Configure Nginx caching for static assets
- Set appropriate cache headers
- Use CDN for static files

### 2. Database Optimization

- Enable connection pooling
- Set up read replicas for scaling
- Configure database backups

### 3. Monitoring

- Set up application monitoring (e.g., PM2, New Relic)
- Configure log aggregation
- Set up error tracking (e.g., Sentry)
- Monitor database performance

### 4. Scaling

- Use load balancer for multiple backend instances
- Configure horizontal scaling
- Set up auto-scaling based on load

## 📝 Post-Deployment

1. **Create Admin User**

```bash
cd backend
npm run create:admin
```

2. **Verify Health**

```bash
curl http://your-domain.com/health
```

3. **Test API**

```bash
curl http://your-domain.com/api/auth/health
```

4. **Monitor Logs**

```bash
# Docker
docker-compose logs -f backend

# PM2
pm2 logs claimeasy-backend
```

## 🔧 Troubleshooting

### Database Connection Issues

- Verify DATABASE_URL format
- Check database is running
- Verify network connectivity
- Check firewall rules

### CORS Issues

- Verify FRONTEND_URL matches your frontend domain
- Check CORS configuration in backend/src/index.ts

### File Upload Issues

- Verify UPLOAD_DIR exists and is writable
- Check MAX_FILE_SIZE setting
- Verify disk space

### Build Issues

- Clear node_modules and reinstall
- Check Node.js version (18+)
- Verify all environment variables are set

## 📞 Support

For deployment issues, check:
- [ENV_SETUP.md](./backend/ENV_SETUP.md) - Environment setup
- [ENV_TROUBLESHOOTING.md](./backend/ENV_TROUBLESHOOTING.md) - Troubleshooting
- [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md) - Production checklist

## 🎯 Next Steps

1. Set up SSL certificate (Let's Encrypt)
2. Configure domain DNS
3. Set up monitoring and alerts
4. Configure automated backups
5. Set up CI/CD pipeline
6. Configure file scanning service
7. Integrate external insurer APIs

