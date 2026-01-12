# 🚀 Quick Reference Card

## One-Page Cheat Sheet for Dataspace Query Portal

---

## ⚡ Quick Start (Choose One)

### Option 1: Linux/Mac - One Command
```bash
./start.sh
```

### Option 2: Windows - One Command
```cmd
start.bat
```

### Option 3: Manual Setup
```bash
npm install --prefix api && npm install --prefix gui
docker-compose up -d
npm start --prefix api &
npm start --prefix gui
```

---

##  Access URLs

| What | URL |
|------|-----|
| Web Portal | http://localhost:3000 |
| API | http://localhost:5000 |
| Fuseki 1 | http://localhost:3030 |
| Fuseki 2 | http://localhost:3031 |

---

##  Sample SPARQL Queries

### Get All Data (10 results)
```sparql
SELECT ?s ?p ?o
WHERE { ?s ?p ?o }
LIMIT 10
```

### Find All People
```sparql
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?person ?name ?email
WHERE {
  ?person a foaf:Person ;
          foaf:name ?name ;
          foaf:email ?email .
}
```

### Get Projects and Owners
```sparql
PREFIX ex: <http://example.org/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?project ?label ?owner ?ownerName
WHERE {
  ?project a ex:Project ;
           rdfs:label ?label ;
           ex:hasOwner ?owner .
  ?owner foaf:name ?ownerName .
}
```

---

## 🔌 API Endpoints

### Health Check
```bash
curl http://localhost:5000/health
```

### Get Data Sources
```bash
curl http://localhost:5000/api/datasources
```

### Query Single Source
```bash
curl -X POST http://localhost:5000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "datasourceId": "datasource-0",
    "sparqlQuery": "SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10"
  }'
```

### Query All Sources
```bash
curl -X POST http://localhost:5000/api/query-all \
  -H "Content-Type: application/json" \
  -d '{
    "sparqlQuery": "SELECT ?s WHERE { ?s a foaf:Person }"
  }'
```

### Get Statistics
```bash
curl http://localhost:5000/api/datasources/datasource-0/stats
```

---

##  Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs

# Restart a service
docker-compose restart fuseki-provider

# Remove everything (careful!)
docker-compose down -v
```

---

##  Common Fixes

### "Connection Refused" Error
```bash
# Make sure Docker is running
docker-compose ps

# Wait 30 seconds for startup
sleep 30
```

### Port Already in Use
```bash
# Check what's using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

### Need Clean Restart
```bash
docker-compose down -v
rm -rf api/node_modules gui/node_modules edc/node_modules
npm install --prefix api && npm install --prefix gui
docker-compose up -d
sleep 30
npm start --prefix api &
npm start --prefix gui
```

---

##  File Locations

| Component | Location |
|-----------|----------|
| API Server | `api/server.js` |
| Frontend | `gui/src/App.js` |
| EDC Connector | `edc/index.js` |
| Sample Data | `data/sample-data.ttl` |
| Docker Config | `docker-compose.yml` |

---

## Documentation Map

| Need | Read |
|------|------|
| Get Started | SETUP.md |
| API Endpoints | API.md |
| System Design | ARCHITECTURE.md |
| Diagrams | VISUAL_GUIDE.md |
| Problems | TROUBLESHOOTING.md |
| Overview | README.md |
| Navigate All | INDEX.md |

---

## Debugging Tips

### Check Backend Logs
```bash
# Terminal where API is running
npm start --prefix api

# Look for errors and server startup message
```

### Check Frontend Logs
```bash
# Press F12 in browser
# Go to Console tab
# Look for network errors
```

### Check Docker Logs
```bash
docker-compose logs fuseki-provider
docker-compose logs edc-provider
```

### Test Services Are Running
```bash
curl http://localhost:5000/health       # API
curl http://localhost:3030/             # Fuseki 1
curl http://localhost:3031/             # Fuseki 2
curl http://localhost:9191/health       # EDC 1
```

---

## Environment Variables

### API Configuration
```bash
PORT=5000                          # API port
EDC_CONNECTOR_URL=http://...      # EDC address
FUSEKI_SERVER_1=http://...        # First Fuseki
FUSEKI_SERVER_2=http://...        # Second Fuseki
```

Set in: `api/.env`

---

## Common Tasks

### Change API Port
Edit `api/server.js`, line with `const PORT`

### Add Custom Query Template
Edit `gui/src/components/QueryBuilder.js`, add to `templates` object

### Load Custom RDF Data
1. Edit `data/sample-data.ttl`
2. Restart Docker: `docker-compose down && docker-compose up -d`
3. OR Upload via Fuseki UI: http://localhost:3030

### Check What Data Is Loaded
```bash
curl "http://localhost:3030/provider-ds/sparql?query=SELECT%20%28COUNT%28*%29%20as%20%3Fcount%29%20WHERE%20%7B%20%3Fs%20%3Fp%20%3Fo%20%7D&format=json"
```

---

## Query Examples by Type

### SELECT (Most Common)
```sparql
SELECT ?var1 ?var2 WHERE { ... }
```

### CONSTRUCT (Build RDF)
```sparql
CONSTRUCT { ?s ?p ?o } WHERE { ... }
```

### ASK (Yes/No)
```sparql
ASK WHERE { ?s a foaf:Person }
```

### DESCRIBE (Get All Info)
```sparql
DESCRIBE ?s WHERE { ?s a foaf:Person LIMIT 1 }
```

---

## Emergency Commands

### Kill Everything & Start Fresh
```bash
docker-compose down -v
pkill -f "npm"
pkill -f "node"
docker-compose up -d
sleep 30
npm start --prefix api &
npm start --prefix gui
```

### Reset Docker
```bash
docker system prune -a --volumes
docker-compose build --no-cache
docker-compose up -d
```

### Clear Node Cache
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## Verification Checklist

- [ ] `docker-compose ps` shows 4 running containers
- [ ] `curl http://localhost:5000/health` returns OK
- [ ] `curl http://localhost:3030/` shows Fuseki page
- [ ] Browser opens to http://localhost:3000 without error
- [ ] Can enter query and click "Execute Query"
- [ ] Results display in table or JSON format
- [ ] No errors in browser console (F12)

---

## Success Indicators

- ✅ Can run `./start.sh` without errors
- ✅ All 4 Docker services running
- ✅ Can access portal at http://localhost:3000
- ✅ Can execute sample SPARQL queries
- ✅ Results display correctly
- ✅ No console errors
- ✅ Can access Fuseki UI
- ✅ Can access EDC endpoints

---

