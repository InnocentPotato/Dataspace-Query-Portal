#!/bin/bash
# Troubleshooting script for empty query results
# This script stops all containers, removes volumes, and restarts with fresh data

echo ""
echo "========================================"
echo "Dataspace Query Portal - Data Fix Script"
echo "========================================"
echo ""

echo "[1/5] Stopping all containers..."
docker-compose down -v

echo ""
echo "[2/5] Checking for leftover volumes..."
volumes=$(docker volume ls --format "{{.Name}}" | grep fuseki || true)
if [ -n "$volumes" ]; then
    echo "Warning: Found fuseki volumes that weren't removed:"
    echo "$volumes" | while read vol; do echo "  - $vol"; done
    echo "Attempting to remove them manually..."
    echo "$volumes" | xargs -r docker volume rm 2>/dev/null || true
else
    echo "✓ All fuseki volumes removed"
fi

echo ""
echo "[3/5] Starting services with fresh volumes..."
docker-compose up -d

echo ""
echo "[4/5] Waiting for initialization containers to complete (30 seconds)..."
sleep 30

echo ""
echo "[5/5] Checking initialization logs..."
echo ""
echo "--- Provider Init Logs ---"
docker-compose logs fuseki-provider-init

echo ""
echo "--- Consumer Init Logs ---"
docker-compose logs fuseki-consumer-init

echo ""
echo "========================================"
echo "Verifying Data Load"
echo "========================================"
echo ""

echo "Querying provider dataset..."
response=$(curl -s "http://localhost:3030/provider-ds/query?query=SELECT%20(COUNT(*)%20as%20?count)%20WHERE%20{?s%20?p%20?o}" 2>/dev/null || echo "ERROR")

if echo "$response" | grep -q '"value"'; then
    count=$(echo "$response" | grep -o '"value":"[0-9]*"' | head -1 | grep -o '[0-9]*')
    if [ "$count" -gt 0 ] 2>/dev/null; then
        echo "✓ SUCCESS: Found $count triples in provider dataset!"
        echo ""
        echo "You can now access the portal at: http://localhost:3000"
    else
        echo "✗ ISSUE: Provider dataset is empty (0 triples)"
        echo "Please check the init logs above for errors"
    fi
else
    echo "✗ ERROR: Could not query Fuseki. It may still be starting up."
    echo "Wait a minute and try: http://localhost:3000"
fi

echo ""
echo "========================================"
echo ""
