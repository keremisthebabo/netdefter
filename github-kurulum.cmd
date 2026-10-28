@echo off
chcp 65001 >nul
setlocal EnableExtensions
title Net Defterim - Git ve GitHub kurulumu
cd /d "%~dp0"
echo.
echo ==============================================
echo   Net Defterim - Git ve GitHub kurulumu
echo ==============================================
echo.

where winget >nul 2>nul
if errorlevel 1 (
  echo [HATA] winget bulunamadi. Microsoft Store'dan "Uygulama Yukleyici" ^(App Installer^) uygulamasini guncelleyip tekrar dene.
  pause & exit /b 1
)

set "GIT=%ProgramFiles%\Git\cmd\git.exe"
set "GH=%ProgramFiles%\GitHub CLI\gh.exe"

echo [1/6] Git kuruluyor ^(zaten kuruluysa atlanir^)...
if not exist "%GIT%" winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
if not exist "%GIT%" ( echo [HATA] Git kurulamadi. & pause & exit /b 1 )

echo [2/6] GitHub CLI kuruluyor ^(zaten kuruluysa atlanir^)...
if not exist "%GH%" winget install --id GitHub.cli -e --source winget --accept-package-agreements --accept-source-agreements
if not exist "%GH%" ( echo [HATA] GitHub CLI kurulamadi. & pause & exit /b 1 )

echo [3/6] Git kimligi ayarlaniyor...
for /f "delims=" %%e in ('"%GIT%" config --global user.email 2^>nul') do set "CUR_EMAIL=%%e"
"%GIT%" config --global user.name "Yusuf Kaya"
if not defined CUR_EMAIL (
  set /p "MAIL=GitHub e-posta adresin: "
  call "%GIT%" config --global user.email "%%MAIL%%"
)
"%GIT%" config --global init.defaultBranch main
"%GIT%" config --global core.autocrlf true

echo [4/6] Proje deposu hazirlaniyor...
if not exist ".git" "%GIT%" init -b main
"%GIT%" add -A
for /f "delims=" %%f in ('"%GIT%" ls-files .env') do (
  echo [HATA] .env dosyasi depoya girecekti - API anahtari korunmak icin islem durduruldu.
  "%GIT%" rm --cached .env >nul
  pause & exit /b 1
)
"%GIT%" rev-parse --verify HEAD >nul 2>nul
if errorlevel 1 ( "%GIT%" commit -m "Net Defterim: ilk surum" >nul ) else ( "%GIT%" commit -m "Net Defterim: guncelleme %date% %time:~0,5%" >nul 2>nul )
"%GIT%" log --oneline -1

echo [5/6] GitHub hesabina baglaniliyor...
"%GH%" auth status >nul 2>nul
if errorlevel 1 (
  echo Tarayici acilacak: ekrandaki 8 haneli kodu GitHub sayfasina gir ve "Authorize" de.
  "%GH%" auth login --hostname github.com --git-protocol https --web
)
"%GH%" auth setup-git

echo [6/6] Ozel ^(private^) GitHub deposu olusturuluyor ve kod gonderiliyor...
"%GIT%" remote get-url origin >nul 2>nul
if errorlevel 1 (
  "%GH%" repo create net-defterim --private --source . --remote origin --push
) else (
  "%GIT%" push -u origin main
)
echo.
echo ==============================================
echo   Tamam! Deponun adresi:
"%GH%" repo view --json url -q .url
echo ==============================================
echo Bundan sonra degisiklikleri gondermek icin bu dosyayi tekrar calistirman yeterli.
echo.
pause
