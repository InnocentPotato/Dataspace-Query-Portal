#!/bin/bash

# Start Fuseki in the background
/docker-entrypoint.sh &
FUSEKI_PID=$!

# Wait for Fuseki to be ready
echo "Waiting for Fuseki to start..."
sleep 10

# Check if datasets exist, if not create them
echo "Ensuring datasets exist..."
curl -s -X POST "http://localhost:3030/$/datasets" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "dbName=provider-ds&dbType=TDB2" || true

curl -s -X POST "http://localhost:3030/$/datasets" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "dbName=consumer-ds&dbType=TDB2" || true

# Wait for Fuseki to finish
wait $FUSEKI_PID
