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
# Install dependencies for Prisma
RUN apk add --no-cache libc6-compat openssl
COPY backend/package*.json ./
RUN npm ci --silent
COPY backend/ .
# Generate Prisma Client
RUN npx prisma generate --schema=prisma/schema.prisma
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
COPY --from=backend-builder /app/package*.json ./

# Copy built frontend files
COPY --from=frontend-builder /app/dist ./public

# Copy start script
COPY backend/start.sh ./
RUN chmod +x start.sh

# Create necessary directories
RUN mkdir -p uploads logs

# Expose port (Render uses PORT env var)
EXPOSE 5000

# Start the application via start script
CMD ["./start.sh"]

