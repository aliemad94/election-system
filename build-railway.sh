#!/bin/sh
set -e

echo "🔧 Switching to PostgreSQL schema..."
cp prisma/schema.postgres.prisma prisma/schema.prisma

echo "📦 Generating Prisma client..."
npx prisma generate

echo "🏗️ Building Next.js..."
npm run build

echo "✅ Build complete!"
