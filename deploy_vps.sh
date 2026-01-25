#!/bin/bash

# ==========================================
# 🚀 ClaimEasy VPS Deployment Script
# ==========================================

# Exit immediately if a command exits with a non-zero status
set -e

APP_DIR="/var/www/claimeasy"
REPO_URL="https://github.com/Harshsonkusr/Crop-Insurance-Management.git"

echo "--------------------------------------------------"
echo "🚀 Starting Deployment on VPS..."
echo "--------------------------------------------------"

# 1. Update System & Install Dependencies
echo "📦 [1/6] Installing System Dependencies (Node.js, Nginx, Git)..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git
sudo npm install -g pm2

# 2. Setup Project Directory
echo "📂 [2/6] Setting up Project Directory at $APP_DIR..."
if [ ! -d "$APP_DIR" ]; then
    sudo mkdir -p $APP_DIR
    sudo chown -R $USER:$USER /var/www
    git clone $REPO_URL $APP_DIR
else
    cd $APP_DIR
    git pull origin main
fi

# 3. Backend Setup
echo "🔧 [3/6] Building Backend..."
cd $APP_DIR/backend

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  WARNING: .env file not found in backend!"
    echo "creating .env file from example..."
    
    # Create a default .env with the credentials provided in chat (Safety warning: Change these later!)
    cat <<EOT >> .env
DATABASE_URL="postgresql://claimeasy:PMsnippet@1309@localhost:5432/claimeasy"
JWT_SECRET="temp_secret_key_change_this_immediately"
ENCRYPTION_KEY="temp_encryption_key_change_this"
AADHAAR_HMAC_KEY="temp_aadhaar_key_change_this"
UPLOAD_DIR="./uploads"
PORT=5000
NODE_ENV=production
FRONTEND_URL="http://103.159.239.34"
# Twilio keys will be added manually to prevent git leakage
EOT
    echo "✅ Created .env file. PLEASE UPDATE SECRETS LATER!"
fi

npm install
npx prisma generate
npm run build

# Start Backend with PM2
echo "🚀 Starting Backend Service..."
pm2 restart claimeasy-backend || pm2 start dist/index.js --name "claimeasy-backend"
pm2 save

# 4. Frontend Setup
echo "🎨 [4/6] Building Frontend..."
cd $APP_DIR
npm install
npm run build

# 5. Nginx Setup
echo "🌐 [5/6] Configuring Nginx..."
# Clear old html
sudo rm -rf /var/www/html/*
# Copy new build
sudo cp -r dist/* /var/www/html/

# Configure Nginx Site
if [ -f "nginx.conf.example" ]; then
    sudo cp nginx.conf.example /etc/nginx/sites-available/claimeasy
    # Link it
    sudo ln -sf /etc/nginx/sites-available/claimeasy /etc/nginx/sites-enabled/
    # Remove default
    sudo rm -f /etc/nginx/sites-enabled/default
    # Restart Nginx
    sudo systemctl restart nginx
fi

echo "--------------------------------------------------"
echo "✅ DEPLOYMENT COMPLETE!"
echo "--------------------------------------------------"
echo "🌍 Website: http://103.159.239.34"
echo "🔌 API:     http://103.159.239.34/api"
echo "--------------------------------------------------"
