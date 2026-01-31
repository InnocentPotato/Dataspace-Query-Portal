# Troubleshooting Guide

## Common Issues & Solutions

### Services Not Starting

**Symptom:** Docker containers fail to start or health checks fail.

**Solutions:**
```bash
# Check Docker is running
docker ps

# View detailed logs
docker-compose logs

# Full restart with clean state
docker-compose down -v
docker-compose up
```

**Common Causes:**
- Docker daemon not running
- Insufficient disk space or memory
- Old volume data corrupted
- System resources exhausted

---

### API Container Fails to Start

**Symptom:** API container exits immediately or fails health check.

**Solutions:**
```bash
# Check logs
docker-compose logs api

# Verify Fuseki containers are healthy
docker-compose ps

# Rebuild the API image
docker-compose up --build api
```

**Causes:**
- Fuseki not ready when API starts
- Environment variables misconfigured
- Port 5000 already in use on host

---

### GUI Not Loading

**Symptom:** Port 3000 opens blank page or cannot reach http://localhost:3000

**Solutions:**
```bash
# Check GUI container health
docker-compose logs gui

# Verify Nginx is running
curl http://localhost:3000/

# Rebuild GUI container
docker-compose up --build gui
```

**Causes:**
- React build failed during container creation
- Port 3000 already in use
- Insufficient memory for build process

---

### API Cannot Connect to Fuseki

**Symptom:** API returns connection timeout or ECONNREFUSED errors.

**Solutions:**
```bash
# Verify Fuseki is running and healthy
docker-compose ps

# Check Fuseki logs
docker-compose logs fuseki-provider

# Test Fuseki directly
curl http://localhost:3030/

# Full restart
docker-compose down -v
docker-compose up
```

**Causes:**
- Fuseki not fully initialized when API starts
- Container network misconfiguration
- Fuseki port 3030 already in use

---

### Port Already in Use

**Symptom:** "Address already in use" or "Port already allocated" error
````

**Solutions:**

**Windows:**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use fuser
fuser -k 3000/tcp
```

**Or change port:**
```bash
# For GUI
PORT=3001 npm start --prefix gui

# For API
PORT=5001 npm start --prefix api
```

---

### Data Not Loading in Fuseki

**Symptom:** SPARQL queries return no results

**Solutions:**

1. **Manual upload to Fuseki UI:**
   - Open http://localhost:3030
   - Click "Upload"
   - Select `data/sample-data.ttl`
   - Choose dataset `provider-ds`
   - Upload

2. **Use Docker volume:**
   ```bash
   docker cp data/sample-data.ttl fuseki-provider:/staging/
   ```

3. **Verify data loaded:**
   ```bash
   curl "http://localhost:3030/provider-ds/sparql?query=SELECT%20%28COUNT%28*%29%20as%20%3Fcount%29%20WHERE%20%7B%20%3Fs%20%3Fp%20%3Fo%20%7D"
   ```

---

### Query Returns No Results

**Symptom:** SPARQL query executes but returns empty results

**Troubleshooting:**

1. **Check if data is loaded:**
   ```sparql
   SELECT (COUNT(*) as ?count) WHERE { ?s ?p ?o }
   ```

2. **Use simpler query:**
   ```sparql
   SELECT * WHERE { ?s ?p ?o } LIMIT 1
   ```

3. **Check syntax:**
   - Use Fuseki UI directly at http://localhost:3030
   - Test query there first

4. **Verify prefixes:**
   ```sparql
   PREFIX foaf: <http://xmlns.com/foaf/0.1/>
   PREFIX ex: <http://example.org/>
   
   SELECT * WHERE { 
     ?s a foaf:Person 
   } LIMIT 10
   ```

---

### Memory Issues

**Symptom:** Containers stop, "out of memory" errors

**Solutions:**

**Increase Docker memory:**
```bash
# Docker Desktop settings
# Preferences > Resources > Memory: 4GB+

# Or in docker-compose.yml
services:
  fuseki-provider:
    mem_limit: 2g
    memswap_limit: 2g
```

**Increase Node memory:**
```bash
# For API
NODE_OPTIONS="--max-old-space-size=4096" npm start --prefix api

# For GUI dev server
NODE_OPTIONS="--max-old-space-size=2048" npm start --prefix gui
```

---

### Network Issues (Docker)

**Symptom:** Containers can't reach each other

**Solutions:**

```bash
# Check network
docker network ls
docker network inspect dataspace-network

# Verify all containers connected
docker-compose ps

# Test internal connectivity
docker-compose exec api curl http://fuseki-provider:3030/

# Use full container names with port
# fuseki-provider:3030 (not localhost:3030 from other containers)
```

---

### Dependencies Installation Fails

**Symptom:** npm install errors, missing packages

**Solutions:**

```bash
# Clear npm cache
npm cache clean --force

# Remove package-lock.json and node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Check Node version (need 18+)
node --version

# Update npm
npm install -g npm@latest
```

---

### React Build Errors

**Symptom:** GUI build fails, compile errors

**Solutions:**

```bash
# Check Node/npm versions
node --version  # Should be 18+
npm --version

# Clear build cache
rm -rf gui/build node_modules

# Reinstall dependencies
cd gui
npm install

# Try building
npm run build

# If still fails, check for ESLint issues
npm start
```

---

### SPARQL Syntax Errors

**Symptom:** API returns "Syntax error" in SPARQL

**Common mistakes:**

```sparql
# ❌ Wrong - missing PREFIX
SELECT ?x WHERE { ?x foaf:name "test" }

# ✅ Correct - with PREFIX
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
SELECT ?x WHERE { ?x foaf:name "test" }

# ❌ Wrong - missing dot
SELECT ?x WHERE { ?x a foaf:Person }

# ✅ Correct - with dot
SELECT ?x WHERE { ?x a foaf:Person . }

# ❌ Wrong - LIMIT not number
SELECT ?x WHERE { ?x a foaf:Person } LIMIT abc

# ✅ Correct - LIMIT is number
SELECT ?x WHERE { ?x a foaf:Person } LIMIT 10
```

**Solution:**
- Test query in Fuseki Web UI first
- Use SPARQL validator online
- Check RDF prefix definitions

---

### Performance Issues

**Symptom:** Queries are slow, timeouts

**Solutions:**

```bash
# Check current query limit
# Default is 30 seconds in api/server.js

# Modify timeout
const response = await axios.get(fuseki_url, {
  params: { ... },
  timeout: 60000  // 60 seconds
});

# Add LIMIT to queries
SELECT ?s WHERE { ?s a foaf:Person } LIMIT 1000

# Check Fuseki performance
# Monitor at http://localhost:3030/admin/

# Check network performance
# Use browser DevTools Network tab
```

**Optimization:**
- Add indexes to Fuseki
- Use named graphs
- Optimize SPARQL queries
- Consider caching results

---

### EDC Connector Issues

**Symptom:** Cannot connect to EDC, catalog empty

**Solutions:**

```bash
# Check if EDC is running
curl http://localhost:9191/health

# View EDC logs
docker-compose logs edc-provider

# Test catalog
curl http://localhost:9191/catalog/datasets

# Verify EDC environment
# Check docker-compose.yml for environment variables

# Restart EDC
docker-compose restart edc-provider edc-consumer
```

---

### Git Issues

**Symptom:** Cannot clone or push changes

**Solutions:**

```bash
# If repo doesn't exist yet
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <url>
git push -u origin main

# If permission denied
# Check SSH key or use HTTPS instead
git remote set-url origin https://github.com/user/repo.git
```

---

### Docker-Compose Issues

**Symptom:** docker-compose command not found

**Solutions:**

**Windows/Mac:**
```bash
# Use Docker Desktop (includes docker-compose)
# Or install separately:
brew install docker-compose  # Mac
choco install docker-compose  # Windows
```

**Linux:**
```bash
sudo apt-get install docker-compose
# Or
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

---

### Database Corruption

**Symptom:** Fuseki starts but no data accessible

**Solutions:**

```bash
# Remove corrupted volumes
docker-compose down -v

# Clean everything
docker system prune -a

# Restart fresh
docker-compose up -d

# Verify data loads
sleep 30
curl http://localhost:3030/$/datasets
```

---

### Log Analysis

**View Logs:**
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs fuseki-provider

# Follow logs (real-time)
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# API logs
npm start --prefix api 2>&1 | tee api.log

# Browser console
# Press F12 > Console tab
```

---

### Reset Everything

**Complete clean restart:**
```bash
# Stop all services
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Kill any remaining processes
pkill -f "node"
pkill -f "npm"

# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf api/node_modules gui/node_modules edc/node_modules

# Start fresh
./start.sh  # or start.bat on Windows
```

---

### Getting Help

If issue persists:

1. **Check logs** - Look for error messages
2. **Verify prerequisites** - Node, Docker, ports
3. **Try clean restart** - Remove volumes and rebuild
4. **Check documentation** - See SETUP.md, API.md
5. **Review SPARQL** - Use Fuseki UI to test queries
6. **Check network** - Ensure services can reach each other

---

## Debug Mode

Enable verbose logging:

```bash
# API debug
DEBUG=* npm start --prefix api

# GUI debug
REACT_APP_DEBUG=true npm start --prefix gui

# Docker debug
docker-compose -f docker-compose.yml config
```

---

## Useful Commands

```bash
# Check all ports in use
lsof -i -P -n  # Mac/Linux
netstat -ano   # Windows

# Get Docker container IP
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' container_name

# Execute command in container
docker-compose exec api npm list

# View container resource usage
docker stats

# Prune unused resources
docker system prune

# Reset Docker
docker system prune -a --volumes
```

---

**Last Updated**: January 2026
**Version**: 1.0.0
