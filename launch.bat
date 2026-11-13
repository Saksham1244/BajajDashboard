@echo off
TITLE Bajaj PPMS Launcher
COLOR 0B
echo ====================================================================
echo        BAJAJ AUTO PANTNAGAR PLANT - PPMS COMMAND CENTER
echo               Development Server Launcher
echo ====================================================================
echo.

cd /d "%~dp0"

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js (v18+) to run the dashboard.
    pause
    exit /b 1
)

:: 2. Terminate any previous rogue processes holding port 5000 or 5173
echo [1/3] Checking ports 5000 and 5173...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0service\cleanup_ports.ps1"

:: 3. Launch Backend in new window
echo [2/3] Starting Backend Server (Port 5000)...
start "Bajaj PPMS - Backend Server (:5000)" cmd /k "cd /d \"%~dp0server\" && npm start"

:: 4. Launch Frontend in new window
echo [3/3] Starting Frontend Client Dev Server (:5173)...
start "Bajaj PPMS - Frontend Client (:5173)" cmd /k "cd /d \"%~dp0client\" && npm run dev"

echo.
echo Waiting 4 seconds while servers initialize...
powershell -Command "Start-Sleep -Seconds 4"

:: 5. Open browser
echo Opening Bajaj PPMS Command Center in your browser...
start http://localhost:5173

echo.
echo ====================================================================
echo  Servers are running in background console windows!
echo  - Frontend: http://localhost:5173 (Development Hot-Reload)
echo  - Backend:  http://localhost:5000
echo.
echo  To stop both servers anytime, simply run: stop.bat
echo ====================================================================
echo.
pause
