# Dataspace Query Portal - Complete Documentation Index

## 📚 Documentation Map

### Getting Started
1. **[README.md](README.md)** - Project overview and quick start
2. **[SETUP.md](SETUP.md)** - Detailed installation and configuration instructions
3. **[start.sh](start.sh)** or **[start.bat](start.bat)** - Automated quick start script

### Understanding the System
4. **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design and components
5. **[VISUAL_GUIDE.md](VISUAL_GUIDE.md)** - Diagrams and visual explanations
6. **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - What was created and key features

### Using the System
7. **[API.md](API.md)** - REST API endpoints and examples
8. **[EDC.md](EDC.md)** - Eclipse Dataspace Connector documentation
9. **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions

---

## 🎯 Quick Navigation by Task

### I want to...

#### 📖 Learn what this project does
→ Start with [README.md](README.md)

#### 🚀 Get it running immediately  
→ Follow [SETUP.md](SETUP.md) **OR** run `./start.sh` (Linux/Mac) or `start.bat` (Windows)

#### 🏗️ Understand the architecture
→ Read [ARCHITECTURE.md](ARCHITECTURE.md) + [VISUAL_GUIDE.md](VISUAL_GUIDE.md)

#### 🔌 Use the API
→ Check [API.md](API.md) for all endpoints and examples

#### 🌐 Configure the dataspace connector
→ See [EDC.md](EDC.md)

#### ❌ Fix a problem
→ Browse [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

#### 💡 See what's implemented
→ Review [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

---

## 📋 File Structure Reference

```
Dataspace-Query-Portal/
│
├── 📖 Documentation
│   ├── README.md                  # Project overview
│   ├── SETUP.md                   # Installation guide
│   ├── API.md                     # API documentation
│   ├── ARCHITECTURE.md            # System design
│   ├── EDC.md                     # Connector docs
│   ├── VISUAL_GUIDE.md           # Diagrams & visuals
│   ├── PROJECT_SUMMARY.md        # What was created
│   ├── TROUBLESHOOTING.md        # Problem solutions
│   └── this file (INDEX.md)      # You are here
│
├── 🚀 Quick Start
│   ├── start.sh                  # Linux/Mac starter
│   └── start.bat                 # Windows starter
│
├── 🎨 Frontend (React)
│   └── gui/
│       ├── public/
│       │   └── index.html
│       ├── src/
│       │   ├── App.js            # Main component
│       │   ├── App.css           # Styling
│       │   ├── components/       # React components
│       │   │   ├── QueryBuilder.js
│       │   │   ├── ResultsViewer.js
│       │   │   └── DataSourceManager.js
│       │   ├── styles/           # Component CSS
│       │   │   ├── QueryBuilder.css
│       │   │   ├── ResultsViewer.css
│       │   │   └── DataSourceManager.css
│       │   ├── index.js          # Entry point
│       │   └── index.css         # Global styles
│       └── package.json          # Dependencies
│
├── 🔌 Backend API (Node.js)
│   └── api/
│       ├── server.js             # Express app
│       ├── package.json          # Dependencies
│       └── .env.example          # Config template
│
├── 🌐 EDC Connector
│   └── edc/
│       ├── index.js              # Connector implementation
│       └── package.json          # Dependencies
│
├── 💾 Sample Data
│   └── data/
│       └── sample-data.ttl       # RDF test data
│
├── 🐳 Docker
│   └── docker-compose.yml        # Container setup
│
└── 📚 Configuration
    └── .gitignore                # Git ignore rules
```

---

## 🔄 Development Workflow

### First Time Setup

```
1. git clone <repo>
2. cd Dataspace-Query-Portal
3. Follow SETUP.md
   OR
   Run: ./start.sh (or start.bat)
```

### Daily Development

```
1. docker-compose up -d        # Start containers
2. npm start --prefix api      # Terminal 1
3. npm start --prefix gui      # Terminal 2
4. Open http://localhost:3000
```

### Testing & Debugging

```
1. Use Browser DevTools (F12) for frontend
2. Check API logs in terminal
3. Visit http://localhost:3030 for Fuseki UI
4. Consult TROUBLESHOOTING.md if issues
```

### Modifying Code

```
Frontend changes:
- Edit files in gui/src/
- Changes auto-reload (React dev server)

Backend changes:
- Edit files in api/
- Restart npm start in api terminal

Data changes:
- Edit data/sample-data.ttl
- Upload via Fuseki UI or restart containers
```

---

## 🎓 Learning Paths

### Path 1: Quick Demo (30 minutes)
1. Run `./start.sh` or `start.bat`
2. Open http://localhost:3000
3. Try sample SPARQL queries
4. Explore Results and DataSources tabs

### Path 2: Full Understanding (2-3 hours)
1. Read README.md (overview)
2. Read ARCHITECTURE.md (design)
3. Follow SETUP.md (installation)
4. Review API.md (endpoints)
5. Run and test manually

### Path 3: Complete Mastery (Full day)
1. All of Path 2
2. Study VISUAL_GUIDE.md
3. Review source code in detail
4. Modify sample data
5. Create custom queries
6. Experiment with EDC integration
7. Plan production deployment

### Path 4: For DevOps/SRE
1. Review docker-compose.yml
2. Study ARCHITECTURE.md infrastructure section
3. Plan Kubernetes deployment
4. Set up monitoring
5. Design backup strategy
6. Plan scaling approach

---

## 🔍 Key Concepts Explained

### SPARQL
- **What**: Query language for RDF data
- **Used in**: QueryBuilder, API queries
- **Learn more**: Search "SPARQL tutorial"
- **Example**: `SELECT ?name WHERE { ?person foaf:name ?name }`

### RDF
- **What**: Resource Description Framework - data model for linked data
- **Used in**: Fuseki storage, sample data
- **Learn more**: https://www.w3.org/RDF/
- **Example**: `<ex:person1> <foaf:name> "Alice Johnson"`

### Eclipse Dataspace Connector (EDC)
- **What**: Framework for secure data sharing across organizations
- **Used in**: edc/index.js
- **Learn more**: https://github.com/eclipse-edc/docs
- **Features**: Catalog, contracts, assets, policies

### Fuseki
- **What**: RDF server with SPARQL endpoint
- **Used in**: Docker containers for data storage
- **Learn more**: https://jena.apache.org/documentation/fuseki2/
- **UI**: http://localhost:3030

### Docker Compose
- **What**: Multi-container orchestration
- **Used in**: docker-compose.yml
- **Commands**: up, down, logs, ps, restart

---

## 🛠️ Common Customizations

### Change API Port
Edit `api/server.js`:
```javascript
const PORT = process.env.PORT || 5001;  // Change 5000 to 5001
```

### Change GUI Port
Edit `gui/package.json`:
```json
"scripts": {
  "start": "PORT=3001 react-scripts start"
}
```

### Add Sample Data
Edit `data/sample-data.ttl` and reload Fuseki

### Modify Fuseki Dataset Name
Edit `docker-compose.yml`:
```yaml
curl -X POST http://localhost:3030/$/datasets -d 'dbName=my-dataset&dbType=TDB2'
```

### Change Query Templates
Edit `gui/src/components/QueryBuilder.js`:
```javascript
const templates = {
  'Custom Template': `
    PREFIX ex: <http://example.org/>
    SELECT ?x WHERE { ?x a ex:MyClass }
  `
}
```

---

## 🚨 If Something Goes Wrong

### Step 1: Identify the Issue
- Check browser console (F12)
- Look at terminal logs
- Review TROUBLESHOOTING.md

### Step 2: Try Common Fixes
```bash
# Restart Docker
docker-compose down
docker-compose up -d
sleep 30

# Restart API
pkill -f "node"
npm start --prefix api

# Clear node modules
rm -rf node_modules
npm install
```

### Step 3: Check Status
```bash
# List containers
docker-compose ps

# Check logs
docker-compose logs

# Test endpoints
curl http://localhost:5000/health
curl http://localhost:3030/
```

### Step 4: Reset Everything
```bash
# Complete clean slate
docker-compose down -v
rm -rf api/node_modules gui/node_modules edc/node_modules
npm install --prefix api
npm install --prefix gui
npm install --prefix edc
docker-compose up -d
```

---

## 📞 Getting Help

### Check These Resources (in order)

1. **This file** - You're reading it!
2. **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Most common issues
3. **[SETUP.md](SETUP.md)** - Installation details
4. **[API.md](API.md)** - API usage
5. **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design

### Debug Information to Collect

If asking for help, provide:
```
1. OS and version
2. Docker version: docker --version
3. Node version: node --version
4. Error message (full text)
5. What you were doing when error occurred
6. Relevant log output
```

---

## 📈 Next Steps After Getting It Running

1. **Explore the UI** - Try different queries
2. **Read the API docs** - Understand endpoints
3. **Study the code** - How it works
4. **Modify sample data** - Add your own RDF
5. **Create custom queries** - Test your use case
6. **Plan production** - Think about deployment
7. **Add features** - Extend functionality

---

## 🎯 Version Information

- **Project Version**: 1.0.0
- **Created**: January 2026
- **Status**: Ready for Development & Testing
- **Technologies**: React 18, Node.js 18+, Docker, Apache Jena
- **License**: MIT

---

## 📝 Document Maintenance

| Document | Last Updated | Maintainer |
|----------|--------------|-----------|
| README.md | Jan 2026 | Initial |
| SETUP.md | Jan 2026 | Initial |
| API.md | Jan 2026 | Initial |
| ARCHITECTURE.md | Jan 2026 | Initial |
| TROUBLESHOOTING.md | Jan 2026 | Initial |
| VISUAL_GUIDE.md | Jan 2026 | Initial |
| PROJECT_SUMMARY.md | Jan 2026 | Initial |

---

## 🌟 Credits

- **React** - Frontend framework
- **Express.js** - Backend framework
- **Apache Jena** - RDF processing
- **Eclipse EDC** - Dataspace connector
- **Docker** - Containerization

---

**Total Documentation**: 8 guides + this index
**Total Pages**: ~100+ pages of documentation
**Total Lines of Code**: 2000+ lines

---

**Ready to get started?** → Go to [SETUP.md](SETUP.md)

**Want to understand the system?** → Go to [ARCHITECTURE.md](ARCHITECTURE.md)

**Need help?** → Go to [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
