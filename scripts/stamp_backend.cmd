@echo off
setlocal

set "PROJECT_ROOT=%~dp0.."
set "BACKEND_DIR=%PROJECT_ROOT%\backend"

cd /d "%BACKEND_DIR%"

if not exist "venv312\Scripts\python.exe" (
  echo [ERROR] venv312 not found.
  echo Run scripts\setup_backend.cmd first.
  exit /b 1
)

echo [INFO] Stamping current DB schema to Alembic head...
"venv312\Scripts\python.exe" -m alembic stamp head
if errorlevel 1 exit /b 1

echo [DONE] Alembic head stamped.
