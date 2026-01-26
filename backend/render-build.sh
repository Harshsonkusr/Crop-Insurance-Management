#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing dependencies..."
npm install

echo "Building project..."
npm run build

echo "Generating Prisma Client..."
npx prisma generate

echo "Running Database Migrations..."
npx prisma migrate deploy

echo "Seeding Database..."
npx prisma db seed

echo "Build and Migration Complete!"
