#!/usr/bin/env bash
set -e

echo "🚀 Starting deployment of India Mock Tests Platform..."

# Navigate to project directory
APP_DIR="/var/www/mocktest/India-Mock-Tests"
cd "$APP_DIR" || exit 1

# Mark directory as safe for git
git config --global --add safe.directory "$APP_DIR" || true

# Check if .git folder exists; if not, initialize and connect to origin
if [ ! -d ".git" ]; then
  echo "⚠️ .git folder not found. Initializing git repository..."
  git init
  git remote add origin https://github.com/Wtechnology6706/India-Mock-Tests.git || git remote set-url origin https://github.com/Wtechnology6706/India-Mock-Tests.git
fi

# Ensure origin URL is up-to-date
git remote set-url origin https://github.com/Wtechnology6706/India-Mock-Tests.git || true

# Pull latest commits from GitHub main branch
echo "📥 Fetching and syncing latest changes from GitHub main..."
git fetch origin main
git reset --hard origin/main

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
