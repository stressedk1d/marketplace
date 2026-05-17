@echo off
setlocal

set "PROJECT_ROOT=%~dp0.."
set "BACKEND_DIR=%PROJECT_ROOT%\backend"

cd /d "%BACKEND_DIR%"

if exist "venv312\Scripts\python.exe" (
  set "PY=venv312\Scripts\python.exe"
) else (
  set "PY=python"
)

if "%PORT%"=="" set "PORT=8000"

echo [INFO] Applying Alembic migrations...
"%PY%" -m alembic upgrade head
if errorlevel 1 (
  echo [ERROR] Migrations failed. Fix errors above, then retry.
  exit /b 1
)

echo [INFO] Starting backend API on http://127.0.0.1:%PORT%
echo [INFO] If the port is busy, set another: set PORT=8010 ^& scripts\run_backend.cmd
"%PY%" -m uvicorn main:app --reload --host 127.0.0.1 --port %PORT%
