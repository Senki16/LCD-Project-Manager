@echo off
title LCD Projects Hub

echo.
echo  ================================
echo   LCD Projects Hub - Iniciando
echo  ================================
echo.

:: Ir al directorio del proyecto
cd /d "%~dp0"

:: Abrir backend en nueva ventana
echo [1/2] Abriendo Backend (puerto 3001)...
start "LCD Backend" cmd /k "cd apps\backend && npm run dev"

:: Esperar 3 segundos para que el backend arranque primero
timeout /t 3 /nobreak >nul

:: Abrir frontend en nueva ventana
echo [2/2] Abriendo Frontend (puerto 1420)...
start "LCD Frontend" cmd /k "cd apps\desktop && npm run dev"

:: Esperar que el frontend compile (unos segundos)
echo.
echo  Esperando que la app compile...
timeout /t 5 /nobreak >nul

:: Abrir el navegador
echo  Abriendo navegador...
start http://localhost:1420

echo.
echo  App iniciada. Puedes cerrar esta ventana.
timeout /t 3 /nobreak >nul
