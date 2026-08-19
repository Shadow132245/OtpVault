@echo off
cd /d "C:\Users\Admin\Desktop\New folder\OtpVault\mobile\android"
call gradlew.bat --stop
set JAVA_OPTS=-Xmx4g
set GRADLE_OPTS=-Xmx4g -Dorg.gradle.daemon=false
call gradlew.bat assembleDebug --no-daemon --stacktrace > "C:\Users\Admin\Desktop\New folder\OtpVault\mobile\build6.log" 2>&1
echo EXIT_CODE=%ERRORLEVEL% >> "C:\Users\Admin\Desktop\New folder\OtpVault\mobile\build6.log"
