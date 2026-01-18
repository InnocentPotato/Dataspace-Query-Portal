# EDC Connector Documentation

## Overview

The EDC (Eclipse Dataspace Connector) integration provides a simplified connector for managing access to RDF data sources in the dataspace. This implementation is a mock for demonstration purposes and does not include full policy management or governance.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Dataspace                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌────────────────┐          ┌──────────────────┐  │
│  │ Provider EDC   │          │ Consumer EDC     │  │
│  │ Connector      │◄────────►│ Connector        │  │
│  │ (Port 9191)    │          │ (Port 9192)      │  │
│  └────────┬───────┘          └────────┬─────────┘  │
│           │                           │            │
│  ┌────────▼──────┐          ┌─────────▼────────┐  │
│  │ Fuseki        │          │ Fuseki           │  │
│  │ Provider      │          │ Consumer         │  │
│  │ (Port 3030)   │          │ (Port 3031)      │  │
│  └───────────────┘          └──────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Simplified Connector

This implementation focuses on **data querying** without:
- ❌ Policy enforcement
- ❌ Contract negotiation
- ❌ Access control lists
- ❌ Digital signatures
- ❌ Audit logging

For production use, consider implementing:
- Authentication and authorization
- Usage policies
- Data governance
- Compliance tracking

## API Endpoints

### 1. Health Check
```
GET /health

Response:
{
  "status": "ok",
  "connectorId": "edc-connector-9191"
}
```

### 2. Catalog - List Datasets
```
GET /catalog/datasets

Returns available RDF classes and their instances
```

### 3. Catalog - Get Dataset Details
```
GET /catalog/datasets/:id

Get detailed information about a specific dataset
```

### 4. Contract Negotiation
```
POST /contracts/negotiate
Body: {
  "datasetId": "http://example.org/person",
  "consumerId": "consumer-123"
}

Response:
{
  "contractId": "contract-1234",
  "status": "agreed",
  "accessToken": "mock-token-contract-1234"
}
```

### 5. Access Control
```
POST /contracts/:contractId/access
Body: {
  "query": "SELECT ?s WHERE { ?s a foaf:Person }"
}

Grants access to execute query
```

### 6. Asset Information
```
GET /assets/:id

Get asset metadata and capabilities
```

### 7. Participant Information
```
GET /participants/self

Get connector's own information in the dataspace
```

## Running the Connector

### Standalone
```bash
cd edc
npm install
PORT=9191 npm start
```

### Docker
```bash
docker-compose up edc-provider edc-consumer
```

## Integration with Query API

The backend Query API automatically integrates with EDC connectors:

1. **Discovery**: Lists datasets from EDC connector
2. **Negotiation**: Obtains access tokens (simplified)
3. **Execution**: Routes queries through EDC to Fuseki
4. **Monitoring**: Tracks query execution

## Configuration

### Environment Variables

```bash
PORT=9191                    # Connector port
FUSEKI_URL=http://...        # Fuseki server URL
DATASPACE_ID=example         # Dataspace identifier
CONNECTOR_ID=provider-001    # Connector identifier
```

### Connector Profiles

#### Provider Connector
- Port: 9191
- Role: Data provider
- Fuseki: http://localhost:3030/provider-ds

#### Consumer Connector
- Port: 9192
- Role: Data consumer
- Fuseki: http://localhost:3031/consumer-ds

## Future Enhancements

1. **Policy Engine**
   - Define usage policies
   - Enforce access controls
   - Time-based restrictions

2. **Contract Management**
   - Full contract lifecycle
   - Negotiation workflows
   - Agreement templates

3. **Audit & Compliance**
   - Query logging
   - Access tracking
   - Compliance reporting

4. **Security**
   - TLS/SSL encryption
   - Digital signatures
   - Authentication tokens

5. **Monitoring**
   - Performance metrics
   - Error tracking
   - Health checks

## Testing

### Test Catalog Access
```bash
curl http://localhost:9191/catalog/datasets
```

### Test Negotiation
```bash
curl -X POST http://localhost:9191/contracts/negotiate \
  -H "Content-Type: application/json" \
  -d '{
    "datasetId": "http://example.org/person",
    "consumerId": "test-consumer"
  }'
```

### Test Asset Info
```bash
curl http://localhost:9191/assets/person
```

## Integration Example

```javascript
// Query through EDC
const axios = require('axios');

async function queryThroughEDC() {
  // 1. Get catalog
  const catalog = await axios.get('http://localhost:9191/catalog/datasets');
  console.log('Available datasets:', catalog.data.datasets);

  // 2. Negotiate contract
  const contract = await axios.post(
    'http://localhost:9191/contracts/negotiate',
    { datasetId: 'dataset-1', consumerId: 'my-app' }
  );
  console.log('Contract ID:', contract.data.contractId);

  // 3. Get access and execute query
  const access = await axios.post(
    `http://localhost:9191/contracts/${contract.data.contractId}/access`,
    { query: 'SELECT ?s WHERE { ?s a foaf:Person }' }
  );
  console.log('Access granted:', access.data);
}

queryThroughEDC();
```

## Notes for Production

1. **Security**: Implement proper authentication and encryption
2. **Policies**: Define clear data usage policies
3. **Governance**: Establish data ownership and lineage
4. **Compliance**: Ensure regulatory compliance
5. **Monitoring**: Track all access and usage
6. **Scalability**: Design for multiple connectors
7. **Resilience**: Implement failover and backup

For more details, see the official [Eclipse EDC Documentation](https://github.com/eclipse-edc/docs).
