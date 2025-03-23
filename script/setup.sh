#!/bin/bash

echo "Setting up your Next.js project"

# exit on error
set -e

echo "Installing dependencies"
npm install

echo "hello there"

echo "🔧 Generating Prisma client"
npx prisma generate

echo "instaling dependencies"
npm install

echo "✅ Setup complete! You can now run 'npm run dev' to start the server."
