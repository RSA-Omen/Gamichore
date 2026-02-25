#!/usr/bin/env bash
# Install deps using WSL Node so esbuild etc. don't hit UNC paths.
# Run from WSL: bash install-wsl.sh  (bash avoids CRLF issues)
cd "$(dirname "$0")"
export PATH="/usr/bin:$PATH"
/usr/bin/npm install
