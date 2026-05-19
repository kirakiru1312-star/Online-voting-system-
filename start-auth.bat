@echo off
cd /d "%~dp0auth-service"
echo Starting Auth Service on port 5001...
npm start
pause
