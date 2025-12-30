#!/bin/bash

# Production Build Script for ClaimEasy

set -e

echo "🚀 Starting ClaimEasy production build..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Build Frontend
echo -e "${BLUE}📦 Building frontend...${NC}"
npm install
npm run build
echo -e "${GREEN}✅ Frontend build complete${NC}"

# Build Backend
echo -e "${BLUE}📦 Building backend...${NC}"
cd backend
npm install
npm run build
echo -e "${GREEN}✅ Backend build complete${NC}"

# Generate Prisma Client
echo -e "${BLUE}🔧 Generating Prisma client...${NC}"
npx prisma generate
echo -e "${GREEN}✅ Prisma client generated${NC}"

cd ..

echo -e "${GREEN}🎉 Build complete! Ready for deployment.${NC}"
echo ""
echo "Next steps:"
echo "1. Set up environment variables (.env files)"
echo "2. Run database migrations: cd backend && npx prisma migrate deploy"
echo "3. Start the server: cd backend && npm start"

