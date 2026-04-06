#!/bin/bash

# Setup script for Web Development Agency Site

# Set Node path
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"

echo "🚀 Setting up Web Development Agency Site..."
echo ""

# Check if Node is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating from .env.example..."
    cp .env.example .env.local
    echo "✅ Created .env.local - please update with your values"
fi

echo ""
echo "📝 Next steps:"
echo "1. Edit .env.local with your database, Stripe, and email settings"
echo "2. Run: npx prisma migrate dev --name init"
echo "3. Run: npx ts-node scripts/create-admin.ts"
echo "4. Run: npm run dev"
echo ""
echo "✨ Setup complete!"
