@echo off
setlocal enabledelayedexpansion
set "PATH=C:\msys64\mingw64\bin;%PATH%"
for /d %%d in ("C:\msys64\mingw64\lib\gcc\x86_64-w64-mingw32\*") do set "GCC_DIR=%%d"
"C:\Program Files\LLVM\bin\clang.exe" -fuse-ld=lld --target=x86_64-w64-windows-gnu -LC:\msys64\mingw64\x86_64-w64-mingw32\lib -LC:\msys64\mingw64\lib -L"%GCC_DIR%" %*
