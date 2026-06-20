#!/bin/bash
set -e

OUTPUT=$(npx vercel --prod 2>&1)
echo "$OUTPUT"

DEPLOY_URL=$(echo "$OUTPUT" | grep -o 'https://ads-[a-z0-9]*-valletivarish52-6548s-projects\.vercel\.app' | head -1)

if [ -n "$DEPLOY_URL" ]; then
  npx vercel alias "$DEPLOY_URL" clipvault-tools.vercel.app
  echo "Aliased clipvault-tools.vercel.app -> $DEPLOY_URL"
fi
