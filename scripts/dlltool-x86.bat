@echo off
REM dlltool wrapper for i686 MinGW builds
REM Rust may incorrectly pass --64 for i686 target
REM We call the 64-bit dlltool which handles both archs

set "FIXED_ARGS="

:loop
if "%~1"=="" goto :run
set "ARG=%~1"
if "%ARG%"=="--64" set "ARG=--32"
if "%ARG%"=="-m" (
  set "MACHINE=%~2"
  if "%MACHINE%"=="i386:x86-64" set "MACHINE=i386"
  set "FIXED_ARGS=%FIXED_ARGS% -m %MACHINE%"
  shift
  shift
  goto :loop
)
if not "%ARG%"=="-f" set "FIXED_ARGS=%FIXED_ARGS% %ARG%"
shift
goto :loop

:run
C:\msys64\mingw64\bin\dlltool.exe %FIXED_ARGS%
exit /b %ERRORLEVEL%
