@echo off
echo Початок збірки APK файлу для Склад Автозапчастин

:: Встановлюємо змінні середовища для підписання APK
set MYAPP_RELEASE_STORE_PASSWORD=skladapp123
set MYAPP_RELEASE_KEY_PASSWORD=skladapp123

cd android

:: Очищаємо попередні збірки
call ./gradlew clean

:: Створюємо релізну збірку
call ./gradlew assembleRelease

echo.
echo APK файл створено в директорії:
echo %cd%\app\build\outputs\apk\release\app-release.apk
echo.

pause
