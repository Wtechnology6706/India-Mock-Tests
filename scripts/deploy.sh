#!/usr/bin/env bash
set -e

# Load environment & PATH for Node, NPM, and PM2
[ -f "$HOME/.profile" ] && . "$HOME/.profile" || true
[ -f "$HOME/.bashrc" ] && . "$HOME/.bashrc" || true
if [ -d "$HOME/.nvm" ]; then
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" || true
fi

# Detect installed NVM node versions
if [ -d "$HOME/.nvm/versions/node" ]; then
  LATEST_NODE=$(ls -v "$HOME/.nvm/versions/node" 2>/dev/null | tail -n 1)
  if [ -n "$LATEST_NODE" ]; then
    export PATH="$HOME/.nvm/versions/node/$LATEST_NODE/bin:$PATH"
  fi
fi

# Fallback system paths
export PATH="$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$HOME/.local/bin"

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
