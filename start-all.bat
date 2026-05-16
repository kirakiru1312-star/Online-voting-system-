@echo off
:: Launch the PowerShell startup script with execution policy bypass
PowerShell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-all.ps1"
