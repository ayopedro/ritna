#!/bin/sh
# -e: exit on error, -u: treat unset variables as error
set -eu

echo "🚀 Starting migration process..."

# Check if migrations should be skipped
if [ "${SKIP_MIGRATIONS:-false}" != "true" ]; then
  bun migrate.js || {
    echo "❌ CRITICAL: Migration failed. Shutting down to prevent app start."
    exit 1
  }
  echo "✅ Migration successful."
else
  echo "⚠️ Skipping migrations (SKIP_MIGRATIONS=true)"
fi

echo "🚀 Starting Next.js server..."

exec bun server.js