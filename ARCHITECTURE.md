# Architecture & Visual Guide

## System Overview

The Dataspace Query Portal acts as a unified interface to a decentralized data network. It allows users to write standard SPARQL queries that are virtually federated across multiple connector-secured endpoints.

## High-Level Architecture

The system follows a layered architecture pattern:

```
┌─────────────────────────────────────────────────────────────────┐
│                     END USER (Web Browser)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    HTTP/REST (Port 3000)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
│                     (React Frontend)                            │
│                                                                 │
│  • Query Builder         • Results Viewer                       │
│  • Syntax Highlighting   • JSON/Table Rendering                 │
│  • Template Library      • Datasource Manager                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    HTTP/JSON (Port 5000)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    ORCHESTRATION LAYER                          │
│                  (Node.js Express API)                          │
│                                                                 │
│  • Request Validation    • Result Aggregation                   │
│  • Sparql Proxy          • Error Handling                       │
└─────────┬──────────────────────────────────────┬────────────────┘
          │                                      │
   (Mock Protocol)                        (Mock Protocol)
          │                                      │
┌─────────▼──────────────────┐     ┌─────────────▼────────────────┐
│      CONNECTOR LAYER       │     │      CONNECTOR LAYER         │
│     (Provider Node)        │     │      (Consumer Node)         │
│      [Port 9191]           │     │       [Port 9192]            │
└─────────┬──────────────────┘     └─────────────┬────────────────┘
          │                                      │
     SPARQL/HTTP                            SPARQL/HTTP
          │                                      │
┌─────────▼──────────────────┐     ┌─────────────▼────────────────┐
│      PERSISTENCE LAYER     │     │     PERSISTENCE LAYER        │
│      (Fuseki Provider)     │     │     (Fuseki Consumer)        │
│      [Port 3030]           │     │       [Port 3031]            │
│       TDB2 Store           │     │        TDB2 Store            │
└────────────────────────────┘     └──────────────────────────────┘
```

## Data Flow: Query Execution

When a user executes a query, the data flows through the system as follows:

1.  **Submission**: User enters a SPARQL query in the React GUI. The app validates basic syntax and POSTs a JSON payload to the API.
    ```json
    {
      "datasourceId": "datasource-0",
      "sparqlQuery": "SELECT ?s ?p ?o ..."
    }
    ```

2.  **Orchestration**: The Express API receives the request.
    *   It identifies the target `datasourceId` (e.g., `datasource-0` → Provider Node).
    *   It forwards the SPARQL query to the corresponding Fuseki HTTP endpoint (`/provider-ds/query`).

3.  **Execution**:
    *   Fuseki parses the SPARQL.
    *   The query runs against the **TDB2** dataset.
    *   Results are serialized as `application/sparql-results+json`.

4.  **Response**:
    *   Fuseki returns the JSON results to the API.
    *   The API augments the response with execution metadata (timestamps, source ID).
    *   The API sends the final response to the React Frontend.

5.  **Visualization**:
    *   The Frontend parses the bindings.
    *   Results are rendered into a sortable, paginated table or raw JSON view.

## Component Details

### 1. Frontend (GUI)
Built with **React 18**.
*   **State Management**: Uses React Hooks (`useState`, `useEffect`) to manage fetching states and UI tabs.
*   **Interaction**: `Axios` handles asynchronous communication with the backend.
*   **Styling**: Custom CSS3 variables for theming and grid layouts.

### 2. Backend API
Built with **Node.js** and **Express**.
*   Acts as an **API Gateway**, shielding the frontend from direct database access.
*   **Endpoints**:
    *   `POST /api/query`: Single source query.
    *   `POST /api/query-all`: Parallel execution across all sources.
    *   `GET /api/datasources`: Discovery endpoint providing connector details.

### 3. Connector Simulation (EDC)
Built with **Node.js**.
*   Simulates the **Control Plane** of an Eclipse Dataspace Connector.
*   In a real deployment, this layer would handle contract negotiation and token exchange.
*   In this demo, it provides a pass-through discovery mechanism and health checks.

### 4. Persistence (Fuseki)
*   Containerized **Apache Jena Fuseki** server.
*   **TDB2** storage engine for high-performance RDF triples.
*   Initialization scripts (`init-fuseki.sh`) ensure data consistency on startup.
