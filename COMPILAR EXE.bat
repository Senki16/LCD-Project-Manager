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

:: Staging sin espacios para evitar problemas con cmd
set "STAGING=%USERPROFILE%\lcd-pkg"

:: 1. Compilar backend NestJS
echo [1/4] Compilando backend NestJS...
cd /d "%~dp0apps\backend"
call npm run build
if errorlevel 1 (
    echo [ERROR] Fallo la compilacion del backend.
    pause & exit /b 1
)

:: 2. Backend autocontenido
echo.
echo [2/4] Preparando backend autocontenido (Prisma + NestJS)...
if exist %STAGING% rd /s /q %STAGING%
md %STAGING%
md %STAGING%\prisma
if not exist %STAGING%\prisma (
    echo [ERROR] No se pudo crear el directorio %STAGING%\prisma
    pause & exit /b 1
)
copy /Y "%~dp0apps\backend\package.json" %STAGING%\
if errorlevel 1 ( echo [ERROR] No se pudo copiar package.json & pause & exit /b 1 )
copy /Y "%~dp0apps\backend\prisma\schema.prisma" %STAGING%\prisma\
if errorlevel 1 ( echo [ERROR] No se pudo copiar schema.prisma & pause & exit /b 1 )
cd /d %STAGING%
call npm install --no-audit --no-fund
if errorlevel 1 ( echo [ERROR] Fallo npm install del backend. & pause & exit /b 1 )
call "%~dp0node_modules\.bin\prisma" generate --schema %STAGING%\prisma\schema.prisma
if errorlevel 1 ( echo [ERROR] Fallo prisma generate. & pause & exit /b 1 )
call npm prune --omit=dev --no-audit --no-fund

:: 3. Compilar frontend React+Vite
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
