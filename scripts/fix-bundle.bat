@echo off
echo Виправлення проблеми зі збіркою APK для Склад Автозапчастин

:: Створення директорії assets, якщо вона не існує
echo Створення директорії assets...
if not exist "android\app\src\main\assets" mkdir "android\app\src\main\assets"

:: Створення порожнього бандлу, якщо він не існує
echo Створення порожнього бандлу...
if not exist "android\app\src\main\assets\index.android.bundle" (
  echo // Порожній бандл для збірки > "android\app\src\main\assets\index.android.bundle"
)

:: Створення директорії для ресурсів, якщо вона не існує
echo Створення директорії для ресурсів...
if not exist "android\app\src\main\res\drawable" mkdir "android\app\src\main\res\drawable"

echo Виправлення завершено. Тепер можна запустити build-apk.bat