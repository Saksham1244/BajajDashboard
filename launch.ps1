# Bajaj PPMS PowerShell Launcher
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "       BAJAJ AUTO PANTNAGAR PLANT - PPMS COMMAND CENTER" -ForegroundColor Cyan
Write-Host "              Development Server Launcher (PowerShell)" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Clean existing rogue processes on ports 5000 and 5173
Write-Host "[1/3] Checking ports 5000 and 5173..." -ForegroundColor Yellow
$pids = (netstat -ano | findstr ':5000 :5173') | ForEach-Object { ($_ -split '\s+')[-1] } | Sort-Object -Unique
foreach ($p in $pids) {
    if ($p -and $p -ne '0') {
        $proc = Get-Process -Id $p -ErrorAction SilentlyContinue
        if ($proc -and $proc.Name -eq 'node') {
            Write-Host "  Closing old process PID $p" -ForegroundColor Gray
            Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
        }
    }
}

# 2. Launch Backend
Write-Host "[2/3] Starting Backend Server (Port 5000)..." -ForegroundColor Green
Start-Process cmd.exe -ArgumentList "/k cd /d `"$root\server`" && npm start"

# 3. Launch Frontend
Write-Host "[3/3] Starting Frontend Client Dev Server (Port 5173)..." -ForegroundColor Green
Start-Process cmd.exe -ArgumentList "/k cd /d `"$root\client`" && npm run dev"

Write-Host "Waiting 4 seconds while servers initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 4

# 4. Open default browser
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host " Servers are running in background console windows!" -ForegroundColor Green
Write-Host " - Frontend: http://localhost:5173" -ForegroundColor White
Write-Host " - Backend:  http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host " To stop both servers anytime, run: stop.bat or stop.ps1" -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Cyan
