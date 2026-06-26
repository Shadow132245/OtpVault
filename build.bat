@echo off
REM Build script for OtpVault (Windows)
REM Usage: build.bat [arch]
REM   arch: x64 (default) or x86

setlocal enabledelayedexpansion

echo === OtpVault Build Script ===
echo.

REM Default to x64
set ARCH=x64
if not "%1"=="" set ARCH=%1

REM Set Rust target based on architecture
if /I "%ARCH%"=="x86" (
  set RUST_TARGET=i686-pc-windows-msvc
) else (
  set RUST_TARGET=x86_64-pc-windows-msvc
)

REM Read version from tauri.conf.json
for /f "delims=" %%v in ('powershell -NoProfile -Command "(Get-Content src-tauri\tauri.conf.json | ConvertFrom-Json).version"') do set VERSION=%%v
echo Version: %VERSION%
echo Building for: %ARCH% (%RUST_TARGET%)
echo.

REM Step 1: Install frontend dependencies
echo [1/6] Installing frontend dependencies...
call npm install
if errorlevel 1 exit /b 1
echo.

REM Step 2: Build frontend
echo [2/6] Building frontend...
call npx vite build
if errorlevel 1 exit /b 1
echo.

REM Check required env vars
if "%SUPABASE_URL%"=="" echo WARNING: SUPABASE_URL not set. Build will fail or use placeholder.
if "%SUPABASE_ANON_KEY%"=="" echo WARNING: SUPABASE_ANON_KEY not set. Build will fail or use placeholder.
if "%SUPABASE_URL%"=="" if "%SUPABASE_ANON_KEY%"=="" echo ^> Set both before building: $env:SUPABASE_URL="..." ; $env:SUPABASE_ANON_KEY="..."
echo.

REM Step 3: Build Tauri application
echo [3/6] Building Tauri application (%ARCH%)...
call npx tauri build --bundles msi --target %RUST_TARGET%
if errorlevel 1 exit /b 1
echo.

set MSI_NAME=OtpVault_%VERSION%_%ARCH%_en-US.msi

REM Step 4: Copy MSI to project root
echo [4/6] Copying MSI...
set "MSI_SRC=src-tauri\target\%RUST_TARGET%\release\bundle\msi\%MSI_NAME%"
copy /Y "%MSI_SRC%" "%MSI_NAME%" >nul
echo.
REM Step 5: Brand MSI
echo [5/6] Branding MSI...
powershell -ExecutionPolicy Bypass -File "scripts\brand-msi.ps1" -MsiPath "%MSI_NAME%"
if errorlevel 1 exit /b 1
echo.

REM Step 6: Copy branded MSI to dist folder
echo [6/6] Copying branded MSI...
set "DIST_DIR=dist\installer"
if not exist "%DIST_DIR%" mkdir "%DIST_DIR%"
copy /Y "%MSI_NAME%" "%DIST_DIR%\" >nul
echo   ^> Copied to %DIST_DIR%\%MSI_NAME%
echo.

echo === Build complete for %ARCH% ===
echo Output: %DIST_DIR%\%MSI_NAME%
