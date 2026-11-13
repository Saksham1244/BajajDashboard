@echo off
TITLE Bajaj PPMS - Windows Service Installer
COLOR 0A

:: 1. Self-elevate to Administrator if not already elevated
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ====================================================================
    echo   Administrator privileges required to register a Windows Service.
    echo   Requesting Administrator elevation...
    echo ====================================================================
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"

echo ====================================================================
echo        BAJAJ AUTO PANTNAGAR PLANT - PPMS COMMAND CENTER
echo               Windows Service Installation
echo ====================================================================
echo.

:: 2. Build production frontend bundle
echo [1/3] Building production frontend bundle (client/dist)...
cd /d "%~dp0client"
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend build failed! Aborting service installation.
    pause
    exit /b 1
)

:: 3. Stop any existing instances on port 5000
echo.
echo [2/3] Checking port 5000...
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0service\cleanup_ports.ps1"

:: 4. Register and Start Windows Service
echo.
echo [3/3] Registering BajajPPMS as an automatic Windows Service...
cd /d "%~dp0server"
node "%~dp0service\install_service.js"

echo.
echo ====================================================================
echo  Service Installation Complete!
echo.
echo  - Service Name:  BajajPPMS
echo  - Display Name:  Bajaj PPMS Command Center
echo  - Startup Type:  Automatic (starts on system boot)
echo  - Dashboard URL: http://localhost:5000
echo.
echo  To check status anytime: service_status.bat
echo  To uninstall anytime:    service_uninstall.bat
echo ====================================================================
echo.
pause
