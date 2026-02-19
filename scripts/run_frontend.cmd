@echo off
setlocal

set "PROJECT_ROOT=%~dp0.."
set "FRONTEND_DIR=%PROJECT_ROOT%\frontend"
set "NPM_CMD=C:\Program Files\nodejs\npm.cmd"

cd /d "%FRONTEND_DIR%"

if not exist "%NPM_CMD%" (
  echo [ERROR] npm.cmd not found:
  echo %NPM_CMD%
  echo Install Node.js LTS.
  exit /b 1
)

echo [INFO] Starting frontend on http://localhost:3000
"%NPM_CMD%" run dev
