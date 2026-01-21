import React, { useState } from 'react';
import axios from 'axios';
import '../styles/DataSourceManager.css';

function DataSourceManager({ datasources, isLoading, onRefresh }) {
  const [selectedStats, setSelectedStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(null);
  const [catalogData, setCatalogData] = useState(null);

  const fetchStats = async (datasourceId) => {
    try {
      setLoadingStats(datasourceId);
      const response = await axios.get(`/api/datasources/${datasourceId}/stats`);
      setSelectedStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(null);
    }
  };

  const fetchCatalog = async (datasourceId) => {
    try {
      setLoadingStats(datasourceId);
      const response = await axios.get(`/api/datasources/${datasourceId}/catalog`);
      setCatalogData(response.data);
    } catch (error) {
      console.error('Error fetching catalog:', error);
    } finally {
      setLoadingStats(null);
    }
  };

  return (
    <div className="datasource-manager">
      <div className="manager-header">
        <h2>🗄️ Data Sources</h2>
        <button 
          className="refresh-btn"
          onClick={onRefresh}
          disabled={isLoading}
        >
          🔄 Refresh
        </button>
      </div>

      <div className="datasources-grid">
        {datasources.map(ds => (
          <div key={ds.id} className="datasource-card">
            <div className="card-header">
              <h3>{ds.name}</h3>
              <span className={`status-badge ${ds.status}`}>
                {ds.status}
              </span>
            </div>

            <div className="card-details">
              <p><strong>Type:</strong> {ds.type}</p>
              <p><strong>Endpoint:</strong><br/>
                <code>{ds.endpoint}</code>
              </p>
            </div>

            <div className="card-actions">
              <button
                className="action-btn"
                onClick={() => fetchStats(ds.id)}
                disabled={loadingStats === ds.id}
              >
                {loadingStats === ds.id ? '⏳' : '📊'} Stats
              </button>
              <button
                className="action-btn"
                onClick={() => fetchCatalog(ds.id)}
                disabled={loadingStats === ds.id}
              >
                {loadingStats === ds.id ? '⏳' : '📚'} Catalog
              </button>
            </div>

            {selectedStats?.datasourceId === ds.id && (
              <div className="stats-panel">
                <h4>Statistics</h4>
                <p>Total Triples: <strong>{selectedStats.tripleCount}</strong></p>
              </div>
            )}

            {catalogData?.datasourceId === ds.id && (
              <div className="catalog-panel">
                {catalogData.classes.length > 0 ? (
                  <>
                    <h4>Classes ({catalogData.classes.length})</h4>
                    <div className="classes-list">
                      {catalogData.classes.slice(0, 10).map((cls, idx) => (
                        <div key={idx} className="class-item">
                          <code>{cls.class?.value?.split(/[/#]/).pop() || 'Unknown'}</code>
                          {cls.count && <span className="count-badge">{cls.count.value} instances</span>}
                        </div>
                      ))}
                      {catalogData.classes.length > 10 && (
                        <p className="more-text">... and {catalogData.classes.length - 10} more</p>
                      )}
                    </div>
                  </>
                ) : (
                  <p>No classes found</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {datasources.length === 0 && (
        <div className="empty-state">
          <p>No data sources available</p>
        </div>
      )}
    </div>
  );
}

export default DataSourceManager;
