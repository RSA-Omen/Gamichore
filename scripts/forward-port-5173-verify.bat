@echo off
REM Check if port 5173 forwarding is active. No admin needed.
echo Port proxy (should show 0.0.0.0 5173 -^> 127.0.0.1 5173):
netsh interface portproxy show all
echo.
echo Firewall rules for port 5173:
netsh advfirewall firewall show rule name="Vite dev 5173"
echo.
echo Is anything listening on 5173? (run from PowerShell as Admin: Get-NetTCPConnection -LocalPort 5173)
pause
