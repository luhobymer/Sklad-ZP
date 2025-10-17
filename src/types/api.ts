/**
 * Типи для роботи з Google Drive API
 */

/**
 * Конфігурація автентифікації Google
 */
export interface GoogleAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

/**
 * Токен доступу Google API
 */
export interface GoogleAuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  expiryDate: number;
  tokenType: string;
}

/**
 * Відповідь від Google Drive API при завантаженні файлу
 */
export interface GoogleDriveUploadResponse {
  id: string;
  name: string;
  mimeType: string;
  kind: string;
  createdTime: string;
  modifiedTime: string;
}

/**
 * Інформація про файл в Google Drive
 */
export interface GoogleDriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
}

/**
 * Результат пошуку файлів в Google Drive
 */
export interface GoogleDriveSearchResult {
  files: GoogleDriveFileInfo[];
  nextPageToken?: string;
}

/**
 * Параметри запиту до Google Drive API
 */
export interface GoogleDriveRequestParams {
  fields?: string;
  q?: string;
  spaces?: string;
  pageToken?: string;
  pageSize?: number;
  orderBy?: string;
}

/**
 * Опції для завантаження файлу в Google Drive
 */
export interface GoogleDriveUploadOptions {
  name: string;
  mimeType: string;
  content: string | Blob;
  parents?: string[];
}

/**
 * Опції для завантаження файлу з Google Drive
 */
export interface GoogleDriveDownloadOptions {
  fileId: string;
  destination?: string;
}

/**
 * Результат завантаження файлу з Google Drive
 */
export interface GoogleDriveDownloadResult {
  fileId: string;
  fileName: string;
  content: Blob | string;
  mimeType: string;
  localPath?: string;
}

/**
 * Типи для роботи з API розпізнавання тексту
 */

/**
 * Результат розпізнавання тексту
 */
export interface TextRecognitionResult {
  /** Розпізнаний текст */
  text: string;
  /** Блоки тексту */
  blocks?: TextBlock[];
  /** Загальна впевненість розпізнавання (0-1) */
  confidence?: number;
  /** Успішність розпізнавання */
  success?: boolean;
  /** Повідомлення про помилку, якщо виникла */
  error?: string;
  /** Мова розпізнаного тексту */
  language?: string;
  /** Час обробки в мілісекундах */
  processingTimeMs?: number;
  /** Дата та час розпізнавання */
  recognitionDate?: Date;
  /** Обмежувальна рамка всього тексту */
  boundingBox?: BoundingBox;
}

/**
 * Блок тексту в результаті розпізнавання
 */
export interface TextBlock {
  /** Текст блоку */
  text: string;
  /** Впевненість розпізнавання блоку (0-1) */
  confidence?: number;
  /** Обмежувальна рамка блоку */
  boundingBox?: BoundingBox;
  /** Рядки тексту в блоці */
  lines?: TextLine[];
  /** Мова блоку */
  language?: string;
}

/**
 * Рядок тексту в блоці
 */
export interface TextLine {
  /** Текст рядка */
  text: string;
  /** Впевненість розпізнавання рядка (0-1) */
  confidence?: number;
  /** Обмежувальна рамка рядка */
  boundingBox?: BoundingBox;
  /** Слова в рядку */
  words?: TextWord[];
  /** Кут нахилу рядка в градусах */
  angle?: number;
}

/**
 * Слово в рядку
 */
export interface TextWord {
  /** Текст слова */
  text: string;
  /** Впевненість розпізнавання слова (0-1) */
  confidence?: number;
  /** Обмежувальна рамка слова */
  boundingBox?: BoundingBox;
  /** Символи в слові */
  symbols?: TextSymbol[];
}

/**
 * Символ в слові
 */
export interface TextSymbol {
  /** Символ */
  text: string;
  /** Впевненість розпізнавання символу (0-1) */
  confidence?: number;
  /** Обмежувальна рамка символу */
  boundingBox?: BoundingBox;
}

/**
 * Слово в рядку
 */
export interface TextWord {
  /** Текст слова */
  text: string;
  /** Впевненість розпізнавання слова (0-1) */
  confidence?: number;
  /** Обмежувальна рамка слова */
  boundingBox?: BoundingBox;
  /** Символи в слові */
  symbols?: TextSymbol[];
}

/**
 * Обмежувальна рамка для елементів розпізнаного тексту
 */
export interface BoundingBox {
  /** Координата X лівого верхнього кута */
  x: number;
  /** Координата Y лівого верхнього кута */
  y: number;
  /** Ширина рамки */
  width: number;
  /** Висота рамки */
  height: number;
  /** Кут повороту в градусах */
  angle?: number;
  /** Координати всіх чотирьох кутів рамки */
  points?: { x: number; y: number }[];
  /** Додаткові властивості рамки */
  properties?: Record<string, unknown>;
}

/**
 * Опції для розпізнавання тексту
 */
export interface TextRecognitionOptions {
  /** Мова для розпізнавання (uk, en, ru, тощо) */
  language?: string;
  /** Автоматично виявляти орієнтацію тексту */
  detectOrientation?: boolean;
  /** Масштаб зображення для розпізнавання (1.0 = оригінальний розмір) */
  scale?: number;
  /** Список дозволених символів */
  allowlist?: string;
  /** Список заборонених символів */
  denylist?: string;
  /** Розпізнавати лише текст, без структурних елементів */
  textOnly?: boolean;
  /** Мінімальний рівень впевненості для включення тексту в результат (0-1) */
  minConfidence?: number;
  /** Оптимізувати зображення перед розпізнаванням */
  optimizeImage?: boolean;
}
