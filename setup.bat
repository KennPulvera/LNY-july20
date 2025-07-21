@echo off
title Lance and Yuri Kids Spot - Setup
color 0A

echo.
echo ===============================================
echo    Lance and Yuri Kids Spot - Setup
echo ===============================================
echo.

echo Checking for Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo Then run this script again.
    pause
    exit /b 1
)

echo ✅ Node.js is installed
echo.

echo 🔄 Running setup script...
node setup.js

if %errorlevel% equ 0 (
    echo.
    echo ✅ Setup completed successfully!
    echo.
    echo Next steps:
    echo 1. npm run dev    - Start the application
    echo 2. Open browser   - Go to http://localhost:3000
    echo 3. Admin login    - test@gmail.com / admin123
    echo.
    echo Press any key to start the application now...
    pause >nul
    
    echo.
    echo 🚀 Starting the application...
    echo Press Ctrl+C to stop the server
    echo.
    npm run dev
) else (
    echo.
    echo ❌ Setup failed!
    echo Please check the error messages above.
    echo.
    pause
) 