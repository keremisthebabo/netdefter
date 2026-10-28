@echo off
chcp 65001 >nul
title Net Defterim - yerel sunucu (bu pencereyi kapatma)
cd /d "%~dp0"
echo Net Defterim baslatiliyor: http://localhost:5173
echo Durdurmak icin bu pencereyi kapat.
npm run dev
pause
