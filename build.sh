#!/usr/bin/env bash
# Builds all candidate demos and assembles the deployable site into ./dist
set -euo pipefail
export IBM_TELEMETRY_DISABLED=true   # @carbon/react runs a postinstall that reports to IBM
rm -rf dist && mkdir -p dist
cp -r site/* dist/
touch dist/.nojekyll
for d in apps/*/; do
  n=$(basename "$d")
  echo "── building $n"
  ( cd "$d" && npm install --no-audit --no-fund --silent && npx vite build )
  cp -r "$d/dist" "dist/$n"
done
echo "✔ dist/ ready — open dist/index.html through a web server (not file://)"
