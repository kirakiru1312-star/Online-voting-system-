# Distributed Online Voting System - Start All Services
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "================================================" -ForegroundColor Cyan
Write-Host " Distributed Online Voting System - Starting..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Auth Service
Write-Host "[1/4] Starting Auth Service on port 5001..." -ForegroundColor Yellow
Start-Process "cmd.exe" -ArgumentList "/k cd /d `"$ROOT\auth-service`" && node server.js" -WindowStyle Normal
Start-Sleep -Seconds 3

# 2. Election Service
Write-Host "[2/4] Starting Election Service on port 5002..." -ForegroundColor Yellow
Start-Process "cmd.exe" -ArgumentList "/k cd /d `"$ROOT\election-service`" && node server.js" -WindowStyle Normal
Start-Sleep -Seconds 3

# 3. Voting Service
Write-Host "[3/4] Starting Voting Service on port 5003..." -ForegroundColor Yellow
Start-Process "cmd.exe" -ArgumentList "/k cd /d `"$ROOT\voting-service`" && node server.js" -WindowStyle Normal
Start-Sleep -Seconds 3

# 4. API Gateway
Write-Host "[4/4] Starting API Gateway on port 5000..." -ForegroundColor Yellow
Start-Process "cmd.exe" -ArgumentList "/k cd /d `"$ROOT\gateway`" && node server.js" -WindowStyle Normal
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host " All 4 services launched!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host " API Gateway    : http://localhost:5000" -ForegroundColor White
Write-Host " Auth Service   : http://localhost:5001" -ForegroundColor White
Write-Host " Election Svc   : http://localhost:5002" -ForegroundColor White
Write-Host " Voting Svc     : http://localhost:5003" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
