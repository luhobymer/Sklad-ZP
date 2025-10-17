# 🛠️ Скрипти автоматизації

Ця директорія містить скрипти для автоматизації різних процесів розробки та розповсюдження додатку.

## 📦 Скрипти збірки APK (Windows)

### `build-apk.bat`
Збірка APK файлу додатку.

**Використання:**
```bash
.\scripts\build-apk.bat
```

**Що робить:**
- Очищує попередні збірки
- Збирає Release APK
- Зберігає APK в `android/app/build/outputs/apk/release/`

---

### `build-install-run.bat`
Повний цикл: збірка + встановлення + запуск на емуляторі.

**Використання:**
```bash
.\scripts\build-install-run.bat
```

**Що робить:**
1. Збирає Debug APK
2. Встановлює на підключений емулятор/пристрій
3. Запускає додаток

---

## 📱 Скрипти роботи з емулятором

### `install-apk-emulator.bat`
Встановлення APK на емулятор.

**Використання:**
```bash
.\scripts\install-apk-emulator.bat
```

**Передумови:**
- Емулятор має бути запущений
- APK файл має бути зібраний

---

### `launch-app-emulator.bat`
Запуск емулятора Android.

**Використання:**
```bash
.\scripts\launch-app-emulator.bat
```

**Конфігурація:**
- Змініть ім'я AVD в скрипті, якщо використовуєте інший емулятор

---

## 📤 Скрипти відправки APK (PowerShell)

### `send-apk.ps1`
Відправка APK файлу в Telegram.

**Використання:**
```powershell
pwsh -File .\scripts\send-apk.ps1 -Token "YOUR_BOT_TOKEN" -Chat "CHAT_ID" -BuildType "debug"
```

**Параметри:**
- `-Token` - токен Telegram бота
- `-Chat` - ID чату або каналу
- `-BuildType` - тип збірки (`debug` або `release`)

**Через npm скрипти:**
```bash
# Debug APK
npm run apk:send:debug

# Release APK
npm run apk:send:release
```

**Налаштування .env:**
```env
TG_BOT_TOKEN=your_bot_token
TG_CHAT_ID=your_chat_id
```

---

### `send-telegram.ps1`
Універсальний скрипт для відправки файлів в Telegram.

**Використання:**
```powershell
pwsh -File .\scripts\send-telegram.ps1 -FilePath "path/to/file.apk" -Token "BOT_TOKEN" -Chat "CHAT_ID"
```

---

### `build-and-send.ps1`
Збірка та відправка APK одним скриптом.

**Використання:**
```powershell
pwsh -File .\scripts\build-and-send.ps1
```

**Що робить:**
1. Збирає Release APK
2. Автоматично відправляє в Telegram

---

## 📋 Загальні примітки

### Вимоги
- **Windows** - для .bat скриптів
- **PowerShell** - для .ps1 скриптів
- **Android SDK** - має бути встановлений
- **Gradle** - встановлюється автоматично через Android Studio

### Змінні середовища
Переконайтесь, що встановлені:
```env
ANDROID_HOME=C:\Users\YourUser\AppData\Local\Android\Sdk
JAVA_HOME=C:\Program Files\Java\jdk-17
```

### Права виконання PowerShell
Якщо виникають проблеми з виконанням .ps1 скриптів:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🔧 Налаштування скриптів

Більшість скриптів можна налаштувати, відредагувавши змінні всередині файлу:

```batch
REM Приклад налаштування в build-apk.bat
set APK_NAME=sklad-zp
set BUILD_TYPE=release
```

---

## 💡 Корисні поради

1. **Перевірте ADB підключення:**
   ```bash
   adb devices
   ```

2. **Очистіть кеш Gradle:**
   ```bash
   cd android && .\gradlew clean
   ```

3. **Перегляд логів емулятора:**
   ```bash
   adb logcat
   ```

4. **Відлагодження проблем збірки:**
   ```bash
   cd android && .\gradlew assembleDebug --stacktrace
   ```

---

## 📚 Додаткова інформація

Детальніші інструкції дивіться в:
- [ІНСТРУКЦІЯ_ДЛЯ_ВСТАНОВЛЕННЯ.md](../docs/ІНСТРУКЦІЯ_ДЛЯ_ВСТАНОВЛЕННЯ.md)
- [ДОКУМЕНТАЦІЯ.md](../docs/ДОКУМЕНТАЦІЯ.md)
