#!/bin/bash

# ==========================================
# 🌐 ClaimEasy Domain & SSL Setup Script (Alma Linux 9)
# ==========================================

# Exit on error
set -e

if [ "$EUID" -ne 0 ]; then 
  echo "❌ Please run as root (sudo ./setup_domain.sh)"
  exit 1
fi

echo "--------------------------------------------------"
echo "🌐 Setting up Domain Name & SSL (HTTPS)"
echo "--------------------------------------------------"
echo "⚠️  PREREQUISITE: You must have bought a domain (e.g., claimeasy.com)"
echo "⚠️  PREREQUISITE: You must have added an 'A Record' in your DNS pointing to 103.159.239.34"
echo "--------------------------------------------------"
read -p "👉 Enter your domain name (e.g., claimeasy.com): " DOMAIN_NAME

if [ -z "$DOMAIN_NAME" ]; then
    echo "❌ Domain name cannot be empty."
    exit 1
fi

echo "--------------------------------------------------"
echo "🔧 Configuring Nginx for $DOMAIN_NAME..."
echo "--------------------------------------------------"

# Create Nginx Config in conf.d (Alma Linux standard)
cat > /etc/nginx/conf.d/claimeasy.conf <<EOF
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

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

# Test Nginx
nginx -t

# Reload Nginx
systemctl reload nginx

echo "✅ Nginx updated to listen on $DOMAIN_NAME"

echo "--------------------------------------------------"
echo "🔒 Setting up SSL (HTTPS) with Let's Encrypt..."
echo "--------------------------------------------------"

# Install Certbot if not present
if ! command -v certbot &> /dev/null; then
    dnf install -y certbot python3-certbot-nginx
fi

# Obtain SSL Certificate
certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME --non-interactive --agree-tos -m admin@$DOMAIN_NAME --redirect

echo "✅ SSL Certificate installed!"

echo "--------------------------------------------------"
echo "⚙️  Updating Backend Configuration..."
echo "--------------------------------------------------"

# Update .env FRONTEND_URL
sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=\"https://$DOMAIN_NAME\"|g" /var/www/claimeasy/backend/.env

# Restart Backend
pm2 restart claimeasy-backend

echo "--------------------------------------------------"
echo "🎉 SUCCESS! Your site is now live at:"
echo "👉 https://$DOMAIN_NAME"
echo "--------------------------------------------------"
