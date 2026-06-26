@echo off
setlocal enabledelayedexpansion
for /d %%d in ("C:\msys64\mingw32\lib\gcc\i686-w64-mingw32\*") do set "GCC_DIR=%%d"
"C:\Program Files\LLVM\bin\clang.exe" --target=i686-w64-windows-gnu -fuse-ld=lld -LC:\msys64\mingw32\lib -LC:\msys64\mingw32\lib\gcc\i686-w64-mingw32 -L"%GCC_DIR%" %*
