#!/bin/sh
set -e

# Run migrations if DATABASE_URL is present
if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  npx prisma migrate deploy --schema=./prisma/schema.prisma
fi

# Start the application
echo "Starting application..."
exec node dist/index.js
