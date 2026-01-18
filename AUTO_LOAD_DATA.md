# Automatic Data Loading

## Overview
The Fuseki servers are now configured to **automatically load dummy data** when the Docker containers start. You no longer need to manually upload data!

## What Happens Automatically

When you run `docker-compose up -d`, the following happens automatically:

1. **Fuseki Provider** (localhost:3030):
   - Creates `provider-ds` dataset
   - Creates `consumer-ds` dataset
   - Loads sample data into both datasets

2. **Fuseki Consumer** (localhost:3031):
   - Creates `consumer-ds` dataset
   - Loads sample data into the dataset

## Dummy Data Included

The sample data (`data/sample-data.ttl`) contains:
- **5 People** (Alice, Bob, Carol, David, Emma) with details like name, email, age, department, and salary
- **2 Companies** (Tech Solutions Inc, Data Dynamics Ltd)
- **3 Projects** (Data Portal Platform, Analytics Engine, UI Redesign) with budgets and team members
- **3 Products** (Cloud Data Connector, Analytics Dashboard Pro, Data Security Suite)
- **3 Departments** (Engineering, Analytics, Product)

## Verify Data is Loaded

After containers start (wait ~20 seconds), verify data with:

```powershell
# Check Provider datasets
curl.exe http://localhost:3030/$/datasets

# Query Provider data (count triples)
curl.exe "http://localhost:3030/provider-ds/query?query=SELECT%20(COUNT(*) as ?count) WHERE {?s ?p ?o}"

# Check Consumer datasets
curl.exe http://localhost:3031/$/datasets

# Query Consumer data
curl.exe "http://localhost:3031/consumer-ds/query?query=SELECT%20(COUNT(*) as ?count) WHERE {?s ?p ?o}"
```

## Sample SPARQL Queries

Try these queries in the GUI:

### Get All People
```sparql
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
SELECT ?name ?email ?age
WHERE {
  ?person a foaf:Person ;
          foaf:name ?name ;
          foaf:email ?email ;
          foaf:age ?age .
}
```

### Get All Projects
```sparql
PREFIX ex: <http://example.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT ?project ?label ?description ?status
WHERE {
  ?project a ex:Project ;
           rdfs:label ?label ;
           ex:hasDescription ?description ;
           ex:status ?status .
}
```

### Get People by Department
```sparql
PREFIX ex: <http://example.org/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
SELECT ?name ?department ?salary
WHERE {
  ?person a foaf:Person ;
          foaf:name ?name ;
          ex:department ?department ;
          ex:salary ?salary .
}
ORDER BY DESC(?salary)
```

## Manual Reload (Optional)

If you need to reload data after modifying `data/sample-data.ttl`:

```powershell
.\load-data.ps1
```

Or restart the containers:
```powershell
docker-compose restart fuseki-provider fuseki-consumer
```

## How It Works

The automatic loading is implemented through:
1. **docker-entrypoint.sh** - Custom startup script that waits for Fuseki, creates datasets, and loads data
2. **Dockerfile.fuseki** - Uses the custom entrypoint
3. **docker-compose.yml** - Mounts the sample data file into the containers
4. **data/sample-data.ttl** - Contains all the dummy RDF data

## Troubleshooting

If data doesn't appear:
1. Check container logs: `docker-compose logs fuseki-provider`
2. Wait longer (first start can take 20-30 seconds)
3. Verify containers are healthy: `docker ps`
4. Manually reload using `.\load-data.ps1`
