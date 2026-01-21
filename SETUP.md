# Setup & Installation Guide

This document provides comprehensive instructions to set up the Dataspace Query Portal in a local development environment.

## Prerequisites

*   **Node.js**: v18 or higher (with npm)
*   **Docker Desktop**: With Docker Compose enabled
*   **Git**: For version control
*   **Disk Space**: Minimum 2GB available

## Architecture Overview

The setup launches four containerized background services and two local Node.js processes:
1.  **Fuseki Provider & Consumer**: RDF Databases (Docker)
2.  **EDC Connector Mocks**: Simulating Dataspace control plane (Docker)
3.  **Backend API**: Express server (Local Node.js)
4.  **Frontend GUI**: React app (Local Node.js)

---

## Installation & Startup

### 1. Clone & Install Dependencies

⚠️ **Important**: All commands must be run from the project root directory (`Dataspace-Query-Portal`)

**Bash/Linux/macOS:**
```bash
git clone <repository-url>
cd Dataspace-Query-Portal

# Install dependencies for all microservices
npm install --prefix api
npm install --prefix gui
npm install --prefix edc
```

**PowerShell/Windows:**
```powershell
git clone <repository-url>
cd Dataspace-Query-Portal

# Install dependencies for all microservices
npm install --prefix api
npm install --prefix gui
npm install --prefix edc
```

> **Note**: The GUI installation may show 9 vulnerabilities in development dependencies. These are safe to ignore for local development as they only affect build tools, not the production application.

### 2. Start Infrastructure (Docker)

Initialize the databases and connectors from the project root:
//This requires Docker Desktop to be running in the background

**Bash/Linux/macOS:**
```bash
docker-compose up -d
```

**PowerShell/Windows:**
```powershell
docker-compose up -d
```

*Wait approximately 30 seconds for the containers to initialize and the datasets to be created.*

### 3. Start Application Services

It is recommended to run these in **separate terminal windows** to monitor logs.

**Terminal A: Backend API**

*Bash/Linux/macOS:*
```bash
cd api
npm start
# Runs on port 5000
```

*PowerShell/Windows:*
```powershell
cd api
npm start
# Runs on port 5000
```

**Terminal B: Frontend GUI**

*Bash/Linux/macOS:*
```bash
cd gui
npm start
# Runs on port 3000
```

*PowerShell/Windows:*
```powershell
cd gui
npm start
# Runs on port 3000
```

The browser should automatically open to [http://localhost:3000](http://localhost:3000).

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
