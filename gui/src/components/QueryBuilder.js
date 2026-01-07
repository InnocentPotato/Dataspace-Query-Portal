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

  const [limit, setLimit] = useState('1000');
  const [queryAll, setQueryAll] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onQuery({ sparqlQuery, limit: parseInt(limit), queryAll });
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
    'Persons': `PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?person ?name ?age
WHERE {
  ?person rdf:type foaf:Person ;
          foaf:name ?name ;
          foaf:age ?age .
}`,
    'Properties': `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?property ?domain ?range
WHERE {
  ?property rdf:type rdf:Property ;
            rdfs:domain ?domain ;
            rdfs:range ?range .
}`
  };

  return (
    <div className="query-builder">
      <h2>📝 SPARQL Query</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Data Source</label>
          <select 
            value={selectedDatasource || ''}
            onChange={(e) => onDatasourceChange(e.target.value)}
            disabled={queryAll}
          >
            {datasources.map(ds => (
              <option key={ds.id} value={ds.id}>
                {ds.name} ({ds.endpoint})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group checkbox">
          <input 
            type="checkbox"
            id="queryAll"
            checked={queryAll}
            onChange={(e) => setQueryAll(e.target.checked)}
          />
          <label htmlFor="queryAll">Query all datasources</label>
        </div>

        <div className="form-group">
          <label>Query Limit</label>
          <input 
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            min="1"
            max="10000"
          />
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
