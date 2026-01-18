#!/bin/bash
set -e

# Start Fuseki in the background using the original entrypoint
/docker-entrypoint.sh &
FUSEKI_PID=$!

# Wait for Fuseki to be ready
echo "Waiting for Fuseki to start..."
for i in {1..60}; do
  if curl -sf http://localhost:3030/$/ping > /dev/null 2>&1; then
    echo "Fuseki is up!"
    break
  fi
  sleep 1
done

# Give it a moment to be fully ready
sleep 3

# Check if datasets exist, if not create them
echo "Creating datasets..."
curl -s -X POST "http://localhost:3030/$/datasets" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "dbName=provider-ds&dbType=TDB2" 2>/dev/null && echo "Created provider-ds" || echo "provider-ds may already exist"

curl -s -X POST "http://localhost:3030/$/datasets" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "dbName=consumer-ds&dbType=TDB2" 2>/dev/null && echo "Created consumer-ds" || echo "consumer-ds may already exist"

# Load sample data if it exists
if [ -f /staging/sample-data.ttl ]; then
  echo "Loading sample data into provider-ds..."
  curl -s -X POST "http://localhost:3030/provider-ds/upload" \
    -F "files=@/staging/sample-data.ttl" 2>/dev/null && echo "✓ Data loaded into provider-ds!" || echo "Could not load into provider-ds"
  
  echo "Loading sample data into consumer-ds..."
  curl -s -X POST "http://localhost:3030/consumer-ds/upload" \
    -F "files=@/staging/sample-data.ttl" 2>/dev/null && echo "✓ Data loaded into consumer-ds!" || echo "Could not load into consumer-ds"
  
  echo "✓ Sample data loaded successfully!"
else
  echo "Warning: No sample data file found at /staging/sample-data.ttl"
fi

echo "======================================"
echo "Fuseki is ready with datasets and data!"
echo "======================================"

# Wait for Fuseki process to finish (keep container running)
wait $FUSEKI_PID
