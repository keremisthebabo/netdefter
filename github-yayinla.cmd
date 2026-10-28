@echo off
chcp 65001 >nul
setlocal EnableExtensions
title Net Defterim - GitHub'a yayinla
cd /d "%~dp0"
set "GIT=%ProgramFiles%\Git\cmd\git.exe"
set "GH=%ProgramFiles%\GitHub CLI\gh.exe"
set "LOG=%~dp0github-yayin-log.txt"
echo Yayin basladi %date% %time% > "%LOG%"

echo [1/5] GitHub oturumu kontrol ediliyor...
"%GH%" auth status >>"%LOG%" 2>&1
if errorlevel 1 (
  echo     GitHub girisi gerekli. Enter'a bas, tarayicida kodu gir ve Authorize'a tikla.
  "%GH%" auth login --hostname github.com --git-protocol https --web
)
"%GH%" auth status >>"%LOG%" 2>&1
if errorlevel 1 ( echo [HATA] GitHub girisi yapilamadi. >>"%LOG%" & echo [HATA] GitHub girisi yapilamadi. & pause & exit /b 1 )
"%GH%" auth setup-git >>"%LOG%" 2>&1

echo [2/5] Git kimligi ayarlaniyor...
for /f "delims=" %%L in ('"%GH%" api user --jq .login') do set "GHLOGIN=%%L"
for /f "delims=" %%I in ('"%GH%" api user --jq .id') do set "GHID=%%I"
echo GitHub kullanicisi: %GHLOGIN% >>"%LOG%"
"%GIT%" config --global user.name >nul 2>&1 || "%GIT%" config --global user.name "Yusuf Kaya"
"%GIT%" config --global user.email >nul 2>&1 || "%GIT%" config --global user.email "%GHID%+%GHLOGIN%@users.noreply.github.com"
"%GIT%" config --global init.defaultBranch main
"%GIT%" config --global core.autocrlf true

echo [3/5] Dosyalar hazirlaniyor...
"%GIT%" config --global --get-all safe.directory | findstr /c:"2026-09-12/be" >nul || "%GIT%" config --global --add safe.directory "C:/Users/Yusuf Kaya/Documents/Codex/2026-09-12/be"
if not exist ".git" "%GIT%" init -b main >>"%LOG%" 2>&1
"%GIT%" add -A >>"%LOG%" 2>&1
"%GIT%" ls-files --error-unmatch .env >nul 2>&1
if not errorlevel 1 ( "%GIT%" rm --cached .env >>"%LOG%" 2>&1 )
"%GIT%" diff --cached --quiet
if errorlevel 1 "%GIT%" commit -m "Net Defterim guncelleme %date%" >>"%LOG%" 2>&1
"%GIT%" branch -M main >>"%LOG%" 2>&1

echo [4/5] GitHub deposu olusturuluyor / gonderiliyor...
"%GIT%" remote get-url origin >nul 2>&1
if errorlevel 1 (
  "%GH%" repo view "%GHLOGIN%/net-defterim" >nul 2>&1
  if errorlevel 1 (
    "%GH%" repo create net-defterim --private --source . --remote origin --push >>"%LOG%" 2>&1
  ) else (
    "%GIT%" remote add origin "https://github.com/%GHLOGIN%/net-defterim.git" >>"%LOG%" 2>&1
    "%GIT%" push -u origin main >>"%LOG%" 2>&1
  )
) else (
  "%GIT%" push -u origin main >>"%LOG%" 2>&1
)

echo [5/5] Sonuc:
"%GIT%" remote -v >>"%LOG%" 2>&1
"%GIT%" log --oneline -3 >>"%LOG%" 2>&1
"%GIT%" status -sb >>"%LOG%" 2>&1
"%GH%" repo view --json url,visibility >>"%LOG%" 2>&1
type "%LOG%"
echo.
echo Bitti. Bu pencereyi kapatabilirsin.
pause
