#!/bin/bash

echo "🚀 Setting up your Next.js project"

set -e

echo "📦 Installing dependencies"
npm install

echo "🔧 Generating Prisma client"
npx prisma generate

echo "📂 Copying environment variables"
cp ../.env.example ../.env

echo "✅ Setup complete! You can now run 'npm run dev' to start the server."
