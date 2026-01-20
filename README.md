# Dataspace Query Portal

A distributed microservices system for querying RDF data across a simulated dataspace environment using SPARQL, featuring a modern React frontend, a Node.js/Express orchestration layer, and Eclipse Dataspace Connector (EDC) mock integrations.

## Key Features

*   **Federated Querying**: Execute SPARQL queries against single or multiple datasource endpoints in parallel.
*   **Result Aggregation**: Centralized handling and visualization of results from distributed providers.
*   **Modern UI**: Responsive React-based interface with a Query Builder, Syntax Highlighting, and Table/JSON result views.
*   **Dataspace Simulation**: Includes mock EDC connectors to simulate data sovereignty and control plane signals.
*   **Automated Deployment**: Full Docker Compose orchestration with automatic RDF data loading and volume persistence.
*   **Semantic Standards**: Built on SPARQL 1.1, RDF/Turtle, and Apache Jena Fuseki.

## Documentation Index

| Document | Description |
|----------|-------------|
| [SETUP.md](SETUP.md) | **Start Here**. Detailed installation, Docker setup, and data loading guide. |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design, component diagrams, and data flow explanations. |
| [API.md](API.md) | REST API reference documentation for endpoints and request formats. |
| [EDC.md](EDC.md) | Documentation for the Eclipse Dataspace Connector integration. |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Solutions for common issues and error messages. |

## Quick Start

### Option 1: Automated Script (Recommended)

**Linux/Mac:**
```bash
./start.sh
```

**Windows:**
```powershell
.\start.bat
```

### Option 2: Docker & Manual Start

1.  **Start Infrastructure**:
    ```bash
    docker-compose up -d
    ```
2.  **Start Services**:
    Open two new terminals:
    ```bash
    # Terminal 1: Backend API
    cd api && npm install && npm start
    ```
    ```bash
    # Terminal 2: Frontend GUI
    cd gui && npm install && npm start
    ```
3.  **Access Portal**: Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
Dataspace-Query-Portal/
├── api/                  # Backend Node.js Express API
│   ├── server.js         # Core endpoint logic
│   └── ...
├── gui/                  # Frontend React Application
│   ├── src/components/   # QueryBuilder, ResultsViewer, etc.
│   └── ...
├── edc/                  # Mock Eclipse Dataspace Connector
├── data/                 # RDF Data Resources
│   └── sample-data.ttl   # Turtle file with sample ontology
├── docker-compose.yml    # Container orchestration config
└── ...
```

## Service Endpoints

| Service | URL | Role |
|---------|-----|------|
| **Web Portal** | [http://localhost:3000](http://localhost:3000) | User Interface |
| **Backend API** | [http://localhost:5000](http://localhost:5000) | Orchestration & Proxy |
| **Provider Fuseki** | [http://localhost:3030](http://localhost:3030) | RDF Triple Store 1 |
| **Consumer Fuseki** | [http://localhost:3031](http://localhost:3031) | RDF Triple Store 2 |
| **Provider EDC** | [http://localhost:9191](http://localhost:9191) | Connector Signal Mock |
| **Consumer EDC** | [http://localhost:9192](http://localhost:9192) | Connector Signal Mock |

## Sample Data

The system comes pre-loaded with a synthetic enterprise dataset modeled using **FOAF** and custom ontologies, containing:
*   **Personnel** (Names, Emails, Roles)
*   **Projects** (Budgets, Descriptions)
*   **Organizational Units** (Departments, Companies)

Refer to [SETUP.md](SETUP.md) for details on verifying or reloading this data.
