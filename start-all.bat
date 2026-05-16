@echo off
setlocal

:: Get the absolute path of the project root (where this bat file lives)
set "ROOT=%~dp0"

echo ================================================
echo  Distributed Online Voting System - Starting...
echo ================================================
echo.

:: ── 1. Auth Service (port 5001) ──────────────────
echo [1/4] Starting Auth Service on port 5001...
start "Auth Service - port 5001" cmd /c "cd /d "%ROOT%auth-service" && node server.js & pause"
timeout /t 4 /nobreak >nul

:: ── 2. Election Service (port 5002) ──────────────
echo [2/4] Starting Election Service on port 5002...
start "Election Service - port 5002" cmd /c "cd /d "%ROOT%election-service" && node server.js & pause"
timeout /t 4 /nobreak >nul

:: ── 3. Voting Service (port 5003) ────────────────
echo [3/4] Starting Voting Service on port 5003...
start "Voting Service - port 5003" cmd /c "cd /d "%ROOT%voting-service" && node server.js & pause"
timeout /t 4 /nobreak >nul

:: ── 4. API Gateway (port 5000) ───────────────────
echo [4/4] Starting API Gateway on port 5000...
start "API Gateway - port 5000" cmd /c "cd /d "%ROOT%gateway" && node server.js & pause"
timeout /t 4 /nobreak >nul

echo.
echo ================================================
echo  All 4 services are now running!
echo ================================================
echo.
echo  API Gateway    : http://localhost:5000
echo  Auth Service   : http://localhost:5001
echo  Election Svc   : http://localhost:5002
echo  Voting Svc     : http://localhost:5003
echo.
echo  Now start the frontend:
echo  cd frontend
echo  npm start
echo.
pause
endlocal
