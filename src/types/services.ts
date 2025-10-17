import { Part } from '../models/Part';
import { TextRecognitionResult, TextRecognitionOptions } from './api';
export type { TextRecognitionResult, TextRecognitionOptions } from './api';
import { DriveFile } from './drive';

/**
 * Тип для параметрів пошуку запчастин
 */
export interface SearchParams {
  query?: string;
  category?: string;
  manufacturer?: string;
  type?: string;
  model?: string;
  dimensions?: string;
  priceRange?: { min: number; max: number };
  isNew?: boolean;
  inStock?: boolean;
}

/**
 * Тип для аналогів запчастин
 */
export type AnalogPart = string | { id: number };

/**
 * Інтерфейс для FileStorageService
 */
export interface FileStorageServiceInterface {
  // Отримання екземпляру (патерн Singleton)
  getInstance(): FileStorageServiceInterface;
  
  // Ініціалізація
  initialize(): Promise<void>;
  
  // Операції з запчастинами
  getAllParts(): Promise<Part[]>;
  addPart(part: Omit<Part, 'id'>): Promise<number>;
  updatePart(part: Part): Promise<void>;
  deletePart(id: number): Promise<void>;
  getPartById(id: number): Promise<Part | undefined>;
  
  // Пошук запчастин
  searchParts(params: SearchParams): Promise<Part[]>;
  findByArticle(articleNumber: string): Promise<Part | null>;
  
  // Історія переглядів
  addToViewHistory(partId: number): Promise<void>;
  getViewHistory(): Promise<Part[]>;
  clearViewHistory(): Promise<void>;
  
  // Обрані запчастини
  addToFavorites(partId: number): Promise<void>;
  removeFromFavorites(partId: number): Promise<void>;
  getFavorites(): Promise<Part[]>;
  isFavorite(partId: number): Promise<boolean>;
  
  // Унікальні значення
  getUniqueCategories(): Promise<string[]>;
  getUniqueManufacturers(): Promise<string[]>;
  getUniqueTypes(): Promise<string[]>;
  getUniqueModels(): Promise<string[]>;
  getUniqueDimensions(): Promise<string[]>;
  
  // Аналоги
  getAnalogs(part: Part): Promise<Part[]>;
  
  // Очищення даних
  clearAllData(): Promise<void>;
  clearAllParts(): Promise<void>;
  clearAllFavorites(): Promise<void>;
}

/**
 * Інтерфейс для результатів файлових операцій
 */
export interface FileOperationResult<T = unknown> {
  /** Успішність операції */
  success: boolean;
  /** Повідомлення про помилку, якщо виникла */
  error?: string;
  /** Дані, повернуті операцією */
  data?: T;
  /** Час виконання операції в мілісекундах */
  executionTimeMs?: number;
}

/**
 * Інтерфейс для бекапу даних
 */
export interface BackupData {
  parts: Part[];
  viewHistory: number[];
  favorites: number[];
  version: string;
  createdAt: string;
}



/**
 * Інтерфейс для результату вилучення інформації про запчастину
 */
export interface PartExtractionResult {
  /** Успішність вилучення інформації */
  success: boolean;
  /** Часткові дані про запчастину */
  part: Partial<Part> | null;
  /** Повідомлення про помилку, якщо виникла */
  error?: string;
  /** Загальна впевненість вилучення інформації (0-1) */
  confidence?: number;
  /** Оригінальний розпізнаний текст */
  originalText?: string;
  /** Дата та час вилучення інформації */
  extractionDate?: Date;
  /** Час обробки в мілісекундах */
  processingTimeMs?: number;
}

/**
 * Опції для вилучення інформації про запчастину
 */
export interface PartExtractionOptions {
  /**
   * Чи зберігати оригінальний текст у результаті
   * @default true
   */
  saveOriginalText?: boolean;
  
  /**
   * Мінімальний рівень впевненості для включення результатів (0-1)
   * @default 0.5
   */
  minConfidence?: number;
  
  /**
   * Чи вилучати артикул
   * @default true
   */
  extractArticleNumber?: boolean;
  
  /**
   * Чи вилучати назву запчастини
   * @default true
   */
  extractName?: boolean;
  
  /**
   * Чи вилучати виробника
   * @default true
   */
  extractManufacturer?: boolean;
  
  /**
   * Чи вилучати ціну
   * @default true
   */
  extractPrice?: boolean;
  /**
   * Чи вилучати категорію запчастини
   * @default true
   */
  extractCategory?: boolean;
  
  /**
   * Чи вилучати кількість
   * @default true
   */
  extractQuantity?: boolean;
}

/**
 * Інтерфейс для TextRecognitionService
 */
export interface TextRecognitionServiceInterface {
  // Розпізнавання тексту з зображення
  recognizeText(imageUri: string, options?: TextRecognitionOptions): Promise<TextRecognitionResult>;
  
  // Витягування інформації про запчастину з тексту
  extractPartInfo(text: string, options?: PartExtractionOptions): Promise<PartExtractionResult>;
  
  // Обробка зображення та витягування інформації
  processImageAndExtractInfo(imageUri: string, options?: PartExtractionOptions): Promise<PartExtractionResult>;
  
  // Оптимізація зображення для кращого розпізнавання
  optimizeImageForRecognition(imageUri: string): Promise<string>;
}

/**
 * Інтерфейс для метаданих резервної копії
 */
export interface BackupMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  size: number;
  sizeFormatted: string;
  fileId: string; // ID файлу на Google Drive або іншому сховищі
  version: string; // Версія формату бекапу
  appVersion: string; // Версія додатку, що створив бекап
  deviceInfo: {
    os: string;
    osVersion: string;
    model: string;
    manufacturer: string;
  };
  partsCount: number;
  customData?: Record<string, any>;
}

/**
 * Інтерфейс для BackupService
 */
export interface BackupServiceInterface {
  // Ініціалізація
  initialize(): Promise<boolean>;
  
  // Створення резервної копії
  createBackup(name?: string): Promise<string>;
  
  // Завантаження резервної копії на Google Drive
  uploadBackupToDrive(localPath: string, name?: string): Promise<string>;
  
  // Отримання списку резервних копій
  getLocalBackups(): Promise<string[]>;
  getDriveBackups(): Promise<DriveFile[]>;
  
  // Відновлення з резервної копії
  restoreFromLocalBackup(backupPath: string): Promise<boolean>;
  restoreFromDriveBackup(fileId: string): Promise<boolean>;
  
  // Видалення резервних копій
  deleteLocalBackup(backupPath: string): Promise<boolean>;
  deleteDriveBackup(fileId: string): Promise<boolean>;
  
  // Експорт та імпорт резервних копій
  exportBackup(backupPath: string): Promise<boolean>;
  importBackup(): Promise<string | null>;
}

/**
 * Інтерфейс для AnalogService
 */
export interface AnalogServiceInterface {
  // Пошук аналогів за артикулом
  findAnalogsByArticle(articleNumber: string): Promise<Part[]>;
  
  // Пошук аналогів за виробником
  findAnalogsByManufacturer(manufacturer: string, type: string): Promise<Part[]>;
  
  // Пошук аналогів за параметрами
  findAnalogsByParameters(part: Part, similarityThreshold?: number): Promise<{part: Part, similarity: number}[]>;
}

/**
 * Інтерфейс для GoogleDriveService
 */
export interface GoogleDriveServiceInterface {
  // Ініціалізація та авторизація
  initialize(): Promise<boolean>;
  isAuthorized(): Promise<boolean>;
  authorize(): Promise<boolean>;
  
  // Операції з файлами
  uploadFile(localPath: string, fileName: string): Promise<string>;
  downloadFile(fileId: string, localPath: string): Promise<void>;
  deleteFile(fileId: string): Promise<void>;
  
  // Отримання списку файлів
  getBackupsList(): Promise<DriveFile[]>;
  
  // Створення та керування папками
  createFolder(name: string): Promise<string>;
  getFolderContents(folderId: string): Promise<DriveFile[]>;
}
