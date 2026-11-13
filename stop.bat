@echo off
TITLE Stop Bajaj PPMS Servers
COLOR 0C
echo ====================================================================
echo        Stopping Bajaj PPMS Command Center Servers...
echo ====================================================================
echo.

cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0service\cleanup_ports.ps1"

echo.
echo ====================================================================
echo  All dashboard dev servers stopped.
echo ====================================================================
powershell -Command "Start-Sleep -Seconds 2"
