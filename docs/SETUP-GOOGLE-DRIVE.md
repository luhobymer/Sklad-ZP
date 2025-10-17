# Налаштування інтеграції з Google Drive

Цей документ описує кроки, необхідні для налаштування інтеграції мобільного додатку "Склад Автозапчастин" з Google Drive для резервного копіювання та відновлення даних.

## Попередні вимоги

- Акаунт Google.
- Створений проект у Google Cloud Console.
- Увімкнений Google Drive API для вашого проекту.
- Отримані облікові дані OAuth 2.0 (Client ID) для Android та iOS.

## Кроки налаштування

1.  **Налаштування проекту в Google Cloud Console:**
    *   Перейдіть до [Google Cloud Console](https://console.cloud.google.com/).
    *   Створіть новий проект або виберіть існуючий.
    *   У розділі "APIs & Services" -> "Library" знайдіть та увімкніть "Google Drive API".
    *   У розділі "APIs & Services" -> "Credentials":
        *   Створіть "OAuth client ID" для Android та/або iOS.
        *   Для Android: вкажіть Package name та SHA-1 сертифікат.
        *   Для iOS: вкажіть Bundle ID.
        *   Збережіть отримані Client ID. Вони знадобляться для конфігурації додатку.

2.  **Конфігурація в мобільному додатку:**
    *   Відкрийте файл `.env` у корені проекту.
    *   Додайте або оновіть змінні середовища:
        ```
        GOOGLE_ANDROID_CLIENT_ID=ВАШ_ANDROID_CLIENT_ID
        GOOGLE_IOS_CLIENT_ID=ВАШ_IOS_CLIENT_ID
        GOOGLE_WEB_CLIENT_ID=ВАШ_WEB_CLIENT_ID (опційно)
        ```
    *   Переконайтеся, що ці змінні використовуються у `src/config/google.ts` для ініціалізації @react-native-google-signin/google-signin.

3.  **Обробка дозволів (Scopes):**
    *   Додаток використовує такі scopes:
        *   `https://www.googleapis.com/auth/drive.file` (для створення файлів та керування файлами, створеними додатком)
        *   `https://www.googleapis.com/auth/userinfo.email`
        *   `https://www.googleapis.com/auth/userinfo.profile`

4.  **Тестування:**
    *   Запустіть додаток на емуляторі/пристрої.
    *   Спробуйте виконати операцію резервного копіювання або відновлення даних, щоб перевірити коректність налаштувань та аутентифікації через Google Sign-In.

## Можливі проблеми та їх вирішення

-   **Помилка аутентифікації:** Перевірте правильність Client ID, Bundle ID/Package name, SHA-1 сертифікатів та налаштованих Redirect URI.
-   **Недостатньо дозволів:** Переконайтеся, що запитувані scopes відповідають операціям, які виконує додаток.

*(Цей документ буде доповнюватися в міру розвитку функціоналу інтеграції з Google Drive.)*
