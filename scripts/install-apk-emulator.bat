@echo off
echo Встановлення APK на емулятор...

:: Додавання шляху до Android SDK platform-tools до PATH
set PATH=%PATH%;C:\Users\SANYA\AppData\Local\Android\Sdk\platform-tools

:: Перевірка наявності APK файлу
if not exist "sklad-zp.apk" (
    echo Помилка: Файл sklad-zp.apk не знайдено в поточній директорії.
    echo Переконайтеся, що ви виконали збірку APK за допомогою build-apk.bat
    pause
    exit /b 1
)

:: Перевірка запущеного емулятора
echo Перевірка запущеного емулятора...
adb devices | findstr "emulator" > nul
if errorlevel 1 (
    echo Помилка: Емулятор не запущено.
    echo Запустіть емулятор перед встановленням APK.
    pause
    exit /b 1
)

:: Встановлення APK на емулятор
echo Встановлення APK на емулятор...
adb install -r sklad-zp.apk

if errorlevel 0 (
    echo.
    echo APK успішно встановлено на емулятор!
    echo Тепер ви можете запустити додаток на емуляторі.
) else (
    echo.
    echo Помилка при встановленні APK на емулятор.
    echo Перевірте, чи запущено емулятор та чи правильно зібрано APK.
)

pause