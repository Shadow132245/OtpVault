@echo off
setlocal enabledelayedexpansion
set "PATH=C:\msys64\mingw64\bin;%PATH%"
i686-w64-mingw32-gcc %*
