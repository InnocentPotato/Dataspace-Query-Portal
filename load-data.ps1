# PowerShell script to load RDF data into Fuseki datasets using curl.exe
# Usage: .\load-data.ps1
# NOTE: With the updated Docker setup, data is automatically loaded on container startup.
# This script is only needed if you want to reload or update data after containers are running.
# Requires: curl.exe (typically available on Windows 10/11)
# Note: Authentication is disabled in development mode (shiro.ini configured for 'anon' access)

param(
    [string]$ProviderFusekiUrl = "http://localhost:3030",
    [string]$ConsumerFusekiUrl = "http://localhost:3031",
    [string]$DataFile = ".\data\sample-data.ttl"
)

Write-Host "===== Fuseki Data Reload =====" -ForegroundColor Cyan
Write-Host ""
Write-Host "NOTE: Data should already be loaded automatically when containers started." -ForegroundColor Yellow
Write-Host "This script is only for manual reload if needed." -ForegroundColor Yellow
Write-Host ""

# Check if curl.exe exists
if (-not (Get-Command curl.exe -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: curl.exe not found. Please ensure curl is installed." -ForegroundColor Red
    exit 1
}

# Check if data file exists
if (-not (Test-Path $DataFile)) {
    Write-Host "ERROR: Data file not found: $DataFile" -ForegroundColor Red
    exit 1
}

# Function to load data using curl.exe and Graph Store Protocol (PUT method)
function Load-DataToFuseki {
    param(
        [string]$FusekiUrl,
        [string]$Dataset,
        [string]$DataFile
    )
    
    $Endpoint = "$FusekiUrl/$Dataset/data?default"
    $DataFileFull = (Resolve-Path $DataFile).Path
    
    Write-Host "Loading data to $Endpoint..." -ForegroundColor Cyan
    
    try {
        $Output = & curl.exe -X PUT "$Endpoint" `
            -H "Content-Type: text/turtle" `
            --data-binary "@$DataFileFull" `
            -s -w "`nHTTP_STATUS:%{http_code}"
        
        $Lines = $Output -split "`n"
        $StatusLine = $Lines[-1]
        
        if ($StatusLine -match "HTTP_STATUS:(\d{3})") {
            $StatusCode = $matches[1]
            if ($StatusCode -eq "200" -or $StatusCode -eq "204") {
                Write-Host "SUCCESS: Loaded data into $Dataset (HTTP $StatusCode)" -ForegroundColor Green
                return $true
            }
            else {
                Write-Host "ERROR: HTTP $StatusCode when loading to $Dataset" -ForegroundColor Red
                return $false
            }
        }
        else {
            Write-Host "SUCCESS: Loaded data into $Dataset" -ForegroundColor Green
            return $true
        }
    }
    catch {
        Write-Host "ERROR loading data to $Dataset : $_" -ForegroundColor Red
        return $false
    }
}

# Function to verify data load by running a count query
function Verify-DataLoad {
    param(
        [string]$FusekiUrl,
        [string]$Dataset
    )
    
    $Query = "SELECT (COUNT(?s) as ?count) WHERE { ?s ?p ?o }"
    $EncodedQuery = [uri]::EscapeDataString($Query)
    $Endpoint = "$FusekiUrl/$Dataset/query?query=$EncodedQuery"
    
    try {
        $Output = & curl.exe "$Endpoint" -s
        $Data = $Output | ConvertFrom-Json
        $Count = $Data.results.bindings[0].count.value
        Write-Host "$Dataset triple count: $Count" -ForegroundColor Green
        return [int]$Count
    }
    catch {
        Write-Host "ERROR verifying $Dataset : $_" -ForegroundColor Red
        return -1
    }
}

# Main execution
Write-Host "===== Fuseki Data Loader =====" -ForegroundColor Cyan
Write-Host "Provider Fuseki URL: $ProviderFusekiUrl"
Write-Host "Consumer Fuseki URL: $ConsumerFusekiUrl"
Write-Host "Data File: $DataFile"
Write-Host ""

# Load data to provider dataset
$ProviderSuccess = Load-DataToFuseki -FusekiUrl $ProviderFusekiUrl -Dataset "provider-ds" -DataFile $DataFile

# Load data to consumer dataset on consumer Fuseki (not on provider!)
# Note: consumer-ds on ConsumerFusekiUrl (port 3031)
$ConsumerSuccess = Load-DataToFuseki -FusekiUrl $ConsumerFusekiUrl -Dataset "consumer-ds" -DataFile $DataFile

# Verify loads
Write-Host ""
Write-Host "Verifying data loads..." -ForegroundColor Cyan

$ProviderCount = Verify-DataLoad -FusekiUrl $ProviderFusekiUrl -Dataset "provider-ds"
$ConsumerCount = Verify-DataLoad -FusekiUrl $ConsumerFusekiUrl -Dataset "consumer-ds"

Write-Host ""
if ($ProviderSuccess -and $ConsumerSuccess -and $ProviderCount -gt 0 -and $ConsumerCount -gt 0) {
    Write-Host "Data loading completed successfully!" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "Data loading completed with errors. Check output above." -ForegroundColor Yellow
    exit 1
}
