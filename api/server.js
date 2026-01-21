require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const morgan = require('morgan');
const { parse } = require('sparqljson-parse');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Configuration
const EDC_CONNECTOR_URL = process.env.EDC_CONNECTOR_URL || 'http://localhost:9191';
const FUSEKI_SERVERS = [
  process.env.FUSEKI_SERVER_1 || 'http://localhost:3030/provider-ds',
  process.env.FUSEKI_SERVER_2 || 'http://localhost:3031/consumer-ds'
];

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get available data sources from EDC
app.get('/api/datasources', async (req, res) => {
  try {
    const datasources = FUSEKI_SERVERS.map((url, idx) => ({
      id: `datasource-${idx}`,
      name: `Datasource ${idx + 1}`,
      endpoint: url,
      type: 'jena-fuseki',
      status: 'active'
    }));
    res.json(datasources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Query a specific datasource via EDC
app.post('/api/query', async (req, res) => {
  try {
    const { datasourceId, sparqlQuery, limit = 1000 } = req.body;

    if (!datasourceId || !sparqlQuery) {
      return res.status(400).json({ 
        error: 'Missing datasourceId or sparqlQuery' 
      });
    }

    // Get datasource endpoint
    const sourceIndex = parseInt(datasourceId.split('-')[1]);
    const endpoint = FUSEKI_SERVERS[sourceIndex];

    if (!endpoint) {
      return res.status(400).json({ 
        error: `Invalid datasourceId: ${datasourceId}` 
      });
    }

    // Add LIMIT if not present
    let query = sparqlQuery.trim();
    if (!query.toUpperCase().includes('LIMIT')) {
      query += `\nLIMIT ${limit}`;
    }

    // Execute SPARQL query
    console.log('Executing query on:', endpoint);
    console.log('Query:', query);
    
    const response = await axios.get(`${endpoint}/sparql`, {
      params: {
        query: query,
        format: 'application/sparql-results+json'
      },
      timeout: 30000
    });

    const results = response.data;

    res.json({
      datasourceId,
      query,
      results,
      executionTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('Query error:', error.message);
    console.error('Error details:', error.response?.data || error.stack);
    res.status(500).json({ 
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Query multiple datasources in parallel
app.post('/api/query-all', async (req, res) => {
  try {
    const { sparqlQuery, limit = 1000 } = req.body;

    if (!sparqlQuery) {
      return res.status(400).json({ 
        error: 'Missing sparqlQuery' 
      });
    }

    let query = sparqlQuery.trim();
    if (!query.toUpperCase().includes('LIMIT')) {
      query += `\nLIMIT ${limit}`;
    }

    // Query all datasources in parallel
    const queryPromises = FUSEKI_SERVERS.map((endpoint, idx) =>
      axios.get(`${endpoint}/sparql`, {
        params: {
          query: query,
          format: 'application/sparql-results+json'
        },
        timeout: 30000
      }).then(response => ({
        datasourceId: `datasource-${idx}`,
        datasourceName: `Datasource ${idx + 1}`,
        endpoint,
        results: response.data,
        status: 'success'
      })).catch(error => ({
        datasourceId: `datasource-${idx}`,
        datasourceName: `Datasource ${idx + 1}`,
        endpoint,
        error: error.message,
        status: 'failed'
      }))
    );

    const results = await Promise.all(queryPromises);

    res.json({
      query,
      datasources: results,
      executedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Multi-query error:', error.message);
    res.status(500).json({ 
      error: error.message
    });
  }
});

// Get catalog/available ontologies from a datasource
app.get('/api/datasources/:id/catalog', async (req, res) => {
  try {
    const sourceIndex = parseInt(req.params.id.split('-')[1]);
    const endpoint = FUSEKI_SERVERS[sourceIndex];

    if (!endpoint) {
      return res.status(400).json({ 
        error: `Invalid datasource: ${req.params.id}` 
      });
    }

    // Query for classes (instances of rdf:type)
    const classQuery = `
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      
      SELECT DISTINCT ?class (COUNT(?instance) as ?count) WHERE {
        ?instance rdf:type ?class .
      }
      GROUP BY ?class
      ORDER BY DESC(?count)
      LIMIT 100
    `;

    const classResponse = await axios.get(`${endpoint}/sparql`, {
      params: {
        query: classQuery,
        format: 'application/sparql-results+json'
      }
    });

    res.json({
      datasourceId: req.params.id,
      classes: classResponse.data.results.bindings || []
    });
  } catch (error) {
    console.error('Catalog error:', error.message);
    res.status(500).json({ 
      error: error.message
    });
  }
});

// Get statistics about a datasource
app.get('/api/datasources/:id/stats', async (req, res) => {
  try {
    const sourceIndex = parseInt(req.params.id.split('-')[1]);
    const endpoint = FUSEKI_SERVERS[sourceIndex];

    if (!endpoint) {
      return res.status(400).json({ 
        error: `Invalid datasource: ${req.params.id}` 
      });
    }

    // Count triples
    const statsQuery = `
      SELECT (COUNT(*) as ?tripleCount) WHERE {
        ?s ?p ?o
      }
    `;

    const statsResponse = await axios.get(`${endpoint}/sparql`, {
      params: {
        query: statsQuery,
        format: 'application/sparql-results+json'
      }
    });

    const tripleCount = statsResponse.data.results.bindings[0]?.tripleCount?.value || 0;

    res.json({
      datasourceId: req.params.id,
      tripleCount,
      endpoint
    });
  } catch (error) {
    console.error('Stats error:', error.message);
    res.status(500).json({ 
      error: error.message
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Dataspace Query API running on http://localhost:${PORT}`);
  console.log(`📡 Connected to EDC: ${EDC_CONNECTOR_URL}`);
  console.log(`🗄️ Fuseki Servers: ${FUSEKI_SERVERS.join(', ')}`);
});
