@echo off
cd /d "C:\Users\Admin\Desktop\New folder\OtpVault\mobile\android"
call gradlew.bat --stop
call gradlew.bat clean assembleDebug --no-daemon -Dorg.gradle.workers.max=1 > "C:\Users\Admin\Desktop\New folder\OtpVault\mobile\build7.log" 2>&1
echo EXIT_CODE=%ERRORLEVEL% >> "C:\Users\Admin\Desktop\New folder\OtpVault\mobile\build7.log"
