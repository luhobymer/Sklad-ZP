/**
 * Конфігурація додатку
 */

export default {
  // Загальні налаштування
  appName: 'Склад ЗП',
  appVersion: '1.1.0',
  
  // Шляхи до файлів
  paths: {
    database: 'database.json',
    backupFolder: 'backups',
    tempFolder: 'temp',
    imagesFolder: 'images',
  },
  
  // Налаштування резервного копіювання
  backup: {
    maxBackups: 30, // Максимальна кількість збережених резервних копій
    autoBackup: true, // Автоматичне створення резервних копій
    backupInterval: 24 * 60 * 60 * 1000, // Інтервал автоматичного резервного копіювання (24 години)
  },
  
  // Налаштування синхронізації з хмарою
  sync: {
    enabled: true,
    autoSync: true,
    syncInterval: 15 * 60 * 1000, // Інтервал синхронізації (15 хвилин)
  },
  
  // Налаштування для камери
  camera: {
    quality: 0.8, // Якість зображення (від 0 до 1)
    maxWidth: 1024, // Максимальна ширина зображення
    maxHeight: 1024, // Максимальна висота зображення
  },
  
  // Налаштування для розпізнавання тексту
  textRecognition: {
    languages: ['uk', 'en', 'ru'], // Мови для розпізнавання
    confidenceThreshold: 0.7, // Поріг впевненості для розпізнавання
  },
  
  // Налаштування для пошуку аналогів
  analogSearch: {
    enabled: true,
    minSimilarity: 0.7, // Мінімальна схожість для знаходження аналогів
  },
  
  // Налаштування логування
  logging: {
    enabled: true,
    level: 'debug', // 'error', 'warn', 'info', 'debug', 'verbose'
    maxFileSize: 5 * 1024 * 1024, // Максимальний розмір файлу логу (5 МБ)
    maxFiles: 10, // Максимальна кількість файлів логу
  },
  
  // Налаштування тем
  theme: {
    default: 'light', // 'light' або 'dark'
    colors: {
      primary: '#007AFF',
      background: '#FFFFFF',
      card: '#FFFFFF',
      text: '#000000',
      border: '#E5E5E9',
      notification: '#FF3B30',
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
      info: '#5AC8FA',
    },
  },
};
