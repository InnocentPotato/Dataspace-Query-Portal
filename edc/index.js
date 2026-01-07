const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 9191;
const FUSEKI_URL = process.env.FUSEKI_URL || 'http://localhost:3030/provider-ds';

// Mock EDC Connector - simplified without policy management
// In production, this would handle:
// - Contract negotiation
// - Policy enforcement
// - Access control
// - Catalog management
// - Transfer processes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', connectorId: `edc-connector-${PORT}` });
});

// Catalog API - returns available assets
app.get('/catalog/datasets', async (req, res) => {
  try {
    // Query Fuseki for available classes/resources
    const query = `
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      
      SELECT DISTINCT ?class ?label COUNT(?instance) as ?instanceCount
      WHERE {
        ?instance rdf:type ?class .
        OPTIONAL { ?class rdfs:label ?label }
      }
      GROUP BY ?class ?label
    `;

    const response = await axios.get(`${FUSEKI_URL}/sparql`, {
      params: {
        query: query,
        format: 'application/sparql-results+json'
      }
    });

    const datasets = response.data.results.bindings.map(binding => ({
      id: binding.class?.value || 'unknown',
      name: binding.label?.value || binding.class?.value?.split('/').pop(),
      type: 'sparql-endpoint',
      format: 'rdf',
      recordCount: binding.instanceCount?.value || 0
    }));

    res.json({
      datasets,
      connectorId: `edc-connector-${PORT}`
    });
  } catch (error) {
    console.error('Catalog error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Catalog API - returns dataset details
app.get('/catalog/datasets/:id', (req, res) => {
  res.json({
    id: req.params.id,
    name: req.params.id,
    description: 'RDF Dataset',
    type: 'sparql-endpoint',
    endpoint: FUSEKI_URL,
    format: 'rdf',
    accessLevel: 'public' // In production, this would be policy-controlled
  });
});

// Contract negotiation - simplified (no actual policy enforcement)
app.post('/contracts/negotiate', (req, res) => {
  const { datasetId, consumerId } = req.body;

  // In production, this would:
  // 1. Check policies
  // 2. Verify consumer credentials
  // 3. Negotiate contract terms
  // 4. Generate contract agreement

  const contractId = `contract-${Date.now()}`;

  res.json({
    contractId,
    datasetId,
    consumerId,
    status: 'agreed',
    endpoint: FUSEKI_URL,
    accessToken: 'mock-token-' + contractId,
    expiresIn: 3600
  });
});

// Transfer/Access control - grant access to dataset
app.post('/contracts/:contractId/access', (req, res) => {
  const { contractId } = req.params;
  const { query } = req.body;

  // In production, this would:
  // 1. Verify contract validity
  // 2. Check access policies
  // 3. Log access
  // 4. Proxy the query with monitoring

  res.json({
    contractId,
    status: 'access-granted',
    query: query.substring(0, 100) + '...',
    endpoint: FUSEKI_URL,
    ttl: 3600
  });
});

// Asset info endpoint
app.get('/assets/:id', (req, res) => {
  res.json({
    id: req.params.id,
    name: 'RDF Dataset',
    description: 'Apache Jena Fuseki RDF Store',
    contentType: 'application/sparql-results+json',
    endpoint: FUSEKI_URL,
    dataCategory: 'open-data'
  });
});

// Participant info - who am I in the dataspace
app.get('/participants/self', (req, res) => {
  res.json({
    participantId: `edc-connector-${PORT}`,
    name: `EDC Connector on port ${PORT}`,
    role: PORT === '9191' ? 'Provider' : 'Consumer',
    dataspace: 'example-dataspace',
    did: `did:example:connector-${PORT}`
  });
});

console.log(`🔗 EDC Connector Mock running on port ${PORT}`);
console.log(`📡 Fuseki Backend: ${FUSEKI_URL}`);

app.listen(PORT, () => {
  console.log(`✅ Connector ready for dataspace operations`);
});
