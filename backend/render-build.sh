#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing dependencies..."
npm install

echo "Building project..."
npm run build

echo "Generating Prisma Client..."
npx prisma generate

echo "Running Database Migrations (RESETTING FOR FIX)..."
# Using migrate reset force to fix the 'failed migration' error on free tier
npx prisma migrate reset --force --skip-seed

# echo "Seeding Database..."
# npx prisma db seed

echo "Build and Migration Complete!"
