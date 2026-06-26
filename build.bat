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
  set RUST_TARGET=i686-pc-windows-gnu
  set WI_DIR=x86
) else (
  set RUST_TARGET=x86_64-pc-windows-gnu
  set WI_DIR=x64
)

echo Building for: %ARCH% (%RUST_TARGET%)
echo.

REM Add MinGW to PATH (x64 for both, x86 packages handle their own)
set "PATH=C:\msys64\mingw64\bin;%PATH%"

REM Step 1: Install frontend dependencies
echo [1/5] Installing frontend dependencies...
call npm install
if errorlevel 1 exit /b 1
echo.

REM Step 2: Build frontend
echo [2/5] Building frontend...
call npx vite build
if errorlevel 1 exit /b 1
echo.

REM Step 3: Build Tauri application
echo [3/5] Building Tauri application (%ARCH%)...
call npx tauri build --bundles msi --target %RUST_TARGET%
if errorlevel 1 exit /b 1
echo.

REM Step 4: Patch MSI with branding
echo [4/5] Patching MSI with brand assets...
powershell -ExecutionPolicy Bypass -File "scripts\patch-installer.ps1" -Arch %ARCH%
if errorlevel 1 exit /b 1
echo.

REM Step 5: Copy branded MSI to dist folder
echo [5/5] Copying branded MSI...
set "DIST_DIR=dist\installer"
if not exist "%DIST_DIR%" mkdir "%DIST_DIR%"
copy /Y "OtpVault_0.1.0_%ARCH%_en-US.msi" "%DIST_DIR%\" >nul
echo   ^> Copied to %DIST_DIR%\OtpVault_0.1.0_%ARCH%_en-US.msi
echo.

echo === Build complete for %ARCH% ===
echo Output: %DIST_DIR%\OtpVault_0.1.0_%ARCH%_en-US.msi
