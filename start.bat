@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting Dataspace Query Portal...
echo.

REM Check prerequisites
echo Checking prerequisites...

REM Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js 18+
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js %NODE_VERSION%

REM Check Docker
where docker >nul 2>nul
if errorlevel 1 (
    echo ❌ Docker not found. Please install Docker
    exit /b 1
)
echo ✓ Docker installed

echo.
echo Installing dependencies...

REM Install API dependencies
echo Installing API dependencies...
cd api
call npm install
cd ..

REM Install GUI dependencies
echo Installing GUI dependencies...
cd gui
call npm install
cd ..

REM Install EDC dependencies
echo Installing EDC dependencies...
cd edc
call npm install
cd ..

echo.
echo Starting Docker services...
call docker-compose up -d

echo.
echo Waiting for services to be ready...
timeout /t 15 /nobreak

echo.
echo ✅ All services started!
echo.
echo 📝 Available services:
echo   - Fuseki Provider: http://localhost:3030
echo   - Fuseki Consumer: http://localhost:3031
echo   - EDC Provider: http://localhost:9191
echo   - EDC Consumer: http://localhost:9192
echo.
echo Starting Backend API...
start "API Server" cmd /k "cd api && npm start"

echo.
echo Starting Frontend GUI...
start "GUI Portal" cmd /k "cd gui && npm start"

echo.
echo ✅ Portal started!
echo.
echo 🌐 Open http://localhost:3000 in your browser
echo.
echo Close this window or press Ctrl+C to stop all services

REM Keep window open
pause
