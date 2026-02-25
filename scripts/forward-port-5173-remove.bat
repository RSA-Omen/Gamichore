@echo off
REM Run as Administrator. Removes the port 5173 forwarding and firewall rule.
echo Removing port proxy...
netsh interface portproxy delete v4tov4 listenport=5173 listenaddress=0.0.0.0
echo Removing firewall rule...
netsh advfirewall firewall delete rule name="Vite dev 5173"
echo Done.
pause
