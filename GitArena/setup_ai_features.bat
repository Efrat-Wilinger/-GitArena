@echo off
echo ========================================
echo   AI Performance System - Setup
echo ========================================
echo.

cd /d "%~dp0backend"

echo [1/3] Running database migration...
echo.
python run_migration.py
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Migration failed!
    pause
    exit /b 1
)

echo.
echo [2/3] Generating AI insights for all repositories...
echo.
python generate_ai_insights.py
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Some insights generation failed, but continuing...
)

echo.
echo [3/3] Setup complete!
echo.
echo ========================================
echo   Next Steps:
echo ========================================
echo 1. Start your backend server (if not running)
echo 2. Start your frontend: cd frontend && npm run dev
echo 3. Open http://localhost:5173
echo 4. Navigate to the home page to see AI insights!
echo ========================================
echo.
pause
