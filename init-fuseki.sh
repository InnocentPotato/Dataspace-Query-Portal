#!/bin/sh
# This script runs after Fuseki starts to load initial data

echo "Waiting for Fuseki to be fully ready..."
sleep 10

# Determine which dataset to load into based on whether this is provider or consumer
FUSEKI_HOST=${FUSEKI_HOST:-localhost:3030}
FUSEKI_USER="admin"
FUSEKI_PASS="pw"

# Load sample data if it exists
if [ -f /staging/sample-data.ttl ]; then
  # Try to load into provider-ds if it exists
  echo "Loading sample data into provider-ds..."
  if curl -sf -u "${FUSEKI_USER}:${FUSEKI_PASS}" "http://${FUSEKI_HOST}/$/datasets" | grep -q "provider-ds"; then
    result=$(curl -s -u "${FUSEKI_USER}:${FUSEKI_PASS}" -X POST "http://${FUSEKI_HOST}/provider-ds/data" \
      -H "Content-Type: text/turtle" \
      --data-binary "@/staging/sample-data.ttl")
    if echo "$result" | grep -q "count"; then
      echo "✓ Data loaded into provider-ds!"
    else
      echo "Could not load into provider-ds"
    fi
  fi
  
  # Try to load into consumer-ds
  echo "Loading sample data into consumer-ds..."
  if curl -sf -u "${FUSEKI_USER}:${FUSEKI_PASS}" "http://${FUSEKI_HOST}/$/datasets" | grep -q "consumer-ds"; then
    result=$(curl -s -u "${FUSEKI_USER}:${FUSEKI_PASS}" -X POST "http://${FUSEKI_HOST}/consumer-ds/data" \
      -H "Content-Type: text/turtle" \
      --data-binary "@/staging/sample-data.ttl")
    if echo "$result" | grep -q "count"; then
      echo "✓ Data loaded into consumer-ds!"
    else
      echo "Could not load into consumer-ds"
    fi
  fi
  
  echo "======================================"
  echo "✓ Sample data loading complete!"
  echo "✓ Username: admin, Password: pw"
  echo "======================================"
else
  echo "Warning: No sample data file found at /staging/sample-data.ttl"
fi
