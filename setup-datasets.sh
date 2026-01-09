#!/bin/bash

# Script to setup Fuseki datasets with sample data

PROVIDER_URL="http://localhost:3030"
CONSUMER_URL="http://localhost:3031"
ADMIN_USER="admin"
ADMIN_PASS="WPGI8yKqq4HVOw5"

echo "Creating datasets on Provider Fuseki..."

# Create provider-ds dataset
curl -X POST "$PROVIDER_URL/$/datasets" \
  -u "$ADMIN_USER:$ADMIN_PASS" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "dbName=provider-ds&dbType=TDB2"

# Create consumer-ds dataset on provider
curl -X POST "$PROVIDER_URL/$/datasets" \
  -u "$ADMIN_USER:$ADMIN_PASS" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "dbName=consumer-ds&dbType=TDB2"

echo ""
echo "Creating datasets on Consumer Fuseki..."

# Create consumer-ds dataset on consumer
curl -X POST "$CONSUMER_URL/$/datasets" \
  -u "$ADMIN_USER:$ADMIN_PASS" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "dbName=consumer-ds&dbType=TDB2"

echo ""
echo "Uploading sample data to Provider..."

# Upload data to provider-ds
curl -X POST "$PROVIDER_URL/provider-ds/upload" \
  -u "$ADMIN_USER:$ADMIN_PASS" \
  -F "files=@./data/sample-data.ttl"

echo ""
echo "Uploading sample data to Consumer..."

# Upload data to consumer-ds on provider
curl -X POST "$PROVIDER_URL/consumer-ds/upload" \
  -u "$ADMIN_USER:$ADMIN_PASS" \
  -F "files=@./data/sample-data.ttl"

# Upload data to consumer-ds on consumer
curl -X POST "$CONSUMER_URL/consumer-ds/upload" \
  -u "$ADMIN_USER:$ADMIN_PASS" \
  -F "files=@./data/sample-data.ttl"

echo ""
echo "Setup complete!"
echo ""
echo "Verifying datasets..."
curl -u "$ADMIN_USER:$ADMIN_PASS" "$PROVIDER_URL/$/datasets"
