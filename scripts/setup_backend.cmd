@echo off
setlocal

set "PROJECT_ROOT=%~dp0.."
set "BACKEND_DIR=%PROJECT_ROOT%\backend"
set "PYTHON_EXE=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"

cd /d "%BACKEND_DIR%"

if not exist "%PYTHON_EXE%" (
  echo [ERROR] Python 3.12 not found at:
  echo %PYTHON_EXE%
  echo Install Python or adjust script path.
  exit /b 1
)

if not exist ".env" (
  copy ".env.example" ".env" >nul
  echo [OK] Created backend\.env from .env.example
)

if not exist "venv312\Scripts\python.exe" (
  echo [INFO] Creating virtual environment venv312...
  "%PYTHON_EXE%" -m venv venv312
  if errorlevel 1 exit /b 1
)

echo [INFO] Installing backend requirements...
"venv312\Scripts\python.exe" -m pip install -r requirements.txt
if errorlevel 1 exit /b 1

echo [DONE] Backend setup complete.
exit /b 0
