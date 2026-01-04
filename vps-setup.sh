#!/bin/bash

# Update System
echo "Updating system..."
dnf update -y

# Install Git
echo "Installing Git..."
dnf install git -y

# Install Docker
echo "Installing Docker..."
dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
dnf install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y

# Start and Enable Docker
systemctl start docker
systemctl enable docker

echo "✅ VPS Setup Complete! You can now deploy using docker-compose."
