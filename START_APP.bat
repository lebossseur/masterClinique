@echo off
echo ========================================
echo Master Clinique - Demarrage Application
echo ========================================
echo.

echo Demarrage du serveur Backend...
start "Backend - Master Clinique" cmd /k "cd backend && npm run dev"

timeout /t 3 >nul

echo Demarrage du serveur Frontend...
start "Frontend - Master Clinique" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo Serveurs demarres!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Deux fenetres de terminal se sont ouvertes.
echo Ne les fermez pas tant que vous utilisez l'application.
echo.
echo L'application va s'ouvrir automatiquement dans votre navigateur.
echo.
pause
