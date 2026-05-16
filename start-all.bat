@echo off
:: Change to the directory where this bat file lives (the project root)
cd /d "%~dp0"

echo ================================================
echo  Distributed Online Voting System - Starting...
echo ================================================
echo.

echo [1/4] Starting Auth Service (port 5001)...
start "Auth Service - port 5001" cmd /k "cd /d "%~dp0auth-service" && npm start"
timeout /t 3 /nobreak >nul

echo [2/4] Starting Election Service (port 5002)...
start "Election Service - port 5002" cmd /k "cd /d "%~dp0election-service" && npm start"
timeout /t 3 /nobreak >nul

echo [3/4] Starting Voting Service (port 5003)...
start "Voting Service - port 5003" cmd /k "cd /d "%~dp0voting-service" && npm start"
timeout /t 3 /nobreak >nul

echo [4/4] Starting API Gateway (port 5000)...
start "API Gateway - port 5000" cmd /k "cd /d "%~dp0gateway" && npm start"
timeout /t 3 /nobreak >nul

echo.
echo ================================================
echo  All 4 services are starting in new windows!
echo ================================================
echo.
echo   API Gateway    : http://localhost:5000
echo   Auth Service   : http://localhost:5001
echo   Election Svc   : http://localhost:5002
echo   Voting Svc     : http://localhost:5003
echo.
echo  Wait for all windows to show "Running on port..."
echo  Then start the frontend: cd frontend and npm start
echo.
pause
