@echo off
setlocal enabledelayedexpansion
set "LD_PATH=C:\msys64\mingw64\bin\ld.exe"
for /d %%d in ("C:\msys64\mingw64\lib\gcc\x86_64-w64-mingw32\*") do set "GCC_DIR=%%d"
"C:\Program Files\LLVM\bin\clang.exe" --target=x86_64-w64-windows-gnu --ld-path="%LD_PATH%" -LC:\msys64\mingw64\x86_64-w64-mingw32\lib -LC:\msys64\mingw64\lib -L"%GCC_DIR%" %*
