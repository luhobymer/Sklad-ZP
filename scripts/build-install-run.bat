@echo off
echo ===================================================
echo = Повний процес збірки, встановлення та запуску =
echo = додатку Склад Автозапчастин                  =
echo ===================================================
echo.

:: Додавання шляху до Android SDK platform-tools до PATH
set PATH=%PATH%;C:\Users\SANYA\AppData\Local\Android\Sdk\platform-tools

:: Перевірка запущеного емулятора
echo Перевірка запущеного емулятора...
adb devices | findstr "emulator" > nul
if errorlevel 1 (
    echo Помилка: Емулятор не запущено.
    echo Запустіть емулятор перед виконанням цього скрипту.
    pause
    exit /b 1
)

:: Крок 1: Збірка APK
echo.
echo Крок 1/4: Збірка APK файлу...
echo.
call build-apk.bat

:: Крок 2: Копіювання APK
echo.
echo Крок 2/4: Копіювання APK файлу...
echo.
call copy-apk.bat

:: Крок 3: Встановлення APK на емулятор
echo.
echo Крок 3/4: Встановлення APK на емулятор...
echo.
call install-apk-emulator.bat

:: Крок 4: Запуск додатку на емуляторі
echo.
echo Крок 4/4: Запуск додатку на емуляторі...
echo.
call launch-app-emulator.bat

echo.
echo ===================================================
echo = Процес завершено!                             =
echo = Додаток Склад Автозапчастин запущено на       =
echo = емуляторі.                                    =
echo ===================================================
echo.

pause