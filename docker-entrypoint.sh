#!/bin/sh

# Script to inject runtime environment variables into the built JS files

set -e

echo "🔧 Injecting runtime environment variables..."

# Find all JS files in dist
JS_FILES=$(find /usr/share/nginx/html -type f -name "*.js")

# Clave de Claude (Anthropic). Acepta ANTHROPIC_API_KEY o API_KEY como respaldo.
RUNTIME_ANTHROPIC_KEY="${ANTHROPIC_API_KEY:-${API_KEY:-}}"

if [ -z "$RUNTIME_ANTHROPIC_KEY" ]; then
  echo "⚠️  No ANTHROPIC_API_KEY found in environment"
  echo "   API key will need to be configured via localStorage"
else
  echo "✅ Found Anthropic API key, injecting into application..."

  # Replace placeholder with actual API key in all JS files
  for file in $JS_FILES; do
    sed -i "s|__RUNTIME_ANTHROPIC_API_KEY__|${RUNTIME_ANTHROPIC_KEY}|g" "$file"
  done

  echo "✅ Environment variables injected successfully"
fi

echo "🚀 Starting nginx..."

# Start nginx
exec nginx -g 'daemon off;'
