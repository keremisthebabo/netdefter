@echo off
chcp 65001 >nul
title Net Defterim - kontrol
cd /d "%~dp0"
echo Tur kontrolu ve derleme yapiliyor, 1-2 dakika surebilir...
echo === TSC === > kontrol-log.txt
call node_modules\.bin\tsc.cmd --noEmit -p . >> kontrol-log.txt 2>&1
echo TSC_EXIT=%errorlevel% >> kontrol-log.txt
echo === BUILD === >> kontrol-log.txt
node scripts\run-framework.mjs build >> kontrol-log.txt 2>&1
echo BUILD_EXIT=%errorlevel% >> kontrol-log.txt
echo Bitti. Sonuc kontrol-log.txt dosyasinda.
timeout /t 5 >nul
