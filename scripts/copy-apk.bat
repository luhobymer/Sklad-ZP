@echo off
echo Копіювання APK файлу після збірки...

:: Перевірка наявності APK файлу
set APK_PATH=android\app\build\outputs\apk\release\app-release.apk
if not exist "%APK_PATH%" (
    echo Помилка: Файл %APK_PATH% не знайдено.
    echo Переконайтеся, що ви виконали збірку APK за допомогою build-apk.bat
    pause
    exit /b 1
)

:: Копіювання APK у кореневу директорію
echo Копіювання APK у кореневу директорію...
copy /Y "%APK_PATH%" "sklad-zp.apk"

:: Створення директорії для резервних копій, якщо вона не існує
if not exist "apk-backups" mkdir "apk-backups"

:: Отримання поточної дати та часу для імені файлу
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list') do set datetime=%%I
set FILENAME=sklad-zp_%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%-%datetime:~10,2%.apk

:: Копіювання APK у директорію резервних копій з датою в імені файлу
echo Створення резервної копії APK з датою та часом...
copy /Y "%APK_PATH%" "apk-backups\%FILENAME%"

echo.
echo APK файл успішно скопійовано:
echo 1. sklad-zp.apk (у кореневій директорії)
echo 2. apk-backups\%FILENAME% (резервна копія з датою та часом)
echo.

:: Оновлення списку APK файлів
echo Оновлення списку APK файлів...
dir /B "apk-backups\*.apk" > "apk-list.txt"

echo Список APK файлів оновлено у файлі apk-list.txt
echo.

pause