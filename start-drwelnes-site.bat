@echo off
setlocal

REM Start Astro site dev server in a new window
start "DrWelnes Site" cmd /k "cd /d %~dp0site && npm run dev"

REM Give the server a moment to start
timeout /t 2 /nobreak >nul

REM Open the site in the default browser
start http://localhost:4321

endlocal
