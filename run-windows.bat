@echo off
setlocal
where node >nul 2>nul || (echo Node.js is not installed. Install Node.js 22 LTS first. & pause & exit /b 1)
where npm >nul 2>nul || (echo npm is not available. Reinstall Node.js 22 LTS. & pause & exit /b 1)
if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (echo Dependency installation failed. Check your internet connection and Node.js version. & pause & exit /b 1)
)
echo Starting KARE Facilities Portal at http://localhost:3000
call npm run dev
pause
