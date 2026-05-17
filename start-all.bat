@echo off
setlocal

:: Get the directory of this bat file (project root)
set "ROOT=%~dp0"

echo ================================================
echo  Distributed Online Voting System - Starting...
echo ================================================
echo.
echo  Services:
echo    Auth Service    → port 5001
echo    Election Service → port 5002
echo    Voting Service  → port 5003
echo    API Gateway     → port 5000
echo.

echo [1/4] Starting Auth Service (port 5001)...
start "Auth Service - port 5001" /D "%ROOT%auth-service" cmd /k "npm start"
timeout /t 3 /nobreak >nul

echo [2/4] Starting Election Service (port 5002)...
start "Election Service - port 5002" /D "%ROOT%election-service" cmd /k "npm start"
timeout /t 3 /nobreak >nul

echo [3/4] Starting Voting Service (port 5003)...
start "Voting Service - port 5003" /D "%ROOT%voting-service" cmd /k "npm start"
timeout /t 3 /nobreak >nul

echo [4/4] Starting API Gateway (port 5000)...
start "API Gateway - port 5000" /D "%ROOT%gateway" cmd /k "npm start"
timeout /t 3 /nobreak >nul

echo.
echo ================================================
echo  All 4 services launched in separate windows!
echo ================================================
echo.
echo  API Gateway    : http://localhost:5000
echo  Auth Service   : http://localhost:5001
echo  Election Svc   : http://localhost:5002
echo  Voting Svc     : http://localhost:5003
echo.
echo  Wait for each window to show "Running on port..."
echo  Then start the frontend: cd frontend ^&^& npm start
echo.
echo  NOTE: The old backend/ folder is decommissioned.
echo        Do NOT run backend/server.js — it will conflict
echo        with the gateway on port 5000.
echo.
pause
endlocal
