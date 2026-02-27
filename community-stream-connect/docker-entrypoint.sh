#!/bin/bash
set -e

# Default backend URL if not provided
BACKEND_URL=${BACKEND_URL:-http://localhost:3000}

echo "Generating nginx configuration with BACKEND_URL=$BACKEND_URL"

# Generate nginx config from template
envsubst < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

echo "Nginx configuration generated successfully"

# Execute the main command
exec "$@"
