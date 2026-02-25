@echo off
REM Run as Administrator (right-click - Run as administrator).
REM Forwards port 5173 so phone at http://192.168.88.254:5173 reaches WSL dev server.
REM Uses WSL IP (172.20.60.56) - same as your other proxies. If WSL IP changes after reboot, re-run remove then this.

set WSL_IP=172.20.60.56

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Run this script as Administrator: right-click forward-port-5173.bat - Run as administrator
    pause
    exit /b 1
)

echo Removing existing 5173 proxy if any...
netsh interface portproxy delete v4tov4 listenport=5173 listenaddress=0.0.0.0

echo Adding port proxy 0.0.0.0:5173 -^> %WSL_IP%:5173 ...
netsh interface portproxy add v4tov4 listenport=5173 listenaddress=0.0.0.0 connectport=5173 connectaddress=%WSL_IP%
if %errorLevel% neq 0 (
    echo Failed. Is WSL running? Try: wsl -e hostname
)

echo Adding firewall rule...
netsh advfirewall firewall add rule name="Vite dev 5173" dir=in action=allow protocol=TCP localport=5173
if %errorLevel% neq 0 (
    echo Firewall rule may already exist.
)

echo.
echo Current port proxy:
netsh interface portproxy show all
echo.
echo On your phone open: http://192.168.88.254:5173
echo Make sure the dev server is running in WSL (bash dev-wsl.sh).
pause
