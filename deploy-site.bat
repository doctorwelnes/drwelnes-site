@echo off
setlocal

set "SERVER_USER=root"
set "SERVER_HOST=89.223.121.208"
set "SERVER_PATH=/var/www/drwelnes-site/"

echo [1/3] Building Astro site...
pushd "%~dp0site" >nul
call npm run build
if errorlevel 1 (
  echo Build failed.
  popd >nul
  exit /b 1
)

echo [2/3] Uploading dist to %SERVER_USER%@%SERVER_HOST%:%SERVER_PATH% ...
scp -r dist/* %SERVER_USER%@%SERVER_HOST%:%SERVER_PATH%
if errorlevel 1 (
  echo Upload failed.
  popd >nul
  exit /b 1
)

popd >nul

echo [3/3] Done. Checking site...
curl -I https://drwelnes.ru/ 2>nul

echo.
echo Deployment complete.
pause
endlocal
