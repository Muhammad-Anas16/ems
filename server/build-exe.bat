@echo off
setlocal EnableExtensions
title EMS Server - EXE Build
cd /d "%~dp0"

echo ==========================================================
echo   EMS Server  ^>^>  EMS-Server.exe  (offline / portable)
echo ==========================================================
echo Yeh file SIRF apne development PC par chalayein (jahan Node.js
echo aur internet ho). Bani hui exe ko phir kisi bhi PC par bina
echo Node / Docker / internet ke chala sakte hain.
echo.

if not exist "server.js" (
    echo [ERROR] server.js nahi mili. Yeh file "server" folder mein server.js ke saath rakhein.
    goto :fail
)

rem ---------- Node.js check ----------
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Is PC par Node.js installed nahi hai. Node.js 22 ya 24 LTS install karein.
    start "" https://nodejs.org/en/download
    goto :fail
)

node -e "const v=+process.versions.node.split('.')[0]; if(v<22) process.exit(1); require('node:sea')" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js version purana hai. Node.js 22 ya us se naya chahiye.
    node -v
    goto :fail
)

node -p "process.platform+'-'+process.arch" | findstr /i "win32-x64" >nul
if errorlevel 1 (
    echo [WARNING] Yeh 64-bit Node.js nahi lag raha. Exe sirf usi type ke PC par chalegi.
)
for /f "delims=" %%v in ('node -v') do echo Node.js %%v mil gaya.

rem ---------- Server dependencies ----------
if not exist "node_modules\express" goto :install
if not exist "node_modules\better-sqlite3\lib" goto :install
goto :tools

:install
echo.
echo ^>^> Server dependencies install ho rahi hain (internet chahiye)...
call npm install --omit=dev --no-audit --no-fund
if errorlevel 1 (
    echo [ERROR] npm install fail ho gaya.
    goto :fail
)

:tools
rem ---------- Build tools (esbuild + postject) ----------
if exist "build-exe\.tools\node_modules\esbuild" if exist "build-exe\.tools\node_modules\postject" goto :build
echo.
echo ^>^> Build tools install ho rahe hain (sirf pehli dafa, internet chahiye)...
if not exist "build-exe\.tools" mkdir "build-exe\.tools"
if not exist "build-exe\.tools\package.json" (echo {"private":true}) > "build-exe\.tools\package.json"
pushd "build-exe\.tools"
call npm install --no-audit --no-fund esbuild@0.25.12 postject@1.0.0-alpha.6
set "NPMERR=%errorlevel%"
popd
if not "%NPMERR%"=="0" (
    echo [ERROR] Build tools install nahi ho sake.
    goto :fail
)

:build
rem ---------- Build ----------
node "build-exe\build.mjs"
if errorlevel 1 (
    echo.
    echo [ERROR] Build fail ho gaya. Upar wala error dekhein.
    goto :fail
)

echo.
echo ==========================================================
echo   Ho gaya!  Folder:  %~dp0dist\EMS-Server
echo.
echo   Yeh poora "EMS-Server" folder USB se offline PC par copy
echo   karein aur EMS-Server.exe par double-click karein.
echo ==========================================================
explorer "%~dp0dist\EMS-Server"
pause
exit /b 0

:fail
echo.
pause
exit /b 1
