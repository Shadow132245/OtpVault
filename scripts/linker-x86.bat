@echo off
setlocal enabledelayedexpansion
set "PATH=C:\msys64\mingw32\bin;C:\msys64\mingw64\bin;%PATH%"
for /d %%d in ("C:\msys64\mingw32\lib\gcc\i686-w64-mingw32\*") do set "GCC_DIR=%%d"
C:\msys64\mingw32\bin\i686-w64-mingw32-gcc.exe -LC:\msys64\mingw32\lib -LC:\msys64\mingw32\lib\gcc\i686-w64-mingw32 -L"%GCC_DIR%" %*
