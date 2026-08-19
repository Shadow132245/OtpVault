@echo off
cd /d "C:\Users\Admin\Desktop\New folder\OtpVault\mobile\android"
call gradlew.bat assembleDebug > "C:\Users\Admin\Desktop\New folder\OtpVault\mobile\build5.log" 2>&1
echo BUILD_EXIT_CODE=%ERRORLEVEL% >> "C:\Users\Admin\Desktop\New folder\OtpVault\mobile\build5.log"
