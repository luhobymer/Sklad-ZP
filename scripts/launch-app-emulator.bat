@echo off
echo Запуск додатку Склад Автозапчастин на емуляторі...

:: Додавання шляху до Android SDK platform-tools до PATH
set PATH=%PATH%;C:\Users\SANYA\AppData\Local\Android\Sdk\platform-tools

:: Перевірка запущеного емулятора
echo Перевірка запущеного емулятора...
adb devices | findstr "emulator" > nul
if errorlevel 1 (
    echo Помилка: Емулятор не запущено.
    echo Запустіть емулятор перед запуском додатку.
    pause
    exit /b 1
)

:: Отримання package та activity з AndroidManifest.xml
set PACKAGE_NAME=com.gorun4.skladzp
set MAIN_ACTIVITY=.MainActivity

:: Запуск додатку на емуляторі
echo Запуск додатку %PACKAGE_NAME%/%MAIN_ACTIVITY%...
adb shell am start -n %PACKAGE_NAME%/%MAIN_ACTIVITY%

if errorlevel 0 (
    echo.
    echo Додаток успішно запущено на емуляторі!
) else (
    echo.
    echo Помилка при запуску додатку на емуляторі.
    echo Перевірте, чи встановлено APK та чи запущено емулятор.
)

pause