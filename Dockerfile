# Multi-stage build for production

# Stage 1: Build frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
# Set API URL to relative path for unified deployment
ENV VITE_API_BASE_URL=/api
RUN npm run build

# Stage 2: Build backend
FROM node:22-alpine AS backend-builder
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --silent
COPY backend/ .
# Generate Prisma client before building (schema file is available now)
RUN npx prisma generate
RUN npm run build

# Stage 3: Production runtime
FROM node:22-alpine
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat openssl

# Install production dependencies for backend
COPY backend/package*.json ./
RUN npm ci --only=production --silent

# Copy built backend files
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/prisma ./prisma

# Copy built frontend files
COPY --from=frontend-builder /app/dist ./public

# Create necessary directories
RUN mkdir -p uploads logs

# Generate Prisma Client at runtime (when env vars are available)
# This will be done in the CMD script

# Expose port
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "const http=require('http'); const req=http.request({hostname:'localhost',port:process.env.PORT||5000,path:'/health'},(res)=>{process.exit(res.statusCode===200?0:1)}); req.on('error',()=>process.exit(1)); req.end();"

# Start the application
CMD ["node", "dist/index.js"]

