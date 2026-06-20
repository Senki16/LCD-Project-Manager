@echo off
title Detener LCD Projects Hub

echo Deteniendo LCD Projects Hub...
taskkill /FI "WINDOWTITLE eq LCD Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq LCD Frontend*" /F >nul 2>&1

:: Liberar puertos por si acaso
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :1420 ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>&1

echo Listo. App detenida.
timeout /t 2 /nobreak >nul
