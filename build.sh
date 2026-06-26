#!/usr/bin/env bash
# Build script for OtpVault
set -e

echo "=== OtpVault Build Script ==="
echo ""

# Check prerequisites
echo "[1/5] Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "Error: Node.js is required"; exit 1; }
command -v cargo >/dev/null 2>&1 || { echo "Error: Rust/Cargo is required"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "Error: npm is required"; exit 1; }
echo "  ✓ Node.js $(node --version)"
echo "  ✓ npm $(npm --version)"
echo "  ✓ Rust $(rustc --version | cut -d' ' -f2)"

# Install frontend dependencies
echo ""
echo "[2/5] Installing frontend dependencies..."
npm install

# Check TypeScript
echo ""
echo "[3/5] Checking TypeScript..."
npx tsc --noEmit
echo "  ✓ TypeScript: no errors"

# Build frontend
echo ""
echo "[4/5] Building frontend..."
npx vite build
echo "  ✓ Frontend built"

# Build Tauri app
echo ""
echo "[5/5] Building Tauri application..."
TARGET=${1:-""}
if [ -n "$TARGET" ]; then
  npx tauri build --target "$TARGET"
else
  npx tauri build
fi

echo ""
echo "=== Build complete ==="
