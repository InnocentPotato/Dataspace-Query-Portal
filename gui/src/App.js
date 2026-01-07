import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import QueryBuilder from './components/QueryBuilder';
import DataSourceManager from './components/DataSourceManager';
import ResultsViewer from './components/ResultsViewer';

function App() {
  const [activeTab, setActiveTab] = useState('query');
  const [datasources, setDatasources] = useState([]);
  const [selectedDatasource, setSelectedDatasource] = useState(null);
  const [queryResults, setQueryResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch datasources on mount
  useEffect(() => {
    fetchDatasources();
  }, []);

  const fetchDatasources = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/datasources');
      setDatasources(response.data);
      if (response.data.length > 0 && !selectedDatasource) {
        setSelectedDatasource(response.data[0].id);
      }
      setError(null);
    } catch (err) {
      setError(`Failed to fetch datasources: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuery = async (queryData) => {
    try {
      setIsLoading(true);
      setError(null);

      const endpoint = queryData.queryAll ? '/api/query-all' : '/api/query';
      const payload = queryData.queryAll 
        ? { sparqlQuery: queryData.sparqlQuery }
        : { 
            datasourceId: selectedDatasource, 
            sparqlQuery: queryData.sparqlQuery,
            limit: queryData.limit || 1000
          };

      const response = await axios.post(endpoint, payload);
      setQueryResults(response.data);
    } catch (err) {
      setError(`Query failed: ${err.response?.data?.error || err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌐 Dataspace Query Portal</h1>
        <p>Query RDF data through Eclipse Dataspace Connector</p>
      </header>

      <nav className="app-nav">
        <button 
          className={`nav-btn ${activeTab === 'query' ? 'active' : ''}`}
          onClick={() => setActiveTab('query')}
        >
          📝 Query
        </button>
        <button 
          className={`nav-btn ${activeTab === 'datasources' ? 'active' : ''}`}
          onClick={() => setActiveTab('datasources')}
        >
          🗄️ Data Sources
        </button>
      </nav>

      <main className="app-content">
        {error && (
          <div className="error-banner">
            <span>❌ {error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {activeTab === 'query' && (
          <div className="query-section">
            <div className="query-container">
              <QueryBuilder 
                datasources={datasources}
                selectedDatasource={selectedDatasource}
                onDatasourceChange={setSelectedDatasource}
                onQuery={handleQuery}
                isLoading={isLoading}
              />
            </div>
            {queryResults && (
              <div className="results-container">
                <ResultsViewer results={queryResults} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'datasources' && (
          <DataSourceManager 
            datasources={datasources}
            isLoading={isLoading}
            onRefresh={fetchDatasources}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Dataspace Query Portal v1.0 | Powered by Eclipse EDC & Apache Jena</p>
      </footer>
    </div>
  );
}

export default App;
