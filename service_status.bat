@echo off
TITLE Bajaj PPMS - Service Status
COLOR 0E
echo ====================================================================
echo        Checking Bajaj PPMS Windows Service Status...
echo ====================================================================
echo.

cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0service\check_status.ps1"

echo.
echo ====================================================================
echo.
pause
