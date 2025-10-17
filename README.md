# 📦 Склад Автозапчастин

> Мобільний додаток для автоматизації обліку та управління складом автозапчастин з можливістю пошуку аналогів

[![React Native](https://img.shields.io/badge/React%20Native-0.73.4-blue.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## ✨ Основні можливості

### 🔧 Управління складом
- ✅ Додавання, редагування, видалення запчастин
- 📸 Фото документація кожної позиції
- 🏷️ Категоризація та артикули
- 📊 Управління залишками на складі

### 🔍 Пошук та аналітика
- 🔎 Швидкий пошук по назві, артикулу, категорії
- 🔄 Розумний пошук аналогів запчастин
- 🚗 Пошук за сумісними автомобілями
- ⭐ Обрані запчастини для швидкого доступу

### 💾 Резервне копіювання
- ☁️ Синхронізація з Google Drive
- 📤 Експорт/імпорт даних у JSON
- 🔐 Локальне зберігання даних
- 📜 Історія переглядів та змін

---

## 🚀 Швидкий старт

### Передумови
- **Node.js** 18.x або вище
- **Yarn** або **npm**
- **Android Studio** (для Android) або **Xcode** (для iOS)
- **React Native CLI**: `npm install -g react-native-cli`

### Встановлення

```bash
# 1. Клонування репозиторію
git clone https://github.com/luhobymer/Sklad-ZP.git
cd Sklad-ZP

# 2. Встановлення залежностей
yarn install
# або
npm install

# 3. Налаштування змінних середовища
cp .env.example .env
# Відредагуйте .env файл

# 4. Запуск Metro bundler
yarn start

# 5. Запуск на Android
yarn android

# 6. Запуск на iOS
yarn ios
```

### Збірка APK (Android)

```bash
# Debug версія
cd android && ./gradlew assembleDebug

# Release версія
cd android && ./gradlew assembleRelease
```

Використовуйте скрипти з папки `scripts/` для автоматизації:
- `build-apk.bat` - збірка APK
- `install-apk-emulator.bat` - встановлення на емулятор
- `launch-app-emulator.bat` - запуск емулятора

---

## 📁 Структура проекту

```
Sklad-ZP/
├── android/              # Нативний код Android
├── assets/               # Статичні ресурси (зображення, шрифти)
├── docs/                 # 📚 Документація проекту
│   ├── INDEX.md         # Навігація по документації
│   ├── ДОКУМЕНТАЦІЯ.md  # Повна документація API
│   ├── АРХІТЕКТУРА.md   # Архітектура додатку
│   └── ...
├── scripts/              # Скрипти для автоматизації
│   ├── build-apk.bat    # Збірка APK
│   ├── send-apk.ps1     # Відправка APK в Telegram
│   └── ...
├── src/                  # Вихідний код додатку
│   ├── components/      # React компоненти
│   ├── services/        # Бізнес-логіка та сервіси
│   ├── models/          # Моделі даних
│   ├── hooks/           # React hooks
│   ├── utils/           # Утиліти
│   ├── types/           # TypeScript типи
│   ├── theme/           # Стилі та тема
│   └── config/          # Конфігурація
├── tests/               # Тести
├── App.tsx              # Головний компонент
├── index.js             # Точка входу
└── package.json         # Залежності проекту
```

---

## 📚 Документація

Вся документація знаходиться в папці **[docs/](./docs/)**:

| Документ | Опис |
|----------|------|
| [INDEX.md](./docs/INDEX.md) | 📑 Навігація по документації |
| [ДОКУМЕНТАЦІЯ.md](./docs/ДОКУМЕНТАЦІЯ.md) | 📖 Повна документація API та компонентів |
| [АРХІТЕКТУРА.md](./docs/АРХІТЕКТУРА.md) | 🏗️ Архітектура та патерни проектування |
| [ТЕХНІЧНІ-ВИМОГИ.md](./docs/ТЕХНІЧНІ-ВИМОГИ.md) | ⚙️ Технічні специфікації |
| [ІНСТРУКЦІЯ_ДЛЯ_ВСТАНОВЛЕННЯ.md](./docs/ІНСТРУКЦІЯ_ДЛЯ_ВСТАНОВЛЕННЯ.md) | 🔧 Покрокове встановлення |
| [SETUP-GOOGLE-DRIVE.md](./docs/SETUP-GOOGLE-DRIVE.md) | ☁️ Налаштування Google Drive |
| [РЕКОМЕНДАЦІЇ-РОЗВИТКУ.md](./docs/РЕКОМЕНДАЦІЇ-РОЗВИТКУ.md) | 🚀 Roadmap та розвиток |
| [CHANGELOG.md](./docs/CHANGELOG.md) | 📝 Історія змін |

---

## 🛠️ Технологічний стек

### Core
- **React Native** 0.73.4 (без Expo)
- **TypeScript** 5.3.3
- **React** 18.2.0

### Навігація
- **React Navigation** 6.x
- **React Native Screens**
- **React Native Gesture Handler**

### Сховище даних
- **react-native-fs** - файлова система
- **AsyncStorage** - локальне зберігання
- **Google Drive API** - хмарне резервне копіювання

### UI/UX
- **React Native Paper** - Material Design компоненти
- **Lucide React Native** - іконки
- **React Native Modal** - модальні вікна

### Медіа
- **react-native-image-picker** - вибір фото
- **react-native-image-resizer** - оптимізація зображень
- **react-native-fast-image** - швидке завантаження

### Розробка
- **Jest** - тестування
- **ESLint** - лінтинг
- **Prettier** - форматування коду
- **Husky** - Git hooks

---

## 📱 Системні вимоги

### Android
- Android 8.0 (API 26) або вище
- Мінімум 2 ГБ RAM
- 100 МБ вільного місця

### iOS
- iOS 13.0 або вище
- iPhone 6s або новіше

### Розробка
- Node.js 18.x+
- Android Studio / Xcode
- JDK 17+

---

## 🧪 Тестування

```bash
# Запуск всіх тестів
yarn test

# Тести з покриттям
yarn test:coverage

# Тести в watch режимі
yarn test:watch
```

---

## 🤝 Внесок у проект

Ми вітаємо внесок у розвиток проекту! Перед початком роботи ознайомтесь з:
- [РЕКОМЕНДАЦІЇ-РОЗВИТКУ.md](./docs/РЕКОМЕНДАЦІЇ-РОЗВИТКУ.md)
- [АРХІТЕКТУРА.md](./docs/АРХІТЕКТУРА.md)

---

## 📞 Підтримка

- 📧 Email: luhobymer@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/luhobymer/Sklad-ZP/issues)
- 📖 Документація: [docs/INDEX.md](./docs/INDEX.md)

---

## 📄 Ліцензія

Цей проект ліцензовано під MIT License. Дивіться файл [LICENSE](LICENSE) для деталей.

---

## 🙏 Подяки

Дякуємо всім розробникам бібліотек, що використовуються в цьому проекті.

---

**Створено з ❤️ для автомобільної спільноти**
