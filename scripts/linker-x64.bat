@echo off
setlocal enabledelayedexpansion
set "PATH=C:\msys64\mingw64\bin;%PATH%"
x86_64-w64-mingw32-gcc %*
