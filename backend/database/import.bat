@echo off
echo ========================================
echo Master Clinique - Import Base de Donnees
echo ========================================
echo.

REM Verifier si MySQL est accessible
where mysql >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERREUR: MySQL n'est pas dans le PATH
    echo Veuillez ajouter MySQL a votre PATH ou utilisez le chemin complet
    echo Exemple: "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
    pause
    exit /b 1
)

echo Import du schema SQL dans MySQL...
echo.
echo Entrez votre mot de passe MySQL lorsque demande.
echo Si vous n'avez pas de mot de passe, appuyez simplement sur Entree.
echo.

mysql -u root -p < schema.sql

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================
    echo Import reussi!
    echo ========================================
    echo.
    echo La base de donnees 'master_clinique' a ete creee avec succes.
    echo Un utilisateur admin par defaut a ete cree:
    echo   - Utilisateur: admin
    echo   - Mot de passe: admin123
    echo.
    echo Vous pouvez maintenant acceder a l'application sur:
    echo http://localhost:3000
    echo.
) else (
    echo.
    echo ========================================
    echo ERREUR lors de l'import
    echo ========================================
    echo.
    echo Verifiez que:
    echo 1. MySQL est en cours d'execution
    echo 2. Le mot de passe est correct
    echo 3. Vous avez les permissions necessaires
    echo.
)

pause
