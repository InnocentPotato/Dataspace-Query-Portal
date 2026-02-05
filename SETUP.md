# Setup & Installation Guide

This document provides comprehensive instructions to set up the Dataspace Query Portal in a local development environment.

## Prerequisites

*   **Docker Desktop**: With Docker Compose enabled (v1.29+)
*   **Git**: For version control
*   **Disk Space**: Minimum 3GB available
*   **Available Ports**: 3000, 3030, 3031, 5000, 9191, 9192

## Architecture Overview

The setup launches six fully containerized services:
1.  **Frontend GUI**: React application served via Nginx
2.  **Backend API**: Node.js Express server
3.  **Fuseki Provider & Consumer**: RDF Databases
4.  **EDC Connector Mocks**: Simulating Dataspace control plane

---

## Installation & Startup

### 1. Clone Repository

All commands must be run from the project root directory (`Dataspace-Query-Portal`).

**Bash/Linux/macOS:**
```bash
git clone https://github.com/InnocentPotato/Dataspace-Query-Portal
cd Dataspace-Query-Portal
```

**PowerShell/Windows:**
```powershell
git clone <repository-url>
cd Dataspace-Query-Portal
```

### 2. Start All Services

Ensure Docker Desktop is running. Execute this single command from the project root:

**Bash/Linux/macOS:**
```bash
docker-compose up
```

**PowerShell/Windows:**
```powershell
docker-compose up
```

To run in the background, append the `-d` flag:

```bash
docker-compose up -d
```

### 3. Access the Portal

Once the output shows that all services are healthy (approximately 15-30 seconds), open your browser and navigate to:

```
http://localhost:3000
```

All services are automatically configured and ready for use. No additional setup required.

---

## Data Management

### Automatic Data Loading

The system is configured to **automatically load dummy data** when Docker containers start.
*   **Mechanism**: The `init-fuseki.sh` script runs on container startup, creating `provider-ds` and `consumer-ds` datasets and populating them with `data/sample-data.ttl`.
*   **Windows note**: The init script is executed through a CRLF-safe entrypoint to avoid line-ending issues when the repository is cloned on Windows.
*   **Persistence**: Data is stored in Docker volumes (`fuseki-provider-data`, `fuseki-consumer-data`), ensuring it survives container restarts.

### Verifying Data Load

You can verify the data is present:

**Bash/Linux/macOS:**
```bash
# Check Provider Data Count (Expected: ~126 triples)
curl "http://localhost:3030/provider-ds/query?query=SELECT%20(COUNT(*)%20as%20?count)%20WHERE%20{?s%20?p%20?o}"
```

**PowerShell/Windows:**
```powershell
# Check Provider Data Count (Expected: ~126 triples)
Invoke-WebRequest "http://localhost:3030/provider-ds/query?query=SELECT%20(COUNT(*)%20as%20?count)%20WHERE%20{?s%20?p%20?o}"
```

### Manual Data Reload

If you modify `data/sample-data.ttl` or need to reset the database:

**Option 1: PowerShell Script (Windows Only)**
```powershell
.\load-data.ps1
```

**Option 2: Docker Restart (All Platforms)**

*Bash/Linux/macOS:*
```bash
docker-compose down -v
docker-compose up -d
```

*PowerShell/Windows:*
```powershell
docker-compose down -v
docker-compose up -d
```

---

## Validation Checklist

Run these checks from the project root directory:

1.  **Containers**: Run `docker ps` - ensure 6 containers are "Up" (if init containers already exited, they won't show).
2.  **Init Logs**: Check initialization completed successfully:
    ```powershell
    docker-compose logs fuseki-provider-init fuseki-consumer-init
    ```
    You should see "✓ Data loaded" messages. If not, see [Empty Query Results](#empty-query-results-data-not-loading) in Troubleshooting.
3.  **API Health**: Visit `http://localhost:5000/health` - should return JSON status.
4.  **GUI Access**: Visit `http://localhost:3000` - Dashboard should load without errors.
5.  **Query Test**: Use the "Simple Triple" template in the Query Builder and execute. You should see results with data about people (Alice, Bob, Carol).

## Stopping the System

To stop all services and preserve data:

*Bash/Linux/macOS:*
```bash
docker-compose down
```

*PowerShell/Windows:*
```powershell
docker-compose down
```

To stop services and **delete** data volumes (fresh start):

*Bash/Linux/macOS:*
```bash
docker-compose down -v
```

*PowerShell/Windows:*
```powershell
docker-compose down -v
```

---

## Troubleshooting

### Empty Query Results (Data Not Loading)

**Symptoms**: Queries execute successfully (200 OK) but return no results. The GUI shows empty result sets.

**Cause**: The initialization containers that load sample data either failed or didn't run because Docker volumes from a previous session still exist.

**Quick Fix - Use Helper Script**:

*Windows PowerShell:*
```powershell
.\fix-empty-data.ps1
```

*Linux/macOS:*
```bash
chmod +x fix-empty-data.sh
./fix-empty-data.sh
```

The script will automatically:
- Stop all containers and remove volumes
- Restart with fresh data
- Show initialization logs
- Verify data was loaded successfully

**Manual Solution**:

*Windows PowerShell:*
```powershell
# Stop all containers and remove volumes
docker-compose down -v

# Verify volumes are removed
docker volume ls | Select-String "fuseki"

# Restart with fresh volumes
docker-compose up -d

# Monitor initialization (wait ~30 seconds)
docker-compose logs fuseki-provider-init fuseki-consumer-init
```

*Linux/macOS/Git Bash:*
```bash
# Stop all containers and remove volumes
docker-compose down -v

# Verify volumes are removed
docker volume ls | grep fuseki

# Restart with fresh volumes
docker-compose up -d

# Monitor initialization (wait ~30 seconds)
docker-compose logs fuseki-provider-init fuseki-consumer-init
```

**Expected Output**:
You should see messages like:
```
fuseki-provider-init  | Waiting for Fuseki to be fully ready...
fuseki-provider-init  | Loading sample data into provider-ds...
fuseki-provider-init  | ✓ Data loaded into provider-ds!
fuseki-consumer-init  | Loading sample data into consumer-ds...
fuseki-consumer-init  | ✓ Data loaded into consumer-ds!
```

**Verification**:
After initialization completes, verify data was loaded:

*Windows PowerShell:*
```powershell
Invoke-RestMethod "http://localhost:3030/provider-ds/query?query=SELECT%20(COUNT(*)%20as%20?count)%20WHERE%20{?s%20?p%20?o}"
```

*Linux/macOS:*
```bash
curl "http://localhost:3030/provider-ds/query?query=SELECT%20(COUNT(*)%20as%20?count)%20WHERE%20{?s%20?p%20?o}"
```

Expected response should show `~126` triples.

### "Cannot find package.json" Error

If you see an error like `ENOENT: no such file or directory, open '...\gui\edc\package.json'`:
- **Cause**: You're running the command from a subdirectory instead of the project root.
- **Solution**: Navigate back to the project root (`Dataspace-Query-Portal`) before running any `npm install --prefix` commands.

### Vulnerability Warnings in GUI

The GUI package may show security vulnerabilities in development dependencies (react-scripts, webpack-dev-server). These can be safely ignored for local development as they:
- Only affect the development server and build tools
- Do not impact the production application
- Cannot be fixed without breaking changes (`npm audit fix --force` would install react-scripts@0.0.0)
