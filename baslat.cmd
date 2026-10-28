@echo off
chcp 65001 >nul
title Net Defterim - yerel sunucu (bu pencereyi kapatma)
cd /d "%~dp0"
set "PORTABLE_NODE=C:\Users\kanbak\.gemini\antigravity\brain\e050e710-efbd-48f1-ac21-bc10aab3a19f\scratch\node-v22.14.0-win-x64"
if exist "%PORTABLE_NODE%\node.exe" set "PATH=%PORTABLE_NODE%;%PATH%"
where node >nul 2>&1
if errorlevel 1 (
  echo [HATA] Node.js kurulu degil. Lutfen https://nodejs.org adresinden Node.js LTS surumunu kurun.
  pause
  exit /b 1
)
if not exist "node_modules" (
  echo Ilk calistirma: paketler yukleniyor (npm install)...
  call npm install
)
echo Net Defterim baslatiliyor: http://localhost:5173
echo Durdurmak icin bu pencereyi kapat.
npm run dev
pause
