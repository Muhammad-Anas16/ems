@echo off
setlocal EnableExtensions
title EMS Firewall Rule

net session >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Is file par Right-click karein aur "Run as administrator" chunein.
    pause
    exit /b 1
)

set PORT=3000
netsh advfirewall firewall delete rule name="EMS Server" >nul 2>&1
netsh advfirewall firewall add rule name="EMS Server" dir=in action=allow protocol=TCP localport=%PORT% profile=private,domain

echo.
echo Port %PORT% LAN ke liye khul gaya. Ab dusre PC se http://<is-PC-ka-IP>:%PORT%/ khol sakte hain.
pause
