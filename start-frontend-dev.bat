@echo off
echo Starting MediCare Frontend Development Server...
echo Directory: %~dp0frontend
cd /d "%~dp0frontend"
call npm run dev
pause
