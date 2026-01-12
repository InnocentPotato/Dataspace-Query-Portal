# Setup Guide

This guide explains how to set up and run the Dataspace Query Portal locally.

## Prerequisites

- Node.js 18 or higher and npm
- Docker and Docker Compose installed and running
- Git (for cloning the repository)
- About 2-3 GB of available disk space for Docker images

## Important Notes

- Both Fuseki servers run without authentication by default in this development setup. This is not suitable for production environments.
- The API and GUI communicate through localhost URLs. If you need to access these services from other machines, you will need to adjust the configuration.
- Some npm packages may show deprecation warnings during installation. These do not affect functionality in development.

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Dataspace-Query-Portal
```

### 2. Install Dependencies

#### Backend API
```bash
cd api
npm install
cd ..
```

#### Frontend GUI
```bash
cd gui
npm install
cd ..
```

**Note:** The GUI requires react-scripts v5.0.1 or compatible. If you see errors during `npm start`, ensure the package.json has the correct version.

#### EDC Connector
```bash
cd edc
npm install
cd ..
```

### 3. Start Docker Services

First start the Docker desktop app
Start the Fuseki servers and EDC connectors using Docker Compose:

```bash
docker-compose up -d
```

This will start:
- Provider Fuseki on port 3030
- Consumer Fuseki on port 3031
- EDC Provider Connector on port 9191
- EDC Consumer Connector on port 9192

Both Fuseki servers are configured to run without authentication for development purposes.

Check that all services are running:
```bash
docker-compose ps
```

### 4. Verify Services are Running

Wait a few seconds for all services to fully initialize. You can verify the Fuseki servers are responding:

```bash
# Check Provider Fuseki
curl.exe http://localhost:3030/

# Check Consumer Fuseki
curl.exe http://localhost:3031/
```

Both should return the Fuseki web interface HTML.

### 5. Create and Populate Datasets

The Fuseki servers start without pre-created datasets. You can create them using curl commands:

```bash
# Create provider-ds dataset on Provider Fuseki
curl.exe -X POST "http://localhost:3030/$/datasets" `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "dbName=provider-ds&dbType=TDB2"

# Create consumer-ds dataset on Provider Fuseki
curl.exe -X POST "http://localhost:3030/$/datasets" `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "dbName=consumer-ds&dbType=TDB2"

# Create consumer-ds dataset on Consumer Fuseki
curl.exe -X POST "http://localhost:3031/$/datasets" `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "dbName=consumer-ds&dbType=TDB2"
```

Verify the datasets were created:
```bash
curl.exe http://localhost:3030/$/datasets
```

You should see the created datasets listed in JSON format.

### 6. Start Backend API

In a new terminal window, navigate to the api directory and start the backend server:

```bash
cd api
npm install
npm start
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

You should now have multiple processes running in separate terminals:
- **Terminal 1:** Docker containers (Fuseki servers and EDC connectors)
- **Terminal 2:** Backend API on http://localhost:5000
- **Terminal 3:** Frontend GUI on http://localhost:3000

All three must be running for the system to function correctly.

## Accessing the System

| Component | URL | Purpose |
|-----------|-----|---------|
| Query Portal | http://localhost:3000 | Web UI for querying |
| Backend API | http://localhost:5000 | REST API |
| Fuseki Provider | http://localhost:3030 | RDF store 1 |
| Fuseki Consumer | http://localhost:3031 | RDF store 2 |
| EDC Provider | http://localhost:9191 | Dataspace connector 1 |
| EDC Consumer | http://localhost:9192 | Dataspace connector 2 |

## Testing the Setup

Once everything is running, you can verify the system is working correctly:

### 1. Test the Fuseki Server

Access the Fuseki web interface directly:
```
http://localhost:3030
```

You should see the Fuseki administration interface. Click on "Manage datasets" to see your created datasets.

### 2. Run a SPARQL Query Directly on Fuseki

In the Fuseki web UI, select your dataset (e.g., provider-ds) and navigate to the Query tab. You can run SPARQL queries directly:

```sparql
SELECT ?s ?p ?o
WHERE {
  ?s ?p ?o
}
LIMIT 10
```

### 3. Test the Backend API (when running)

```bash
curl.exe http://localhost:5000/health
```

This should return a response indicating the API is running.

### 4. Test the Frontend GUI

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the Dataspace Query Portal interface.

### 5. Run a Query Through the API

When the API is running, you can submit SPARQL queries through the REST endpoint:

```bash
curl.exe -X POST http://localhost:5000/api/query `
  -H "Content-Type: application/json" `
  -d '{
    "datasourceId": "provider-ds",
    "sparqlQuery": "SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10"
  }'
```

## Troubleshooting

### Fuseki not starting
- Verify Docker Desktop is running
- Check that ports 3030 and 3031 are not in use by other applications
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
  curl.exe -u "admin:admin123" -X PUT "http://localhost:3030/provider-ds/data?default" `
    -H "Content-Type: text/turtle" --data-binary "@data/sample-data.ttl"
  ```
- To verify data was loaded, query the dataset count:
  ```powershell
  curl.exe -u "admin:admin123" "http://localhost:3030/provider-ds/query?query=SELECT%20(COUNT(%3Fs)%20as%20%3Fcount)%20WHERE%20%7B%20%3Fs%20%3Fp%20%3Fo%20%7D"
  ```
- The response should show a count value greater than 0

### npm install fails with vulnerabilities
- If you see vulnerability warnings, they are typically safe in a development environment
- You can suppress them by adding a `.npmrc` file with `legacy-peer-deps=true` if needed
- Do not use `npm audit fix --force` as it may break dependencies

## Stopping Services

```bash
# Stop all containers
docker-compose down

# Stop with volume cleanup (removes data)
docker-compose down -v
```

## Sample Queries

Once running, try these SPARQL queries in the GUI:

### Get All Triples
```sparql
SELECT ?s ?p ?o
WHERE {
  ?s ?p ?o
}
LIMIT 10
```

### Get All People
```sparql
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?person ?name ?email
WHERE {
  ?person rdf:type foaf:Person ;
          foaf:name ?name ;
          foaf:email ?email .
}
```

### Get Projects and Owners
```sparql
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

## Next Steps

After you have the system running, consider:

1. Upload sample RDF data to your datasets
2. Explore the Fuseki web interface at http://localhost:3030 to run SPARQL queries directly
3. Test the REST API endpoints to understand the data flow
4. Customize the sample data in `data/sample-data.ttl` to match your use case
5. Review the backend API code to understand how queries are processed
6. Configure the EDC connectors with proper policies and authentication when moving to production

For more information, see README.md
