@echo off
chcp 65001 >nul
title Net Defterim - Cloudflare'e yayinla
cd /d "%~dp0"
echo Net Defterim kendi Cloudflare hesabina yayinlaniyor...
echo (Ilk seferde tarayicida Cloudflare girisi acilir; "Allow" de.)
echo.
node scripts\deploy-cloudflare.mjs > cloudflare-yayin-log.txt 2>&1
type cloudflare-yayin-log.txt
echo.
pause
