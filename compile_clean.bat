@echo off
setlocal
title Compilar LCD Projects Hub - EXE
chcp 65001 >nul

echo ============================================
echo   LCD Projects Hub - Compilar instalador
echo ============================================
echo Este proceso puede tardar 5-10 minutos.

set "PROJ_ROOT=C:\Users\david\OneDrive\Escritorio\Proyectos\Proyectos mama\lcd-projects-hub"
set "STAGING=%USERPROFILE%\lcd-pkg"

echo [1/4] Compilando backend NestJS...
cd /d "%PROJ_ROOT%\apps\backend"
if exist tsconfig.tsbuildinfo del tsconfig.tsbuildinfo
call npm run build
if errorlevel 1 (
    echo [ERROR] Fallo la compilacion del backend.
    exit /b 1
)

echo [2/4] Preparando backend autocontenido (Prisma + NestJS)...
if exist "%STAGING%" rd /s /q "%STAGING%"
md "%STAGING%"
md "%STAGING%\prisma"
if not exist "%STAGING%\prisma" (
    echo [ERROR] No se pudo crear el directorio "%STAGING%\prisma"
    exit /b 1
)

copy /Y "%PROJ_ROOT%\apps\backend\package.json" "%STAGING%\"
if errorlevel 1 (
    echo [ERROR] No se pudo copiar package.json
    exit /b 1
)

copy /Y "%PROJ_ROOT%\apps\backend\prisma\schema.prisma" "%STAGING%\prisma\"
if errorlevel 1 (
    echo [ERROR] No se pudo copiar schema.prisma
    exit /b 1
)

cd /d "%STAGING%"
call npm install --no-audit --no-fund
if errorlevel 1 (
    echo [ERROR] Fallo npm install del backend.
    exit /b 1
)

call "%PROJ_ROOT%\node_modules\.bin\prisma" generate --schema "%STAGING%\prisma\schema.prisma"
if errorlevel 1 (
    echo [ERROR] Fallo prisma generate.
    exit /b 1
)

call npm prune --omit=dev --no-audit --no-fund

echo [3/4] Compilando frontend React...
cd /d "%PROJ_ROOT%\apps\desktop"
set ELECTRON_BUILD=true
call npm run build
if errorlevel 1 (
    echo [ERROR] Fallo la compilacion del frontend.
    exit /b 1
)

echo [4/4] Empaquetando con electron-builder...
call npx electron-builder --win --x64 --config electron-builder.yml
if errorlevel 1 (
    echo [ERROR] Fallo electron-builder.
    exit /b 1
)

echo ==============================================
echo  [OK] Instalador generado en: dist-electron\
echo ==============================================
