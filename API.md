# API Documentation

## Overview

The Dataspace Query API provides RESTful endpoints for querying RDF data stored in Apache Jena/Fuseki servers through an Eclipse Dataspace Connector.

## Base URL

```
http://localhost:5000
```

## Endpoints

### 1. Health Check

**Endpoint:** `GET /health`

Check API health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-07T10:30:00.000Z"
}
```

---

### 2. List Data Sources

**Endpoint:** `GET /api/datasources`

Get available data sources from the dataspace.

**Response:**
```json
[
  {
    "id": "datasource-0",
    "name": "Datasource 1",
    "endpoint": "http://localhost:3030/provider-ds",
    "type": "jena-fuseki",
    "status": "active"
  },
  {
    "id": "datasource-1",
    "name": "Datasource 2",
    "endpoint": "http://localhost:3031/consumer-ds",
    "type": "jena-fuseki",
    "status": "active"
  }
]
```

---

### 3. Query Single Data Source

**Endpoint:** `POST /api/query`

Execute a SPARQL query against a specific data source.

**Request:**
```json
{
  "datasourceId": "datasource-0",
  "sparqlQuery": "SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10",
  "limit": 1000
}
```

**Parameters:**
- `datasourceId` (string, required): ID of the target data source
- `sparqlQuery` (string, required): SPARQL query to execute
- `limit` (number, optional): Result limit if query doesn't include LIMIT clause

**Response:**
```json
{
  "datasourceId": "datasource-0",
  "query": "SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10",
  "results": {
    "head": {
      "vars": ["s", "p", "o"]
    },
    "results": {
      "bindings": [
        {
          "s": {
            "type": "uri",
            "value": "http://example.org/person1"
          },
          "p": {
            "type": "uri",
            "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
          },
          "o": {
            "type": "uri",
            "value": "http://xmlns.com/foaf/0.1/Person"
          }
        }
      ]
    }
  },
  "executionTime": "2024-01-07T10:30:15.234Z"
}
```

---

### 4. Query All Data Sources

**Endpoint:** `POST /api/query-all`

Execute a SPARQL query against all available data sources in parallel.

**Request:**
```json
{
  "sparqlQuery": "SELECT ?s WHERE { ?s rdf:type foaf:Person } LIMIT 20",
  "limit": 1000
}
```

**Parameters:**
- `sparqlQuery` (string, required): SPARQL query to execute
- `limit` (number, optional): Result limit if query doesn't include LIMIT clause

**Response:**
```json
{
  "query": "SELECT ?s WHERE { ?s rdf:type foaf:Person } LIMIT 20",
  "datasources": [
    {
      "datasourceId": "datasource-0",
      "datasourceName": "Datasource 1",
      "endpoint": "http://localhost:3030/provider-ds",
      "status": "success",
      "results": {
        "head": {
          "vars": ["s"]
        },
        "results": {
          "bindings": [...]
        }
      }
    },
    {
      "datasourceId": "datasource-1",
      "datasourceName": "Datasource 2",
      "endpoint": "http://localhost:3031/consumer-ds",
      "status": "failed",
      "error": "Connection timeout"
    }
  ],
  "executedAt": "2024-01-07T10:30:20.456Z"
}
```

---

### 5. Get Data Source Catalog

**Endpoint:** `GET /api/datasources/:id/catalog`

Get available classes and ontologies from a data source.

**Response:**
```json
{
  "datasourceId": "datasource-0",
  "classes": [
    {
      "class": {
        "type": "uri",
        "value": "http://xmlns.com/foaf/0.1/Person"
      },
      "label": {
        "type": "literal",
        "value": "Person"
      }
    }
  ]
}
```

---

### 6. Get Data Source Statistics

**Endpoint:** `GET /api/datasources/:id/stats`

Get statistics about a data source.

**Response:**
```json
{
  "datasourceId": "datasource-0",
  "tripleCount": "1250",
  "endpoint": "http://localhost:3030/provider-ds"
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message",
  "details": {
    "status": 400,
    "message": "Additional error details"
  }
}
```

### Common Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | Missing datasourceId or sparqlQuery | Required parameters not provided |
| 400 | Invalid datasourceId | Data source doesn't exist |
| 500 | Query execution failed | Syntax error in SPARQL query |
| 500 | Connection timeout | Fuseki server unreachable |

---

## Example SPARQL Queries

### Get All People
```sparql
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?person ?name ?email
WHERE {
  ?person a foaf:Person ;
          foaf:name ?name ;
          foaf:email ?email .
}
```

### Get Projects and Team Members
```sparql
PREFIX ex: <http://example.org/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?project ?label ?member ?memberName
WHERE {
  ?project a ex:Project ;
           rdfs:label ?label ;
           ex:hasTeamMember ?member .
  ?member foaf:name ?memberName .
}
```

### Find Connections
```sparql
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?person1 ?name1 ?person2 ?name2
WHERE {
  ?person1 foaf:knows ?person2 ;
           foaf:name ?name1 .
  ?person2 foaf:name ?name2 .
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Future versions will include:
- Request throttling per IP
- Query complexity scoring
- Results pagination
- Timeout enforcement

---

## Authentication

Current implementation does not include authentication. In production:
- Integrate with EDC token service
- Validate access policies
- Log all queries
- Implement audit trails

---

## CORS Headers

API supports CORS requests from:
- `http://localhost:3000` (Development)
- Configure in production environments

---

## Example cURL Commands

### Get Datasources
```bash
curl http://localhost:5000/api/datasources
```

### Run Query
```bash
curl -X POST http://localhost:5000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "datasourceId": "datasource-0",
    "sparqlQuery": "SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10"
  }'
```

### Query All Sources
```bash
curl -X POST http://localhost:5000/api/query-all \
  -H "Content-Type: application/json" \
  -d '{
    "sparqlQuery": "SELECT ?s WHERE { ?s a foaf:Person }"
  }'
```

### Get Statistics
```bash
curl http://localhost:5000/api/datasources/datasource-0/stats
```

---

For more information, see README.md and SETUP.md
