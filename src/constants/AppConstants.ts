/**
 * Константи додатку
 */

// Ключі для AsyncStorage
const STORAGE_KEYS = {
  USER_PREFERENCES: '@UserPreferences',
  APP_SETTINGS: '@AppSettings',
  LAST_SYNC: '@LastSync',
  AUTH_TOKENS: '@AuthTokens',
  ERROR_REPORTS: '@ErrorReports',
  APP_CRASHED: '@AppCrashed',
  LAST_ERROR: '@LastError',
};

// Ключі для навігації
const ROUTES = {
  DASHBOARD: 'Dashboard',
  PARTS_LIST: 'PartsList',
  PART_DETAILS: 'PartDetails',
  PART_FORM: 'PartForm',
  VIEW_HISTORY: 'ViewHistory',
  GOOGLE_DRIVE: 'GoogleDrive',
  SETTINGS: 'Settings',
  BACKUP_MANAGER: 'BackupManager',
};

// Типи категорій запчастин
const PART_CATEGORIES = [
  'Двигун',
  'Трансмісія',
  'Ходова частина',
  'Гальмівна система',
  'Рульове керування',
  'Електрика',
  'Кузов',
  'Салон',
  'Опалення та вентиляція',
  'Фільтри',
  'ГРМ',
  'Гідравліка',
  'Паливна система',
  'Випускна система',
  'Інше',
];

// Статуси наявності
const AVAILABILITY_STATUS = {
  IN_STOCK: 'В наявності',
  LOW_STOCK: 'Закінчується',
  OUT_OF_STOCK: 'Немає в наявності',
  ON_ORDER: 'Під замовлення',
};

// Одиниці вимірювання
const UNITS = {
  PIECE: 'шт',
  SET: 'компл',
  LITER: 'л',
  KILOGRAM: 'кг',
  METER: 'м',
  PAIR: 'пара',
};

// Мінімальні вимоги до додатку
const MIN_REQUIREMENTS = {
  ANDROID_VERSION: '6.0',
  IOS_VERSION: '12.0',
  MIN_RAM: 1024, // MB
  MIN_STORAGE: 100, // MB
};

// Ліміти
const LIMITS = {
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_PARTS: 10000,
  MAX_CATEGORIES: 100,
  MAX_IMAGES_PER_PART: 10,
};

export {
  STORAGE_KEYS,
  ROUTES,
  PART_CATEGORIES,
  AVAILABILITY_STATUS,
  UNITS,
  MIN_REQUIREMENTS,
  LIMITS,
};
