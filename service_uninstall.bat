@echo off
TITLE Bajaj PPMS - Windows Service Uninstaller
COLOR 0C

:: Self-elevate to Administrator
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ====================================================================
    echo   Administrator privileges required to remove a Windows Service.
    echo   Requesting Administrator elevation...
    echo ====================================================================
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"

echo ====================================================================
echo        BAJAJ AUTO PANTNAGAR PLANT - PPMS COMMAND CENTER
echo               Windows Service Uninstaller
echo ====================================================================
echo.

cd /d "%~dp0server"
node "%~dp0service\uninstall_service.js"

echo.
echo ====================================================================
echo  Service Uninstallation Complete!
echo ====================================================================
echo.
pause
