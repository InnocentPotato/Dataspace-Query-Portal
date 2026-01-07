# Setup Guide

This guide explains how to set up and run the Dataspace Query Portal locally.

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

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

#### EDC Connector
```bash
cd edc
npm install
cd ..
```

### 3. Start Docker Services

Start Fuseki servers and EDC connectors:

```bash
docker-compose up -d
```

This will:
- Start Provider Fuseki on port 3030
- Start Consumer Fuseki on port 3031
- Load sample RDF data into both servers
- Start EDC Provider Connector on port 9191
- Start EDC Consumer Connector on port 9192

Check status:
```bash
docker-compose ps
```

### 4. Wait for Services to Be Ready

The Fuseki servers need time to initialize and load data. Check readiness:

```bash
# Check Provider Fuseki
curl http://localhost:3030/

# Check Consumer Fuseki
curl http://localhost:3031/
```

You should see the Fuseki UI homepage.

### 5. Verify Datasets Are Loaded

Check available datasets on Provider:
```bash
curl http://localhost:3030/$/datasets
```

You should see `provider-ds` and `consumer-ds` listed.

### 6. Start Backend API

In a new terminal:

```bash
cd api
npm start
```

You should see:
```
🚀 Dataspace Query API running on http://localhost:5000
📡 Connected to EDC: http://localhost:9191
🗄️ Fuseki Servers: http://localhost:3030/provider-ds, http://localhost:3031/consumer-ds
```

### 7. Start Frontend GUI

In another terminal:

```bash
cd gui
npm start
```

This will open the portal at http://localhost:3000

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

### 1. Test API Health
```bash
curl http://localhost:5000/health
```

### 2. List Available Datasources
```bash
curl http://localhost:5000/api/datasources
```

### 3. Run a SPARQL Query via API
```bash
curl -X POST http://localhost:5000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "datasourceId": "datasource-0",
    "sparqlQuery": "SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10"
  }'
```

### 4. Access Fuseki Web UI
Open http://localhost:3030 in your browser to explore datasets directly.

## Troubleshooting

### Fuseki not starting
- Check Docker is running
- Wait longer for initialization (30-60 seconds)
- Check logs: `docker-compose logs fuseki-provider`

### API connection errors
- Ensure Fuseki is ready before starting API
- Check that Fuseki ports are not in use
- Verify environment variables in `api/.env`

### Cannot connect to API from GUI
- Check API is running on port 5000
- Verify CORS is enabled
- Check browser console for errors

### Data not loaded
- Check Docker logs for data load errors
- Manually upload data to Fuseki via web UI
- Run: `docker-compose restart && docker-compose logs -f`

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

1. Customize sample data in `data/sample-data.ttl`
2. Add authentication to EDC connectors
3. Implement policy management
4. Deploy to production environment
5. Configure governance policies

For more information, see README.md
