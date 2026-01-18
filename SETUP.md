# Setup Guide

This document provides setup instructions for running the Dataspace Query Portal in a local development environment.

## Prerequisites

- Node.js 18+ with npm
- Docker Desktop with Docker Compose
- Git
- Minimum 2GB available disk space

## Architecture Overview

The system consists of four main components:
- **Fuseki RDF Stores**: Provider (port 3030) and Consumer (port 3031) databases
- **Backend API**: Express.js REST API (port 5000) that proxies SPARQL queries
- **Frontend GUI**: React application (port 3000) providing the query interface
- **EDC Connectors**: Provider (port 9191) and Consumer (port 9192) dataspace connectors

## Authentication

- SPARQL query endpoints: No authentication required
- Fuseki web administration interface: Username `admin`, Password `pw`
- The GUI and API interact with SPARQL endpoints only and do not require credentials

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd Dataspace-Query-Portal
```

### 2. Install Node Dependencies

Install dependencies for all three Node.js services:

```bash
# Backend API
cd api
npm install
cd ..

# Frontend GUI
cd gui
npm install
cd ..

# EDC Connector
cd edc
npm install
cd ..
```

### 3. Start Docker Services

Ensure Docker Desktop is running, then start all containerized services:

```bash
docker-compose up -d
```

This will start:
- Provider Fuseki on port 3030
- Consumer Fuseki on port 3031
- EDC Provider Connector on port 9191
- EDC Consumer Connector on port 9192
command starts:
- Fuseki Provider (port 3030) with dataset `provider-ds`
- Fuseki Consumer (port 3031) with dataset `consumer-ds`
- EDC Provider Connector (port 9191)
- EDC Consumer Connector (port 9192)

The system includes init containers that automatically create datasets and load sample data from `data/sample-data.ttl` (126 RDF triples). Allow 30 seconds for full initialization.

Verify all containers are running:

```bash
docker-compose ps
```

### 4. Verify Data Loading

Confirm that sample data has been loaded successfully:

```bash
# Verify dataset creation
curl.exe http://localhost:3030/$/datasets

# Count loaded triples (expected: 126)
curl.exe "http://localhost:3030/provider-ds/query?query=SELECT%20(COUNT(*)%20as%20?count)%20WHERE%20{?s%20?p%20?o}"
```

To manually reload data if needed, execute: `.\load-data.ps1`

Refer to [AUTO_LOAD_DATA.md](AUTO_LOAD_DATA.md) for sample data schema and query examples.

### 5. Start Backend API

Open a new terminal session and start the Express.js API
```

The API will start on port 5000 and connect to the Fuseki servers and EDC connectors.

### 7. Start Frontend GUI

**Important:** Open a third separate terminal window. Keep the API and GUI running simultaneously.

Navigate to the gui directory and start the React development server:

```bash
cd gui
npm start
```

This will automatically open the portal in your browser at http://localhost:3000. If it doesn't open automatically, you can navigate there manually.

### Running Status Summary
start
```

The API listens on port 5000 and provides REST endpoints for querying Fuseki servers.

### 6. Start Frontend GUI

Open another terminal session and start the React development server:

```bash
cd gui
npm start
```

The GUI will be accessible at http://localhost:3000. The browser should open automatically.

### Runtime Requirements

The following processes must remain active concurrently:
- Docker containers (Fuseki + EDC connectors)
- Backend API server (port 5000)
- Frontend development server (port 3000)
http://localhost:3030
```

You should see the Fuseki administration interface. Click on "Manage datasets" to see your created datasets.

### 2. Run a SPARQL Query Directly on Fuseki
Service Endpoints

| Component | URL | Description |
|-----------|-----|-------------|
| Query Portal | http://localhost:3000 | React web interface |
| Backend API | http://localhost:5000 | REST API endpoints |
| Fuseki Provider | http://localhost:3030 | Primary RDF database |
| Fuseki Consumer | http://localhost:3031 | Secondary RDF database |
| EDC Provider | http://localhost:9191 | Provider dataspace connector |
| EDC Consumer | http://localhost:9192 | Consumer dataspace connector |

## Verification

### API Health Check

```bash
curl.exe http://localhost:5000/health
```

Expected response: `{"status":"ok","timestamp":"<ISO-8601-timestamp>"}`

### Query API via Command Line

Test the query endpoint using PowerShell
- Review Docker logs: `docker-compose logs fuseki-provider`

### Fuseki requires authentication when I didn't set it
- The Fuseki containers are configured to run without authentication in development mode
- If you see authentication prompts, restart the containers: `docker-compose restart fuseki-provider fuseki-consumer`

### API connection errors
- Ensure all Fuseki datasets have been created before starting the API
- Verify that Fuseki is responding: `curl.exe http://localhost:3030/$/datasets`
- Check that the API can reach Fuseki at the expected URLs in your environment configuration

### Failed to fetch datasources: Request failed with status code 500
- This error means the API cannot connect to Fuseki
- Verify all datasets were created in Step 5
- Check Docker logs: `docker-compose logs`
- Restart the containers: `docker-compose down` then `docker-compose up -d`
- Wait 10-15 seconds for containers to fully initialize
- Restart the API server after containers are ready

### GUI shows blank page or cannot connect to API
- Check that the backend API is running on port 5000
- Verify CORS is properly configured in the API
- Check the browser console (F12) for specific error messages
- Ensure the API has initialized and is ready to receive requests

### Data not loading into Fuseki
- Use the **PUT method** (not POST) with the Graph Store Protocol endpoint
- Use the provided PowerShell script which handles authentication and correct HTTP methods:
  ```powershell
  .\load-data.ps1
  ```
- The script uses `admin:admin123` credentials and uploads data to both provider and consumer datasets
- If you need to manually upload with curl, use:
```powershell
'{"datasourceId": "datasource-0", "sparqlQuery": "SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10"}' | Out-File -Encoding utf8 -NoNewline query.json
curl.exe -X POST http://localhost:5000/api/query -H "Content-Type: application/json" -d "@query.json"
```

Expected response includes a `results` object with SPARQL query bindings.erify data is loaded in Fuseki by running: `curl.exe "http://localhost:3030/provider-ds/query?query=SELECT%20(COUNT(*)%20as%20?count)%20WHERE%20{?s%20?p%20?o}"`
- **Refresh the browser** (F5) to ensure updated GUI code is loaded
- Check the API logs for specific error messages in the terminal where you ran `npm start`
- Try the "Simple Triple" template first - if that works, the connection is fine
- Use the **Persons** template button which has a pre-tested working query
- If using a custom query, ensure all PREFIX declarations are included at the top

## Stopping Services

```bash
# Stop all containers
docker-compose down

# Stop with volume cleanup (removes data)
docker-compose down -v
```
Docker Containers Not Starting

**Symptoms**: `docker-compose up -d` fails or containers exit immediately

**Resolution**:
- Verify Docker Desktop is running
- Check port availability: 3030, 3031, 9191, 9192
- Review logs: `docker-compose logs fuseki-provider fuseki-consumer`
- Restart containers: `docker-compose down && docker-compose up -d`

### API Connection Failures

**Symptoms**: GUI shows "Failed to fetch datasources" or 500 errors

**Resolution**:
- Confirm API is running on port 5000: `curl.exe http://localhost:5000/health`
- Verify Fuseki datasets exist: `curl.exe http://localhost:3030/$/datasets`
- Check API terminal for error messages
- Restart API server if it has crashed

### GUI Shows "No Results Found"

**Symptoms**: Queries execute without errors but return no data

**Resolution**:
- Verify data is loaded: `curl.exe "http://localhost:3030/provider-ds/query?query=SELECT%20(COUNT(*)%20as%20?count)%20WHERE%20{?s%20?p%20?o}"`
- Expected count: 126 triples
- Refresh browser (F5) to ensure latest GUI code is loaded
- Test with "Simple Triple" template first to verify connectivity
- Ensure all SPARQL PREFIX declarations are included in custom queries

### SPARQL Query Syntax Errors

**Symptoms**: Query fails with 400 or 500 errors

**Resolution**:
- Verify all required PREFIX declarations are present:
  ```sparql
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
  ```
- Test query directly on Fuseki web UI (http://localhost:3030, login: admin/pw)
- Check query syntax against SPARQL 1.1 specification

### Data Not Loaded After Initialization

**Symptoms**: Query count returns 0 triples

**Resolution**:
- Wait 30 seconds after `docker-compose up -d` for init containers to complete
- Check init container logs: `docker-compose logs fuseki-provider-init`
- Manually reload data: `.\load-data.ps1`
- Verify `data/sample-data.ttl` exists and is valid Turtle format

### npm Dependency Warnings

**Symptoms**: Vulnerability warnings during `npm install`

**Resolution**:
- Warnings are generally safe in development environments
- Do not run `npm audit fix --force` as it may break dependencies
- For react-scripts compatibility issues, verify gui/package.json specifies version 5.0.1SPARQL Queries

Execute these queries through the GUI query interface or API:

### Basic Triple Pattern
```sparql
SELECT ?s ?p ?o
WHERE {
  ?s ?p ?o
}
LIMIT 10
```

### Query People with Email Addresses
```sparql
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?person ?name ?email
WHERE {
  ?person rdf:type foaf:Person ;
          foaf:name ?name ;
          foaf:email ?email .
}
```

### Query Projects with Owners
```sparql
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX ex: <http://example.org/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?project ?label ?owner ?ownerName
WHERE {
  ?project rdf:type ex:Project ;
           rdfs:label ?label ;
           ex:hasOwner ?owner .
  ?owner foaf:name ?ownerName .
}
```

Refer to [AUTO_LOAD_DATA.md](AUTO_LOAD_DATA.md) for complete sample data schema and additional query examples.

## Production Deployment Considerations

Before deploying to production:

1. Enable authentication on all Fuseki endpoints
2. Configure HTTPS/TLS for all services
3. Implement proper EDC connector policies and access control
4. Replace sample data with production datasets
5. Configure environment-specific settings via `.env` files
6. Review and harden CORS policies in the API
7. Build and deploy the React frontend as static assets
8. Implement proper logging and monitoring
9. Set up database backups for Fuseki persistent volumes

## Additional Resources

- [README.md](README.md) - Project overview and architecture
- [AUTO_LOAD_DATA.md](AUTO_LOAD_DATA.md) - Sample data documentation
- [API.md](API.md) - REST API endpoint reference