# Dataspace Query Portal

A system for querying Apache Jena/Fuseki servers through an Eclipse Dataspace Connector (EDC) via SPARQL, with a web-based GUI portal.

## Architecture

```
┌─────────────────┐
│   GUI Portal    │ (React Frontend)
│   :3000         │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│  Backend API    │ (Node.js/Express)
│   :5000         │
└────────┬────────┘
         │
    ┌────┴─────┐
    │           │
┌───▼──┐   ┌───▼──┐
│ EDC  │   │ RDF  │
│Conn  │   │Store │
└──────┘   └──────┘
            (Fuseki)
```

## Components

- **api/**: Backend API server with EDC integration
- **gui/**: Frontend React application
- **data/**: Sample RDF data and Fuseki configuration
- **docker/**: Docker Compose setup for local development

## Quick Start

```bash
# Install dependencies
npm install --prefix api
npm install --prefix gui

# Start services
docker-compose up -d  # Start Fuseki servers
npm start --prefix api  # Start backend
npm start --prefix gui  # Start frontend
```

## Endpoints

- API: http://localhost:5000
- GUI Portal: http://localhost:3000
- Fuseki Server 1: http://localhost:3030
- Fuseki Server 2: http://localhost:3031
