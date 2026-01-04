#!/bin/bash

# Update System
echo "Updating system..."
dnf update -y

# Install PostgreSQL 15
echo "Installing PostgreSQL 15..."
dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm
dnf -qy module disable postgresql
dnf install -y postgresql15-server

# Initialize and Start
/usr/pgsql-15/bin/postgresql-15-setup initdb
systemctl enable postgresql-15
systemctl start postgresql-15

# Configure PostgreSQL to allow remote connections
echo "Configuring remote access..."
PG_CONF="/var/lib/pgsql/15/data/postgresql.conf"
PG_HBA="/var/lib/pgsql/15/data/pg_hba.conf"

# Listen on all interfaces
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" $PG_CONF

# Allow connections from anywhere (secured by password)
echo "host    all             all             0.0.0.0/0               md5" >> $PG_HBA

# Create User and Database
sudo -u postgres psql -c "CREATE USER claimeasy WITH PASSWORD 'password123';"
sudo -u postgres psql -c "CREATE DATABASE claimeasy OWNER claimeasy;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE claimeasy TO claimeasy;"

# Open Firewall Port 5432
echo "Opening firewall port 5432..."
firewall-cmd --permanent --add-port=5432/tcp
firewall-cmd --reload

# Restart to apply changes
systemctl restart postgresql-15

echo "✅ Database Setup Complete!"
echo "--------------------------------------------------"
echo "Your DATABASE_URL for Render is:"
echo "postgresql://claimeasy:password123@103.159.239.34:5432/claimeasy"
echo "--------------------------------------------------"
