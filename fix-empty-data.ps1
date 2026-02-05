# Troubleshooting script for empty query results
# This script stops all containers, removes volumes, and restarts with fresh data

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Dataspace Query Portal - Data Fix Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/5] Stopping all containers..." -ForegroundColor Yellow
docker-compose down -v

Write-Host ""
Write-Host "[2/5] Checking for leftover volumes..." -ForegroundColor Yellow
$volumes = docker volume ls --format "{{.Name}}" | Select-String "fuseki"
if ($volumes) {
    Write-Host "Warning: Found fuseki volumes that were not removed:" -ForegroundColor Red
    $volumes | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host "Attempting to remove them manually..." -ForegroundColor Yellow
    $volumes | ForEach-Object { docker volume rm $_ 2>$null }
} else {
    Write-Host "Success: All fuseki volumes removed" -ForegroundColor Green
}

Write-Host ""
Write-Host "[3/5] Starting services with fresh volumes..." -ForegroundColor Yellow
docker-compose up -d

Write-Host ""
Write-Host "[4/5] Waiting for initialization containers to complete - 30 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "[5/5] Checking initialization logs..." -ForegroundColor Yellow
Write-Host ""
Write-Host "--- Provider Init Logs ---" -ForegroundColor Cyan
docker-compose logs fuseki-provider-init

Write-Host ""
Write-Host "--- Consumer Init Logs ---" -ForegroundColor Cyan
docker-compose logs fuseki-consumer-init

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verifying Data Load" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    Write-Host "Querying provider dataset..." -ForegroundColor Yellow
    $urlBase = "http://localhost:3030/provider-ds/query"
    $queryParam = "SELECT%20(COUNT(*)%20as%20%3Fcount)%20WHERE%20%7B%3Fs%20%3Fp%20%3Fo%7D"
    $fullUrl = "$urlBase" + "?query=" + "$queryParam"
    $response = Invoke-RestMethod -Uri $fullUrl -ErrorAction Stop
    $count = $response.results.bindings[0].count.value
    
    if ($count -gt 0) {
        Write-Host "SUCCESS: Found $count triples in provider dataset!" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now access the portal at: http://localhost:3000" -ForegroundColor Green
    } else {
        Write-Host "ISSUE: Provider dataset is empty (0 triples)" -ForegroundColor Red
        Write-Host "Please check the init logs above for errors" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: Could not query Fuseki. It may still be starting up." -ForegroundColor Red
    Write-Host "Wait a minute and try: http://localhost:3000" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
