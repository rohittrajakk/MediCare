@echo off
echo ========================================
echo   MediCare Build Script
echo ========================================
echo.

echo [1/3] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

echo [2/3] Building Frontend...
cd frontend
call npm install
call npm run build
cd ..

echo [3/3] Frontend built to src/main/resources/static/
echo.
echo ========================================
echo   BUILD COMPLETE!
echo ========================================
echo.
echo Now run the project from your IDE:
echo   1. Open MediCareApplication.java
echo   2. Click Run
echo   3. Access http://localhost:8080
echo.
pause
