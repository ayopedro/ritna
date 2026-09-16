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

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "🌱 Starting database seed process..."
  bun seed.js || {
    echo "❌ CRITICAL: Database seed failed. Shutting down to prevent app start."
    exit 1
  }
  echo "✅ Database seed successful."
else
  echo "ℹ️ Skipping database seed (RUN_SEED is not true)"
fi

echo "🚀 Starting Next.js server..."

exec bun server.js
