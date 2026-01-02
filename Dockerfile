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
FROM node:22 AS backend-builder
WORKDIR /app
COPY backend/package*.json ./
# Skip automatic prisma generate during install
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1
RUN npm ci --silent
COPY backend/ .
# Provide a dummy DATABASE_URL for build-time validation
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
# Generate Prisma Client
RUN npx prisma generate
RUN npm run build

# Stage 3: Production runtime
FROM node:22-alpine
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat openssl

# Copy backend dependencies and build
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/prisma ./prisma
COPY --from=backend-builder /app/prisma.config.ts ./
COPY --from=backend-builder /app/package*.json ./

# Copy built frontend files
COPY --from=frontend-builder /app/dist ./public

# Copy start script
COPY start.sh ./
RUN chmod +x start.sh

# Create necessary directories
RUN mkdir -p uploads logs

# Expose port (Render uses PORT env var)
EXPOSE 5000

# Start the application via start script
CMD ["./start.sh"]
