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

```bash
git clone <repository-url>
cd Dataspace-Query-Portal

# Install dependencies for all microservices
npm install --prefix api
npm install --prefix gui
npm install --prefix edc
```

### 2. Start Infrastructure (Docker)

Initialize the databases and connectors:

```bash
docker-compose up -d
```
*Wait approximately 30 seconds for the containers to initialize and the datasets to be created.*

### 3. Start Application Services

It is recommended to run these in separate terminal windows to monitor logs.

**Terminal A: Backend API**
```bash
cd api
npm start
# Runs on port 5000
```

**Terminal B: Frontend GUI**
```bash
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

You can verify the data is present using `curl` or PowerShell:

```bash
# Check Provider Data Count (Expected: ~126 triples)
curl "http://localhost:3030/provider-ds/query?query=SELECT%20(COUNT(*)%20as%20?count)%20WHERE%20{?s%20?p%20?o}"
```

### Manual Data Reload

If you modify `data/sample-data.ttl` or need to reset the database:

**Option 1: PowerShell Script**
```powershell
.\load-data.ps1
```

**Option 2: Docker Restart**
```bash
docker-compose down -v
docker-compose up -d
```

---

## Validation Checklist

1.  **Containers**: Run `docker ps` - ensure 4 containers are "Up".
2.  **API Health**: Visit `http://localhost:5000/health` - should return JSON status.
3.  **GUI Access**: Visit `http://localhost:3000` - Dashboard should load without errors.
4.  **Query Test**: Use the "Simple Triple" template in the Query Builder and execute. You should see results.

## Stopping the System

To stop all services and preserve data:
```bash
docker-compose down
```

To stop services and **delete** data volumes (fresh start):
```bash
docker-compose down -v
```
