@echo off
cd /d "%~dp0"

echo ================================================
echo  Distributed Online Voting System - Starting...
echo ================================================
echo.

echo [1/5] Starting Auth Service (port 5001)...
start "Auth Service - port 5001" /D "%~dp0auth-service" cmd /k "npm start"
timeout /t 3 /nobreak >nul

echo [2/5] Starting Election Service (port 5002)...
start "Election Service - port 5002" /D "%~dp0election-service" cmd /k "npm start"
timeout /t 3 /nobreak >nul

echo [3/5] Starting Voting Service (port 5003)...
start "Voting Service - port 5003" /D "%~dp0voting-service" cmd /k "npm start"
timeout /t 3 /nobreak >nul

echo [4/5] Starting API Gateway (port 5000)...
start "API Gateway - port 5000" /D "%~dp0gateway" cmd /k "npm start"
timeout /t 3 /nobreak >nul

echo [5/5] Starting Frontend (port 3000)...
start "Frontend - port 3000" /D "%~dp0frontend" cmd /k "npm start"

echo.
echo ================================================
echo  All 5 services launched in separate windows!
echo ================================================
echo.
echo   Frontend       : http://localhost:3000
echo   API Gateway    : http://localhost:5000
echo   Auth Service   : http://localhost:5001
echo   Election Svc   : http://localhost:5002
echo   Voting Svc     : http://localhost:5003
echo.
echo  Wait for each window to show "Running on port..."
echo  Then open: http://localhost:3000
echo.
pause
