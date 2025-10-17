import FastImage from 'react-native-fast-image';
import ImageResizer from 'react-native-image-resizer';
import * as RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import { Logger } from '../utils/logger';

// Створюємо логер для сервісу оптимізації зображень
const logger = new Logger({ name: 'ImageOptimizationService' });

// Директорія для кешування мініатюр
const THUMBNAILS_DIRECTORY = `${RNFS.DocumentDirectoryPath}/thumbnails/`;

// Типи для налаштувань оптимізації зображень
export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'JPEG' | 'PNG' | 'WEBP';
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  thumbnailQuality?: number;
  thumbnailFormat?: 'JPEG' | 'PNG' | 'WEBP';
  resizeMode?: 'contain' | 'cover' | 'stretch';
  onlyScaleDown?: boolean;
}

// Типи для результату оптимізації зображень
export interface OptimizedImageResult {
  originalUri: string;
  optimizedUri: string;
  thumbnailUri?: string;
  width: number;
  height: number;
  size: number;
  format: string;
}

// Типи для налаштувань кешування
export interface CacheSettings {
  cacheControl?: 'immutable' | 'web' | 'cacheOnly';
  priority?: 'low' | 'normal' | 'high';
}

/**
 * Сервіс для оптимізації та кешування зображень
 */
export class ImageOptimizationService {
  private static instance: ImageOptimizationService | null = null;
  private isInitialized = false;
  private preloadedImages: Set<string> = new Set();

  /**
   * Отримання екземпляру сервісу (Singleton)
   */
  public static getInstance(): ImageOptimizationService {
    if (!ImageOptimizationService.instance) {
      ImageOptimizationService.instance = new ImageOptimizationService();
    }
    return ImageOptimizationService.instance;
  }

  private constructor() {}

  /**
   * Ініціалізація сервісу
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Перевіряємо наявність директорії для мініатюр
      const dirExists = await RNFS.exists(THUMBNAILS_DIRECTORY);
      if (!dirExists) {
        await RNFS.mkdir(THUMBNAILS_DIRECTORY);
        logger.info(`Створено директорію для мініатюр: ${THUMBNAILS_DIRECTORY}`);
      }

      this.isInitialized = true;
      logger.info('ImageOptimizationService ініціалізовано');
    } catch (error) {
      logger.error('Помилка при ініціалізації ImageOptimizationService:', error);
      throw error;
    }
  }

  /**
   * Оптимізація зображення
   * @param imageUri URI зображення
   * @param options Опції оптимізації
   * @returns Promise з результатом оптимізації
   */
  public async optimizeImage(imageUri: string, options?: ImageOptimizationOptions): Promise<OptimizedImageResult> {
    await this.initialize();

    try {
      const defaultOptions = {
        width: 1200,
        height: 1200,
        quality: 80,
        format: 'JPEG' as const,
        resizeMode: 'contain' as const,
        onlyScaleDown: true,
      };

      const mergedOptions = { ...defaultOptions, ...options };

      logger.info('Оптимізація зображення:', imageUri);

      // Видаляємо префікс file:// якщо він є
      const cleanImageUri = imageUri.startsWith('file://') ? imageUri.substring(7) : imageUri;

      // Отримуємо інформацію про файл
      const fileInfo = await RNFS.stat(cleanImageUri);

      // Застосовуємо оптимізацію до зображення
      const result = await ImageResizer.createResizedImage(
        cleanImageUri,
        mergedOptions.width,
        mergedOptions.height,
        mergedOptions.format as any,
        mergedOptions.quality,
        0, // rotation
        undefined, // outputPath (якщо не вказано, зберігається в тимчасовій директорії)
        false, // keepMeta
        { 
          mode: mergedOptions.resizeMode, 
          onlyScaleDown: mergedOptions.onlyScaleDown 
        }
      );

      // Створюємо мініатюру, якщо вказані розміри
      let thumbnailUri: string | undefined;
      if (options?.thumbnailWidth && options?.thumbnailHeight) {
        const thumbnailResult = await this.createThumbnail(
          result.uri,
          options.thumbnailWidth,
          options.thumbnailHeight,
          options.thumbnailQuality || 70,
          options.thumbnailFormat || 'JPEG'
        );
        thumbnailUri = thumbnailResult;
      }

      logger.info('Зображення оптимізовано:', result.uri);

      // Прекешуємо зображення для FastImage
      this.preloadImage(result.uri);
      if (thumbnailUri) {
        this.preloadImage(thumbnailUri);
      }

      return {
        originalUri: imageUri,
        optimizedUri: result.uri,
        thumbnailUri,
        width: result.width,
        height: result.height,
        size: (fileInfo as any).size || 0,
        format: mergedOptions.format,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Помилка оптимізації зображення:', errorMessage);
      
      // Повертаємо оригінальний URI у випадку помилки
      return {
        originalUri: imageUri,
        optimizedUri: imageUri,
        width: 0,
        height: 0,
        size: 0,
        format: 'unknown',
      };
    }
  }

  /**
   * Створення мініатюри зображення
   * @param imageUri URI зображення
   * @param width Ширина мініатюри
   * @param height Висота мініатюри
   * @param quality Якість мініатюри (0-100)
   * @param format Формат мініатюри
   * @returns Promise з URI мініатюри
   */
  public async createThumbnail(
    imageUri: string,
    width: number,
    height: number,
    quality: number = 70,
    format: 'JPEG' | 'PNG' | 'WEBP' = 'JPEG'
  ): Promise<string> {
    await this.initialize();

    try {
      // Генеруємо унікальне ім'я файлу для мініатюри на основі оригінального URI
      const fileName = this.generateThumbnailFileName(imageUri, width, height, format);
      const thumbnailPath = `${THUMBNAILS_DIRECTORY}${fileName}`;

      // Перевіряємо, чи існує вже мініатюра
      const thumbnailExists = await RNFS.exists(thumbnailPath);
      if (thumbnailExists) {
        logger.info('Мініатюра вже існує:', thumbnailPath);
        return thumbnailPath;
      }

      // Видаляємо префікс file:// якщо він є
      const cleanImageUri = imageUri.startsWith('file://') ? imageUri.substring(7) : imageUri;

      // Створюємо мініатюру
      const result = await ImageResizer.createResizedImage(
        cleanImageUri,
        width,
        height,
        format as any,
        quality,
        0, // rotation
        thumbnailPath, // outputPath
        false, // keepMeta
        { mode: 'cover', onlyScaleDown: false }
      );

      logger.info('Мініатюру створено:', result.uri);
      return result.uri;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Помилка створення мініатюри:', errorMessage);
      return imageUri; // Повертаємо оригінальний URI у випадку помилки
    }
  }

  /**
   * Прекешування зображення для FastImage
   * @param imageUri URI зображення
   * @param cacheSettings Налаштування кешування
   */
  public preloadImage(imageUri: string, cacheSettings?: CacheSettings): void {
    if (!imageUri || this.preloadedImages.has(imageUri)) {
      return;
    }

    try {
      const source = {
        uri: imageUri,
        priority: FastImage.priority[cacheSettings?.priority || 'normal'],
        cache: FastImage.cacheControl[cacheSettings?.cacheControl || 'immutable'],
      };

      FastImage.preload([source]);
      this.preloadedImages.add(imageUri);
      logger.info('Зображення прекешовано:', imageUri);
    } catch (error) {
      logger.error('Помилка прекешування зображення:', error);
    }
  }

  /**
   * Очищення кешу зображень
   */
  public async clearCache(): Promise<void> {
    await this.initialize();

    try {
      // Очищаємо кеш FastImage
      FastImage.clearMemoryCache();
      FastImage.clearDiskCache();

      // Очищаємо директорію з мініатюрами
      const files = await RNFS.readDir(THUMBNAILS_DIRECTORY);
      for (const file of files) {
        await RNFS.unlink(file.path);
      }

      this.preloadedImages.clear();
      logger.info('Кеш зображень очищено');
    } catch (error) {
      logger.error('Помилка при очищенні кешу зображень:', error);
      throw error;
    }
  }

  /**
   * Генерація імені файлу для мініатюри
   * @param imageUri URI зображення
   * @param width Ширина мініатюри
   * @param height Висота мініатюри
   * @param format Формат мініатюри
   * @returns Ім'я файлу для мініатюри
   */
  private generateThumbnailFileName(imageUri: string, width: number, height: number, format: string): string {
    // Створюємо хеш на основі URI та розмірів
    const hash = this.simpleHash(imageUri + width + height + format);
    const extension = format.toLowerCase();
    return `thumb_${hash}.${extension}`;
  }

  /**
   * Простий хеш для генерації імен файлів
   * @param str Рядок для хешування
   * @returns Хеш-значення
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }
}

// Експортуємо екземпляр сервісу
const imageOptimizationService = ImageOptimizationService.getInstance();
export default imageOptimizationService;