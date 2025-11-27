#!/bin/bash
# Test script to simulate Vercel build process

echo "=== Simulating Vercel Build Process ==="
echo ""

# Clean install (like Vercel does)
echo "Step 1: Cleaning and installing dependencies..."
rm -rf node_modules package-lock.json
npm install

echo ""
echo "Step 2: Running build command..."
npm run build

echo ""
echo "Step 3: Checking build output..."
if [ -d "dist" ]; then
    echo "✓ dist directory exists"
    ls -la dist/
    echo ""
    echo "Build files:"
    find dist -type f | head -10
else
    echo "✗ dist directory not found - BUILD FAILED"
    exit 1
fi

echo ""
echo "=== Build Test Complete ==="

