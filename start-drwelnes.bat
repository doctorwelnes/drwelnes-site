@echo off
setlocal

echo Starting DrWelnes dev server...
start "DrWelnes Dev" cmd /k "cd /d %~dp0 && npm run dev"

echo Waiting a moment before opening browser...
timeout /t 3 /nobreak >nul

start "" "http://localhost:3000"

echo Done.
endlocal
