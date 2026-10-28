@echo off
chcp 65001 >nul
setlocal EnableExtensions
title Net Defterim - Depoyu herkese ac
cd /d "%~dp0"
set "GIT=%ProgramFiles%\Git\cmd\git.exe"
set "GH=%ProgramFiles%\GitHub CLI\gh.exe"
set "LOG=%~dp0github-public-log.txt"
echo Basladi %date% %time% > "%LOG%"

echo [1/3] Gecmiste .env veya API anahtari var mi kontrol ediliyor...
"%GIT%" log --all --name-only --pretty=format: | findstr /r /c:"^\.env$" /c:"^\.env\.local" /c:"\.dev\.vars" >nul
if not errorlevel 1 ( echo [DURDU] Gecmiste .env dosyasi bulundu. >>"%LOG%" & echo [DURDU] Gecmiste .env bulundu, acilmadi. & pause & exit /b 1 )
for /f %%C in ('"%GIT%" rev-list --all') do (
  "%GIT%" grep -I -q -E "sk-(proj-)?[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{30,}" %%C -- . ":(exclude)package-lock.json" && ( echo [DURDU] %%C icinde anahtar benzeri metin var. >>"%LOG%" & echo [DURDU] Anahtar benzeri metin bulundu, acilmadi. & pause & exit /b 1 )
)
echo Gecmis temiz. >>"%LOG%"

echo [2/3] Depo herkese aciliyor...
"%GH%" repo edit yusufkaya5482/net-defterim --visibility public --accept-visibility-change-consequences >>"%LOG%" 2>&1

echo [3/3] Sonuc:
"%GH%" repo view yusufkaya5482/net-defterim --json url,visibility >>"%LOG%" 2>&1
type "%LOG%"
echo.
pause
