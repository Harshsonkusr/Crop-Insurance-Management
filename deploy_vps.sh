#!/bin/bash

# ==========================================
# 🚀 ClaimEasy VPS Deployment Script (Alma Linux 9 Compatible)
# ==========================================

# Exit immediately if a command exits with a non-zero status
set -e

APP_DIR="/var/www/claimeasy"
REPO_URL="https://github.com/Harshsonkusr/Crop-Insurance-Management.git"

echo "--------------------------------------------------"
echo "🚀 Starting Deployment on Alma Linux 9 VPS..."
echo "--------------------------------------------------"

# 1. Update System & Install Dependencies
echo "📦 [1/7] Installing System Dependencies..."
# Enable EPEL for extra packages
sudo dnf install -y epel-release

# Install Node.js 20
sudo dnf module enable -y nodejs:20
sudo dnf install -y nodejs git nginx

# Install Global PM2
sudo npm install -g pm2

# 2. Setup PostgreSQL Database
echo "🐘 [2/7] Setting up PostgreSQL Database..."
# Install Postgres 16 Repo
sudo dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm
sudo dnf -qy module disable postgresql
sudo dnf install -y postgresql16-server

# Init DB if not exists
if [ ! -f /var/lib/pgsql/16/data/PG_VERSION ]; then
    echo "Initializing Database..."
    sudo /usr/pgsql-16/bin/postgresql-16-setup initdb
fi

# Enable & Start
sudo systemctl enable postgresql-16
sudo systemctl start postgresql-16

# Configure DB User & Database (Idempotent)
sudo -u postgres psql -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'claimeasy') THEN CREATE USER claimeasy WITH PASSWORD 'PMsnippet@1309'; END IF; END \$\$;"
sudo -u postgres psql -c "SELECT 'CREATE DATABASE claimeasy OWNER claimeasy' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'claimeasy')\gexec"

# Allow Password Auth (Change ident/peer to md5/scram-sha-256)
sudo sed -i 's/ident/scram-sha-256/g' /var/lib/pgsql/16/data/pg_hba.conf
sudo sed -i 's/peer/scram-sha-256/g' /var/lib/pgsql/16/data/pg_hba.conf
sudo systemctl restart postgresql-16

# 3. Setup Project Directory
echo "📂 [3/7] Setting up Project Directory at $APP_DIR..."
if [ ! -d "$APP_DIR" ]; then
    sudo mkdir -p $APP_DIR
    # Set permissions for current user (root usually on VPS, but let's be safe)
    sudo git clone $REPO_URL $APP_DIR
else
    cd $APP_DIR
    git pull origin main
fi

# 4. Backend Setup
echo "🔧 [4/7] Building Backend..."
cd $APP_DIR/backend

# Check for .env file
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    # Note: Password encoded %40 for @ symbol
    cat <<EOT >> .env
DATABASE_URL="postgresql://claimeasy:PMsnippet%401309@localhost:5432/claimeasy"
JWT_SECRET="temp_secret_key_change_this_immediately_$(date +%s)"
ENCRYPTION_KEY="temp_encryption_key_change_this"
AADHAAR_HMAC_KEY="temp_aadhaar_key_change_this"
UPLOAD_DIR="./uploads"
PORT=5000
NODE_ENV=production
FRONTEND_URL="http://103.159.239.34"
# Twilio keys will be added manually
EOT
fi

npm install
npx prisma generate
npx prisma migrate deploy # Ensure DB schema is created
npm run build

# Start Backend with PM2
echo "🚀 Starting Backend Service..."
pm2 restart claimeasy-backend || pm2 start dist/index.js --name "claimeasy-backend"
pm2 save

# 5. Frontend Setup
echo "🎨 [5/7] Building Frontend..."
cd $APP_DIR
npm install
npm run build

# 6. Nginx Setup
echo "🌐 [6/7] Configuring Nginx..."

# Nginx config for Alma Linux (conf.d)
cat <<EOF > /etc/nginx/conf.d/claimeasy.conf
server {
    listen 80;
    server_name 103.159.239.34;

    root /var/www/html;
    index index.html;

    # Frontend
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Uploads
    location /uploads {
        alias /var/www/claimeasy/backend/uploads;
    }
}
EOF

# Move build files
sudo rm -rf /var/www/html/*
sudo mkdir -p /var/www/html
sudo cp -r dist/* /var/www/html/

# Fix SELinux Contexts (Crucial for Alma/RHEL)
echo "🛡️ Configuring SELinux..."
# Allow Nginx to connect to network (upstream nodejs)
sudo setsebool -P httpd_can_network_connect 1
# Set context for web files
sudo chcon -R -t httpd_sys_content_t /var/www/html
sudo chcon -R -t httpd_sys_content_t /var/www/claimeasy/backend/uploads

# Enable & Restart Nginx
sudo systemctl enable nginx
sudo systemctl restart nginx

# 7. Firewall Setup
echo "🔥 [7/7] Configuring Firewall..."
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

echo "--------------------------------------------------"
echo "✅ DEPLOYMENT COMPLETE!"
echo "--------------------------------------------------"
echo "🌍 Website: http://103.159.239.34"
echo "🔌 API:     http://103.159.239.34/api"
echo "--------------------------------------------------"
