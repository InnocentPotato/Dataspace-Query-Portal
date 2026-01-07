# Architecture & Design

## System Overview

The Dataspace Query Portal is a distributed system for querying RDF data across an Eclipse Dataspace with a user-friendly web interface.

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        WEB BROWSER                               │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                    HTTP/REST (port 3000)
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                     REACT FRONTEND GUI                           │
│  • Query Builder (SPARQL templates)                              │
│  • Results Viewer (Table & JSON)                                 │
│  • Data Source Manager                                           │
│  • Responsive Design                                             │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                    HTTP/REST (port 5000)
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                  NODE.JS EXPRESS API                             │
│  • SPARQL Query Handler                                          │
│  • Datasource Management                                         │
│  • EDC Integration                                               │
│  • Results Formatting                                            │
└────────┬─────────────────────────────────────────────────┬───────┘
         │                                                 │
  HTTP   │                                           HTTP  │
  SPARQL │                                           JSON  │
         │                                                 │
    ┌────▼──────────┐                          ┌──────────▼────┐
    │ EDC Connector │                          │ EDC Connector │
    │  (Provider)   │                          │  (Consumer)   │
    │  Port 9191    │                          │  Port 9192    │
    └────┬──────────┘                          └──────────┬────┘
         │                                                 │
    ┌────▼──────────────────────────────────────────────▼────┐
    │          DATASPACE (Docker Network)                    │
    │                                                        │
    │  ┌────────────────────────────────────────────────┐   │
    │  │         APACHE JENA FUSEKI SERVERS            │   │
    │  │                                                │   │
    │  │  ┌────────────────┐   ┌──────────────────┐   │   │
    │  │  │ Provider Fuseki│   │ Consumer Fuseki  │   │   │
    │  │  │ Port 3030      │   │ Port 3031        │   │   │
    │  │  │                │   │                  │   │   │
    │  │  │ TDB2 Database  │   │ TDB2 Database    │   │   │
    │  │  │ Sample RDF     │   │ Sample RDF       │   │   │
    │  │  └────────────────┘   └──────────────────┘   │   │
    │  │                                                │   │
    │  └────────────────────────────────────────────────┘   │
    │                                                        │
    └────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend GUI (React)

**Location:** `/gui`

**Technologies:**
- React 18
- Axios for HTTP requests
- CSS3 for styling
- ES6+ JavaScript

**Key Components:**

#### App.js
- Main application container
- Tab navigation (Query/DataSources)
- Error handling
- State management

#### QueryBuilder.js
- SPARQL query input
- Datasource selection
- Query templates
- Parameter control

#### ResultsViewer.js
- Table view of results
- JSON view for raw data
- Result formatting
- URI linking

#### DataSourceManager.js
- List available datasources
- Show statistics
- Display ontologies
- Monitor health

**Features:**
- Real-time query execution
- Multi-datasource queries
- Template-based query building
- Result visualization
- Responsive design

### 2. Backend API (Node.js/Express)

**Location:** `/api`

**Technologies:**
- Express 4
- Axios for HTTP client
- CORS support
- Morgan logging

**Key Endpoints:**

```
GET  /health                           # Health check
GET  /api/datasources                  # List all datasources
POST /api/query                        # Query single datasource
POST /api/query-all                    # Query all datasources
GET  /api/datasources/:id/catalog      # Get ontologies
GET  /api/datasources/:id/stats        # Get statistics
```

**Features:**
- SPARQL query execution
- Multi-datasource support
- Result aggregation
- Error handling
- Query validation

**Data Flow:**

```
Request → Validation → Datasource Lookup → SPARQL Query 
→ Fuseki HTTP → Response Parsing → Results Format → Response
```

### 3. EDC Connector

**Location:** `/edc`

**Role:** Simplified dataspace connector

**Functions:**
- Catalog management (list assets)
- Contract negotiation (simplified)
- Access control (basic)
- Asset information
- Participant info

**Endpoints:**

```
GET  /health                      # Health status
GET  /catalog/datasets            # List RDF datasets
GET  /catalog/datasets/:id        # Dataset details
POST /contracts/negotiate         # Negotiate access
POST /contracts/:id/access        # Grant query access
GET  /assets/:id                  # Asset metadata
GET  /participants/self           # Connector info
```

### 4. Apache Jena Fuseki Servers

**Role:** RDF data storage and SPARQL endpoint

**Instances:**
1. **Provider Fuseki** (Port 3030)
   - Dataset: `provider-ds`
   - Data: sample-data.ttl
   - TDB2 backend

2. **Consumer Fuseki** (Port 3031)
   - Dataset: `consumer-ds`
   - Data: sample-data.ttl
   - TDB2 backend

**Storage:**
- Turtle (.ttl) format
- RDF triples
- SPARQL query support

## Data Flow

### Simple Query Flow

```
1. User enters SPARQL query in GUI
   ↓
2. Frontend sends POST /api/query
   ↓
3. Backend validates query & datasource
   ↓
4. Backend sends SPARQL to Fuseki HTTP endpoint
   ↓
5. Fuseki executes query on TDB2 database
   ↓
6. Fuseki returns JSON-LD results
   ↓
7. Backend formats and returns to frontend
   ↓
8. Frontend displays results (table/JSON)
```

### Multi-Datasource Query Flow

```
1. User checks "Query all datasources"
   ↓
2. Frontend sends POST /api/query-all
   ↓
3. Backend queries all Fuseki instances in parallel
   ↓
4. Each Fuseki executes the same SPARQL query
   ↓
5. Results aggregated by backend
   ↓
6. Frontend shows results from all sources
   ↓
7. User can see which source each result came from
```

## Data Models

### RDF Data Structure

The sample data includes:

```
Classes:
- foaf:Person (people)
- foaf:Organization (companies)
- ex:Project (projects)

Properties:
- foaf:name, foaf:email, foaf:age
- foaf:knows (relationships)
- ex:hasOwner, ex:hasTeamMember

Instances:
- ex:person1, ex:person2, ex:person3
- ex:company1
- ex:project1, ex:project2
```

### SPARQL Result Format

```json
{
  "head": {
    "vars": ["var1", "var2", "var3"]
  },
  "results": {
    "bindings": [
      {
        "var1": { "type": "uri", "value": "..." },
        "var2": { "type": "literal", "value": "..." },
        "var3": { "type": "literal", "value": "..." }
      }
    ]
  }
}
```

## Deployment Architecture

### Development (Docker Compose)

```
docker-compose.yml
├── fuseki-provider (port 3030)
├── fuseki-consumer (port 3031)
├── edc-provider (port 9191)
└── edc-consumer (port 9192)

npm start (parallel)
├── api server (port 5000)
└── gui server (port 3000)
```

### Production Considerations

**Scalability:**
- Load balancer for API servers
- Clustering for Fuseki
- Cache layer (Redis)
- CDN for frontend

**Security:**
- HTTPS/TLS
- Authentication (OAuth2/OIDC)
- Authorization (policies)
- Input validation
- Rate limiting

**Reliability:**
- Health checks
- Auto-recovery
- Backup strategies
- Monitoring & alerting
- Distributed tracing

**Performance:**
- Query optimization
- Result pagination
- Caching strategies
- Query complexity limits

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 18.2.0 |
| Backend | Node.js | 18+ |
| Framework | Express | 4.18.2 |
| RDF Store | Apache Jena Fuseki | Latest |
| Database | TDB2 | Latest |
| Connector | EDC Mock | Custom |
| Container | Docker | Latest |
| Container Orch | Docker Compose | 3.8 |

## Security Architecture

### Authentication
- Currently: None (development only)
- Production: OAuth2/OIDC via EDC

### Authorization
- Currently: Open access
- Production: Policy-based access control

### Data Protection
- Currently: HTTP (development)
- Production: HTTPS/TLS encryption

### Audit
- Currently: Console logging
- Production: Query audit trails, access logs

## Scalability Considerations

### Query Performance
- Index RDF triples for fast retrieval
- Use SPARQL query optimization
- Implement result pagination
- Cache frequent queries

### Horizontal Scaling
- Multiple API server instances
- Load balancing
- Stateless design
- Distributed databases

### Vertical Scaling
- Increase Fuseki heap memory
- SSD storage for TDB2
- Network optimization

## Future Enhancements

1. **Full EDC Integration**
   - Policy negotiation
   - Contract management
   - Audit trails
   - Digital signatures

2. **Advanced Query Features**
   - SPARQL Update (INSERT/DELETE)
   - Named graphs
   - Federated queries
   - Query optimization

3. **Governance**
   - Data lineage tracking
   - Usage statistics
   - Compliance reporting
   - Data quality metrics

4. **User Experience**
   - Query history
   - Saved queries
   - Export functionality
   - Advanced analytics

5. **Integration**
   - Webhook support
   - GraphQL API
   - GRPC support
   - Message queues

## References

- [Eclipse Dataspace Connector](https://github.com/eclipse-edc/docs)
- [Apache Jena](https://jena.apache.org/)
- [SPARQL Query Language](https://www.w3.org/TR/sparql11-query/)
- [RDF Specification](https://www.w3.org/RDF/)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
