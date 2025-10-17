@echo off
echo Початок збірки APK файлу для Склад Автозапчастин (React Native + TypeScript)

:: Встановлюємо змінні середовища
set MYAPP_RELEASE_STORE_PASSWORD=skladapp123
set MYAPP_RELEASE_KEY_PASSWORD=skladapp123
set NODE_ENV=production

:: Підготовка проекту для збірки
echo Підготовка проекту для збірки...
echo Встановлення залежностей...
call npm install

:: Виправлення проблеми з бандлом
echo Виправлення проблеми з бандлом...
call fix-bundle.bat

:: Збираємо APK через Gradle
echo Збірка APK файлу...
cd android

:: Очищаємо попередні збірки
call ./gradlew clean

:: Створюємо релізну збірку
call ./gradlew assembleRelease

echo.
echo APK файл створено в директорії:
echo %cd%\app\build\outputs\apk\release\app-release.apk
echo.

:: Повернення до кореневої директорії проекту
cd ..

:: Копіювання APK файлу в кореневу директорію та створення резервної копії
echo Копіювання APK файлу...
call copy-apk.bat

echo.
echo Збірка та копіювання APK файлу завершено.
echo Для встановлення APK на емулятор використовуйте install-apk-emulator.bat
echo Для запуску додатку на емуляторі використовуйте launch-app-emulator.bat
echo.

pause
