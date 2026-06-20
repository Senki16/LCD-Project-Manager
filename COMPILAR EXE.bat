@echo off
title Compilar LCD Projects Hub — EXE
chcp 65001 >nul

echo.
echo  ============================================
echo    LCD Projects Hub — Compilar instalador
echo  ============================================
echo.
echo  Este proceso puede tardar 5-10 minutos.
echo.

set "STAGING=%TEMP%\lcd-backend-pkg"

:: 1. Compilar backend NestJS
echo [1/4] Compilando backend NestJS...
cd /d "%~dp0apps\backend"
call npm run build
if errorlevel 1 (
    echo [ERROR] Fallo la compilacion del backend.
    pause & exit /b 1
)

:: 2. Backend autocontenido (el monorepo hoistea deps al root; el .exe necesita
::    un node_modules completo con @prisma/client y su engine)
echo.
echo [2/4] Preparando backend autocontenido (Prisma + NestJS)...
if exist "%STAGING%" rmdir /s /q "%STAGING%"
mkdir "%STAGING%\prisma"
copy /Y "%~dp0apps\backend\package.json" "%STAGING%\" >nul
copy /Y "%~dp0apps\backend\prisma\schema.prisma" "%STAGING%\prisma\" >nul
cd /d "%STAGING%"
call npm install --no-audit --no-fund
if errorlevel 1 ( echo [ERROR] Fallo npm install del backend. & pause & exit /b 1 )
call npx prisma generate
if errorlevel 1 ( echo [ERROR] Fallo prisma generate. & pause & exit /b 1 )
call npm prune --omit=dev --no-audit --no-fund

:: 3. Compilar frontend React+Vite (base relativa para file://)
echo.
echo [3/4] Compilando frontend React...
cd /d "%~dp0apps\desktop"
set ELECTRON_BUILD=true
call npm run build
if errorlevel 1 (
    echo [ERROR] Fallo la compilacion del frontend.
    pause & exit /b 1
)

:: 4. Empaquetar con electron-builder
echo.
echo [4/4] Empaquetando con electron-builder...
call npx electron-builder --win --x64 --config electron-builder.yml
if errorlevel 1 (
    echo [ERROR] Fallo electron-builder.
    pause & exit /b 1
)

echo.
echo  ==============================================
echo   [OK] Instalador generado en: dist-electron\
echo  ==============================================
echo.
explorer "%~dp0dist-electron"
pause
