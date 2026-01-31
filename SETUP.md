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

1.  **Containers**: Run `docker ps` - ensure 4 containers are "Up".
2.  **API Health**: Visit `http://localhost:5000/health` - should return JSON status.
3.  **GUI Access**: Visit `http://localhost:3000` - Dashboard should load without errors.
4.  **Query Test**: Use the "Simple Triple" template in the Query Builder and execute. You should see results.

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

### "Cannot find package.json" Error

If you see an error like `ENOENT: no such file or directory, open '...\gui\edc\package.json'`:
- **Cause**: You're running the command from a subdirectory instead of the project root.
- **Solution**: Navigate back to the project root (`Dataspace-Query-Portal`) before running any `npm install --prefix` commands.

### Vulnerability Warnings in GUI

The GUI package may show security vulnerabilities in development dependencies (react-scripts, webpack-dev-server). These can be safely ignored for local development as they:
- Only affect the development server and build tools
- Do not impact the production application
- Cannot be fixed without breaking changes (`npm audit fix --force` would install react-scripts@0.0.0)
