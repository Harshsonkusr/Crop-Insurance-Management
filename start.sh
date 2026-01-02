#!/bin/sh
set -e

# Run migrations if DATABASE_URL is present
if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  # Prisma 7 will automatically find prisma.config.ts in the current directory
  npx prisma migrate deploy
fi

# Start the application
echo "Starting application..."
exec node dist/index.js
