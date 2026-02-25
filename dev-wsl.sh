#!/usr/bin/env bash
# Use WSL/Linux Node so npm and vite don't hit UNC path errors.
# One-time: sudo apt-get update && sudo apt-get install -y nodejs npm
# Then: export PATH="/usr/bin:$PATH" && rm -rf node_modules package-lock.json && npm install
# Run: ./dev-wsl.sh  or  bash dev-wsl.sh
cd "$(dirname "$0")"
export PATH="/usr/bin:$PATH"
exec /usr/bin/npm run dev
