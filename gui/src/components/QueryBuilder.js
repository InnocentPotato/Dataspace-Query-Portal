import React, { useState } from 'react';
import '../styles/QueryBuilder.css';

function QueryBuilder({ datasources, selectedDatasource, onDatasourceChange, onQuery, isLoading }) {
  const [sparqlQuery, setSparqlQuery] = useState(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX ex: <http://example.org/>

SELECT ?subject ?predicate ?object
WHERE {
  ?subject ?predicate ?object
}
LIMIT 10`);

  const queryAll = true; // Always query all datasources

  const handleSubmit = (e) => {
    e.preventDefault();
    onQuery({ sparqlQuery, queryAll });
  };

  const loadTemplate = (template) => {
    setSparqlQuery(template);
  };

  const templates = {
    'Simple Triple': `PREFIX ex: <http://example.org/>

SELECT ?s ?p ?o
WHERE {
  ?s ?p ?o
}
LIMIT 10`,
    'Classes': `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?class
WHERE {
  ?instance rdf:type ?class
}`,
    'Persons': `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?person ?name ?age
WHERE {
  ?person rdf:type foaf:Person ;
          foaf:name ?name ;
          foaf:age ?age .
}`,
    'Custom Query': ``
  };

  return (
    <div className="query-builder">
      <h2>📝 SPARQL Query</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Querying All Data Sources</label>
          <div className="datasources-list">
            {datasources.length > 0 ? (
              datasources.map(ds => (
                <div key={ds.id} className="datasource-item">
                  <span className="datasource-icon">🗄️</span>
                  <span className="datasource-name">{ds.name}</span>
                  <code className="datasource-endpoint">{ds.endpoint}</code>
                </div>
              ))
            ) : (
              <p className="no-datasources">No datasources available</p>
            )}
          </div>
        </div>

        <div className="templates">
          <label>Templates</label>
          <div className="template-buttons">
            {Object.entries(templates).map(([name, template]) => (
              <button
                key={name}
                type="button"
                className="template-btn"
                onClick={() => loadTemplate(template)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>SPARQL Query</label>
          <textarea 
            value={sparqlQuery}
            onChange={(e) => setSparqlQuery(e.target.value)}
            rows="12"
            placeholder="Enter SPARQL query..."
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isLoading}
        >
          {isLoading ? '⏳ Executing...' : '▶️ Execute Query'}
        </button>
      </form>
    </div>
  );
}

export default QueryBuilder;
