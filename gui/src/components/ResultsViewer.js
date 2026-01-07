import React, { useState } from 'react';
import '../styles/ResultsViewer.css';

function ResultsViewer({ results }) {
  const [viewMode, setViewMode] = useState('table');

  if (!results) return null;

  const bindings = results.datasources 
    ? results.datasources.flatMap(ds => 
        ds.results?.results?.bindings?.map(b => ({ ...b, _source: ds.datasourceId })) || []
      )
    : results.results?.bindings || [];

  const variables = results.datasources
    ? results.datasources[0]?.results?.head?.vars || []
    : results.results?.head?.vars || [];

  const renderCellValue = (value) => {
    if (!value) return '-';
    if (typeof value === 'string') {
      if (value.startsWith('http://') || value.startsWith('https://')) {
        return (
          <a href={value} target="_blank" rel="noopener noreferrer" className="uri-link">
            {value.split('/').pop()}
          </a>
        );
      }
      return value;
    }
    if (value.type === 'uri') {
      return (
        <a href={value.value} target="_blank" rel="noopener noreferrer" className="uri-link">
          {value.value.split('/').pop()}
        </a>
      );
    }
    if (value.type === 'literal') {
      return value.value;
    }
    return JSON.stringify(value);
  };

  const TableView = () => (
    <div className="table-wrapper">
      <table className="results-table">
        <thead>
          <tr>
            {variables.map(v => (
              <th key={v}>{v}</th>
            ))}
            {results.datasources && <th>Source</th>}
          </tr>
        </thead>
        <tbody>
          {bindings.length === 0 ? (
            <tr>
              <td colSpan={variables.length + (results.datasources ? 1 : 0)} className="no-results">
                No results found
              </td>
            </tr>
          ) : (
            bindings.map((binding, idx) => (
              <tr key={idx}>
                {variables.map(v => (
                  <td key={v}>{renderCellValue(binding[v])}</td>
                ))}
                {results.datasources && <td className="source-cell">{binding._source}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const JsonView = () => (
    <pre className="json-view">
      {JSON.stringify(results, null, 2)}
    </pre>
  );

  return (
    <div className="results-viewer">
      <div className="results-header">
        <h2>📊 Results</h2>
        <div className="results-meta">
          <span>{bindings.length} rows</span>
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              Table
            </button>
            <button
              className={`toggle-btn ${viewMode === 'json' ? 'active' : ''}`}
              onClick={() => setViewMode('json')}
            >
              JSON
            </button>
          </div>
        </div>
      </div>

      <div className="results-content">
        {viewMode === 'table' ? <TableView /> : <JsonView />}
      </div>
    </div>
  );
}

export default ResultsViewer;
