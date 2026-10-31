@echo off
setlocal EnableExtensions
title EMS Server
cd /d "%~dp0"

if not exist "server.js" (
    echo [ERROR] server.js nahi mili.
    echo Yeh file "server" folder ke andar, server.js ke saath rakhein.
    pause
    exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is PC par installed nahi hai.
    echo Node.js LTS install karein, phir yeh file dobara chalayein.
    start "" https://nodejs.org/en/download
    pause
    exit /b 1
)

if not defined PORT set PORT=3000

if not exist "node_modules\express" (
    echo Dependencies install ho rahi hain, internet zaroori hai...
    call npm install --omit=dev
    if errorlevel 1 (
        echo [ERROR] npm install fail ho gaya.
        pause
        exit /b 1
    )
)

echo.
echo ===== EMS Server start ho raha hai (port %PORT%) =====
echo Band karne ke liye is window me Ctrl+C dabayein.
echo.

rem 4 second baad browser khol do
start "" /min cmd /c "ping -n 5 127.0.0.1 >nul & start "" http://localhost:%PORT%/"

:run
node server.js
echo.
echo [!] Server ruk gaya. 5 second me dobara start hoga... (band karne ke liye Ctrl+C)
ping -n 6 127.0.0.1 >nul
goto run
