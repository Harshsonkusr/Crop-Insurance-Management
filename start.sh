#!/bin/sh
set -e

# Run migrations if DATABASE_URL is present
if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  npx prisma migrate deploy
  
  echo "Seeding database..."
  node dist/seed.js
fi

# Start the application
echo "Starting application..."
exec node dist/index.js
