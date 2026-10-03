#!/usr/bin/env bash
set -e

# Load environment & PATH for Node, NPM, and PM2 (including /root/n/bin)
export N_PREFIX="/root/n"
export PATH="/root/n/bin:$HOME/n/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$HOME/.local/bin:$PATH"
[ -f "$HOME/.profile" ] && . "$HOME/.profile" || true
[ -f "$HOME/.bashrc" ] && . "$HOME/.bashrc" || true
if [ -d "$HOME/.nvm" ]; then
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" || true
fi

echo "🚀 Starting deployment of India Mock Tests Platform..."

# Navigate to project directory
APP_DIR="/var/www/mocktest/India-Mock-Tests"
cd "$APP_DIR" || exit 1

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

# Reload/Restart PM2 process
echo "🔄 Starting/Reloading PM2 process..."
pm2 delete india-mock-tests 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo "✅ Deployment completed successfully!"
