@echo off
TITLE VERITAS AI - Research Platform Launcher
COLOR 0B

echo ===============================================================================
echo                           VERITAS AI RESEARCH PLATFORM
echo     Explainable and Robust ML Framework for Fake Review & AI Detection
echo ===============================================================================
echo.

:: Check Python installation
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not found in PATH! Please install Python 3.11+ and try again.
    pause
    exit /b 1
)

:: Check Node.js installation
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not found in PATH! Please install Node.js v18+ and try again.
    pause
    exit /b 1
)

echo [1/3] Initializing SQLite database and verifying model artifacts...
python -m backend.app.database.init_db
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Database initialization encountered a notice. Continuing...
)

echo.
echo [2/3] Launching FastAPI Backend Server on http://127.0.0.1:8000...
start "VERITAS AI - Backend API" cmd /k "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [3/3] Launching React + Vite Frontend Dashboard on http://localhost:5173...
start "VERITAS AI - Frontend UI" cmd /k "cd frontend && npm run dev"

echo.
echo ===============================================================================
echo                       SERVICES LAUNCHED SUCCESSFULLY
echo ===============================================================================
echo  - Frontend Dashboard:   http://localhost:5173
echo  - Backend API:          http://127.0.0.1:8000
echo  - Swagger API Docs:     http://127.0.0.1:8000/api/v1/docs
echo  - Health Endpoint:      http://127.0.0.1:8000/api/v1/health
echo ===============================================================================
echo.
echo Opening VERITAS AI in your default web browser in 4 seconds...
timeout /t 4 >nul
start http://localhost:5173

echo.
echo Both services are running in background console windows.
echo To stop VERITAS AI, close both opened console windows.
echo.
pause
