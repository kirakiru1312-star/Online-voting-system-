@echo off
echo Starting Distributed Online Voting System...
echo.

echo [1/4] Starting Auth Service (port 5001)...
start "Auth Service" cmd /k "cd auth-service && npm start"
timeout /t 2 /nobreak >nul

echo [2/4] Starting Election Service (port 5002)...
start "Election Service" cmd /k "cd election-service && npm start"
timeout /t 2 /nobreak >nul

echo [3/4] Starting Voting Service (port 5003)...
start "Voting Service" cmd /k "cd voting-service && npm start"
timeout /t 2 /nobreak >nul

echo [4/4] Starting API Gateway (port 5000)...
start "API Gateway" cmd /k "cd gateway && npm start"

echo.
echo All services started!
echo   API Gateway   : http://localhost:5000
echo   Auth Service  : http://localhost:5001
echo   Election Svc  : http://localhost:5002
echo   Voting Svc    : http://localhost:5003
echo.
pause
