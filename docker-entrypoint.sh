#!/bin/sh

# Script to inject runtime environment variables into the built JS files

set -e

echo "🔧 Injecting runtime environment variables..."

# Find all JS files in dist
JS_FILES=$(find /usr/share/nginx/html -type f -name "*.js")

# Support both API_KEY and GEMINI_API_KEY (fallback)
RUNTIME_API_KEY="${API_KEY:-${GEMINI_API_KEY:-}}"

if [ -z "$RUNTIME_API_KEY" ]; then
  echo "⚠️  No API_KEY or GEMINI_API_KEY found in environment"
  echo "   API key will need to be configured via localStorage"
else
  echo "✅ Found API key, injecting into application..."

  # Replace placeholder with actual API key in all JS files
  for file in $JS_FILES; do
    sed -i "s|__RUNTIME_API_KEY__|${RUNTIME_API_KEY}|g" "$file"
  done

  echo "✅ Environment variables injected successfully"
fi

echo "🚀 Starting nginx..."

# Start nginx
exec nginx -g 'daemon off;'
