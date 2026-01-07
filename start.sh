#!/bin/bash

echo "🚀 Starting Dataspace Query Portal..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "${YELLOW}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
echo "${GREEN}✓ Node.js $(node --version)${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "${RED}❌ Docker not found. Please install Docker${NC}"
    exit 1
fi
echo "${GREEN}✓ Docker installed${NC}"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "${RED}❌ Docker Compose not found. Please install Docker Compose${NC}"
    exit 1
fi
echo "${GREEN}✓ Docker Compose installed${NC}"

echo ""
echo "${YELLOW}Installing dependencies...${NC}"

# Install API dependencies
echo "Installing API dependencies..."
cd api
npm install
cd ..

# Install GUI dependencies  
echo "Installing GUI dependencies..."
cd gui
npm install
cd ..

# Install EDC dependencies
echo "Installing EDC dependencies..."
cd edc
npm install
cd ..

echo ""
echo "${YELLOW}Starting Docker services...${NC}"
docker-compose up -d

echo ""
echo "${YELLOW}Waiting for services to be ready...${NC}"
sleep 15

# Check if services are running
if docker-compose ps | grep -q "fuseki-provider"; then
    echo "${GREEN}✓ Fuseki servers running${NC}"
else
    echo "${RED}❌ Fuseki servers failed to start${NC}"
    exit 1
fi

echo ""
echo "${GREEN}✅ All services started!${NC}"
echo ""
echo "📝 Available services:"
echo "  - Fuseki Provider: http://localhost:3030"
echo "  - Fuseki Consumer: http://localhost:3031"
echo "  - EDC Provider: http://localhost:9191"
echo "  - EDC Consumer: http://localhost:9192"
echo ""
echo "${YELLOW}Starting Backend API...${NC}"
cd api
npm start &
API_PID=$!

echo ""
echo "${YELLOW}Starting Frontend GUI...${NC}"
cd ../gui
npm start &
GUI_PID=$!

echo ""
echo "${GREEN}✅ Portal started!${NC}"
echo ""
echo "🌐 Open http://localhost:3000 in your browser"
echo ""
echo "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Handle termination
trap "kill $API_PID $GUI_PID 2>/dev/null; docker-compose down" EXIT INT

wait
