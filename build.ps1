# Production Build Script for ClaimEasy (PowerShell)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting ClaimEasy production build..." -ForegroundColor Blue

# Build Frontend
Write-Host "📦 Building frontend..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) { throw "Frontend npm install failed" }
npm run build
if ($LASTEXITCODE -ne 0) { throw "Frontend build failed" }
Write-Host "✅ Frontend build complete" -ForegroundColor Green

# Build Backend
Write-Host "📦 Building backend..." -ForegroundColor Cyan
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) { throw "Backend npm install failed" }
npm run build
if ($LASTEXITCODE -ne 0) { throw "Backend build failed" }
Write-Host "✅ Backend build complete" -ForegroundColor Green

# Generate Prisma Client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) { throw "Prisma generate failed" }
Write-Host "✅ Prisma client generated" -ForegroundColor Green

Set-Location ..

Write-Host "🎉 Build complete! Ready for deployment." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Set up environment variables (.env files)"
Write-Host "2. Run database migrations: cd backend; npx prisma migrate deploy"
Write-Host "3. Start the server: cd backend; npm start"

