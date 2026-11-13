$svc = Get-Service -Name BajajPPMS -ErrorAction SilentlyContinue
if ($svc) {
    $statusColor = if ($svc.Status -eq 'Running') { 'Green' } else { 'Yellow' }
    Write-Host "[Service Registered]" -ForegroundColor Green
    Write-Host "Status:       $($svc.Status)" -ForegroundColor $statusColor
    Write-Host "StartType:    $($svc.StartType)"
    Write-Host "DisplayName:  $($svc.DisplayName)"
    Write-Host ""
    Write-Host "Checking port 5000 listener:" -ForegroundColor Cyan
    $listening = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue
    if ($listening) {
        Write-Host "  Port 5000 is LISTENING (PID: $($listening.OwningProcess))" -ForegroundColor Green
        Write-Host "  Dashboard is accessible at: http://localhost:5000" -ForegroundColor Cyan
    } else {
        Write-Host "  Port 5000 is not currently listening." -ForegroundColor Yellow
    }
} else {
    Write-Host "[Service NOT Registered]" -ForegroundColor Red
    Write-Host "The 'BajajPPMS' Windows service is not currently installed."
    Write-Host "To install it as an automatic Windows Service, right-click and run:"
    Write-Host "  service_install.bat (Run as Administrator)" -ForegroundColor Yellow
}
