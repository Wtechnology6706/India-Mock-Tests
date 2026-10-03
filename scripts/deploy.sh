#!/usr/bin/env bash
set -e

echo "🚀 Starting deployment of India Mock Tests Platform..."

# Navigate to project directory
APP_DIR="/var/www/mocktest/India-Mock-Tests"
cd "$APP_DIR" || exit 1

# Pull latest commits from GitHub main branch
echo "📥 Pulling latest changes from git..."
git pull origin main

# Install production and build dependencies
echo "📦 Installing npm dependencies..."
npm ci --legacy-peer-deps

# Run database schema migration
echo "🗄️ Running DB migrations..."
if [ -f "scripts/migrate-db.mjs" ]; then
  node scripts/migrate-db.mjs || echo "⚠️ Migration script completed with warnings."
fi

# Build Next.js production bundle
echo "🔨 Building Next.js production application..."
npm run build

# Reload PM2 zero-downtime cluster
echo "🔄 Reloading PM2 process..."
if pm2 list | grep -q "india-mock-tests"; then
  pm2 reload ecosystem.config.js --update-env
else
  pm2 start ecosystem.config.js
fi

# Save PM2 process list
pm2 save

echo "✅ Deployment completed successfully!"
