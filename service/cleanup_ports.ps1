$pids = (netstat -ano | findstr ':5000 :5173 :5174 :5175') | ForEach-Object { ($_ -split '\s+')[-1] } | Sort-Object -Unique
$stopped = 0
foreach ($p in $pids) {
    if ($p -and $p -ne '0') {
        $proc = Get-Process -Id $p -ErrorAction SilentlyContinue
        if ($proc -and $proc.Name -eq 'node') {
            Write-Host "Stopping node process PID $p ($($proc.ProcessName))..." -ForegroundColor Yellow
            Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
            $stopped++
        }
    }
}
if ($stopped -eq 0) {
    Write-Host "No conflicting node processes found on dashboard ports." -ForegroundColor Gray
} else {
    Write-Host "Cleaned up $stopped stale process(es)." -ForegroundColor Green
}
