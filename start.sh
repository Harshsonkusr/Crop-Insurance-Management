#!/bin/sh
set -e

# Run migrations if DATABASE_URL is present
if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations (RESETTING FOR FIX)..."
  npx prisma migrate reset --force
  
  echo "Seeding database..."
  node dist/seed.js
fi

# Start the application
echo "Starting application..."
exec node dist/index.js
