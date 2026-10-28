@echo off
chcp 65001 >nul
title Net Defterim - GitHub Desktop + VS Code
cd /d "%~dp0"
set "GIT=%ProgramFiles%\Git\cmd\git.exe"
set "GH=%ProgramFiles%\GitHub CLI\gh.exe"

echo [1/4] GitHub Desktop kuruluyor...
winget list --id GitHub.GitHubDesktop -e >nul 2>&1
if errorlevel 1 (
  winget install --id GitHub.GitHubDesktop -e --accept-package-agreements --accept-source-agreements
) else ( echo     zaten kurulu )

echo.
echo [2/4] Git durumu:
"%GIT%" --version
"%GIT%" status -sb
"%GIT%" remote -v

echo.
echo [3/4] GitHub oturumu:
"%GH%" auth status
if errorlevel 1 (
  echo     GitHub girisi aciliyor - tarayicida kodu girip Authorize'a bas.
  "%GH%" auth login --hostname github.com --git-protocol https --web
  "%GH%" auth setup-git
)

echo.
echo [4/4] Proje VS Code'da aciliyor...
where code >nul 2>&1
if errorlevel 1 (
  if exist "%LocalAppData%\Programs\Microsoft VS Code\bin\code.cmd" (
    call "%LocalAppData%\Programs\Microsoft VS Code\bin\code.cmd" "%~dp0"
  ) else ( start "" "%LocalAppData%\Programs\Microsoft VS Code\Code.exe" "%~dp0" )
) else ( call code "%~dp0" )

echo.
echo Bitti. VS Code'da sol alttaki hesap simgesinden "Sign in with GitHub" yap.
pause
