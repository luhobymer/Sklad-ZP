/**
 * Файл для ініціалізації всіх сервісів додатку
 */

import FileStorageService from './FileStorageService';
import imageOptimizationService from './ImageOptimizationService';
import { FirebaseService } from './FirebaseService';
import { Logger } from '../utils/logger';

// Створюємо логер для ініціалізації сервісів
const logger = new Logger({ name: 'ServiceInitializer' });

/**
 * Ініціалізує всі сервіси додатку
 */
export const initializeServices = async (): Promise<void> => {
  try {
    logger.info('Початок ініціалізації сервісів...');
    
    // Ініціалізуємо сервіс файлового сховища
    const fileStorageService = FileStorageService.getInstance();
    await fileStorageService.initialize();
    logger.info('FileStorageService ініціалізовано');
    
    // Ініціалізуємо сервіс оптимізації зображень
    await imageOptimizationService.initialize();
    logger.info('ImageOptimizationService ініціалізовано');
    
    // Ініціалізуємо Firebase Crashlytics
    await FirebaseService.getInstance().initialize();
    logger.info('FirebaseService ініціалізовано');
    
    // Тут можна додати ініціалізацію інших сервісів
    
    logger.info('Всі сервіси успішно ініціалізовано');
  } catch (error) {
    logger.error('Помилка при ініціалізації сервісів:', error);
    throw error;
  }
};

/**
 * Очищує кеш всіх сервісів
 */
export const clearServicesCache = async (): Promise<void> => {
  try {
    logger.info('Початок очищення кешу сервісів...');
    
    // Очищуємо кеш сервісу оптимізації зображень
    await imageOptimizationService.clearCache();
    logger.info('Кеш ImageOptimizationService очищено');
    
    // Тут можна додати очищення кешу інших сервісів
    
    logger.info('Кеш всіх сервісів успішно очищено');
  } catch (error) {
    logger.error('Помилка при очищенні кешу сервісів:', error);
    throw error;
  }
};

export default {
  initializeServices,
  clearServicesCache
};