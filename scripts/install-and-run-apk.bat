@echo off
echo Встановлення та запуск APK на емуляторі

:: Перевірка наявності APK файлу
if not exist "sklad-zp.apk" (
  echo APK файл не знайдено. Спочатку виконайте збірку APK.
  exit /b 1
)

:: Встановлення APK на емулятор
echo Встановлення APK на емулятор...
"C:\Users\SANYA\AppData\Local\Android\Sdk\platform-tools\adb.exe" install -r sklad-zp.apk
if %ERRORLEVEL% neq 0 (
  echo Помилка при встановленні APK. Перевірте, чи запущений емулятор.
  exit /b 1
)

:: Запуск додатку на емуляторі
echo Запуск додатку на емуляторі...
"C:\Users\SANYA\AppData\Local\Android\Sdk\platform-tools\adb.exe" shell am start -n com.gorun4.skladzp/.MainActivity
if %ERRORLEVEL% neq 0 (
  echo Помилка при запуску додатку.
  exit /b 1
)

echo Додаток успішно встановлено та запущено на емуляторі.