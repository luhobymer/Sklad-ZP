import { Part, PartAnalog, isPartInStock, createPartAnalog } from '../models/Part';
import fileStorageServiceInstance from './FileStorageService'; // Імпортуємо клас, а не екземпляр
import { AnalogServiceInterface, FileStorageServiceInterface } from '../types/services'; // Додаємо FileStorageServiceInterface
import { analogLogger as logger } from '../utils/logger';

/**
 * Інтерфейс для результату пошуку аналогів з оцінкою схожості
 */
export interface AnalogWithSimilarity {
  part: Part;
  similarity: number;
}

/**
 * Інтерфейс для результату пошуку аналогів з детальною інформацією
 */
export interface AnalogSearchResult {
  originalPart: Part;
  analogs: PartAnalog[];
  searchCriteria: AnalogSearchCriteria;
  timestamp: Date;
}

/**
 * Критерії пошуку аналогів
 */
export interface AnalogSearchCriteria {
  articleNumber?: string;
  manufacturer?: string;
  type?: string;
  model?: string;
  dimensions?: string;
  similarityThreshold?: number;
  inStockOnly?: boolean;
}

/**
 * Інтерфейс для ваг параметрів при розрахунку схожості
 */
interface SimilarityWeights {
  category: number;
  type: number;
  model: number;
  manufacturer: number;
  price: number;
  dimensions: number;
}

class AnalogService implements AnalogServiceInterface {
  private static instance: AnalogService;
  private storageService: FileStorageServiceInterface; // Використовуємо інтерфейс для типізації

  private constructor() {
    this.storageService = fileStorageServiceInstance;
  }

  public static getInstance(): AnalogService {
    if (!AnalogService.instance) {
      AnalogService.instance = new AnalogService();
    }
    return AnalogService.instance;
  }

  /**
   * Пошук аналогів запчастини за артикулом
   * @param articleNumber Артикул запчастини
   * @param inStockOnly Шукати лише серед запчастин в наявності
   * @returns Масив аналогів запчастини
   */
  public async findAnalogsByArticle(articleNumber: string, inStockOnly = false): Promise<Part[]> {
    try {
      // Отримуємо всі запчастини
      const allParts = await this.storageService.getAllParts();
      
      // Знаходимо оригінальну запчастину за артикулом
      const originalPart = allParts.find((part: Part) => part.articleNumber === articleNumber);
      
      if (!originalPart) {
        return [];
      }

      // Шукаємо аналоги за категорією, типом та моделлю
      const analogs = allParts.filter((part: Part) => 
        part.id !== originalPart?.id &&
        part.category === originalPart?.category &&
        (part.type === originalPart?.type || !originalPart?.type) &&
        (part.model === originalPart?.model || !originalPart?.model) &&
        (!inStockOnly || isPartInStock(part))
      );
      
      // Зберігаємо аналоги в оригінальній запчастині
      if (analogs.length > 0 && originalPart) {
        originalPart.analogs = analogs.map((analog: Part) => createPartAnalog(originalPart, {
          id: analog.id,
          articleNumber: analog.articleNumber,
          name: analog.name,
          manufacturer: analog.manufacturer,
          price: analog.price,
          isAvailable: isPartInStock(analog),
          compatibilityScore: 100, // Точна відповідність за артикулом
          originalPartId: originalPart.id
        }));
        
        // Оновлюємо запчастину в сховищі
        await this.storageService.updatePart(originalPart);
      }

      return analogs;
    } catch (error) {
      logger.error('Помилка при пошуку аналогів за артикулом:', error);
      throw error;
    }
  }

  /**
   * Пошук аналогів запчастини за виробником
   * @param manufacturer Виробник запчастини
   * @param type Тип запчастини
   * @param inStockOnly Шукати лише серед запчастин в наявності
   * @returns Масив аналогів запчастини
   */
  public async findAnalogsByManufacturer(manufacturer: string, type: string, inStockOnly = false): Promise<Part[]> {
    try {
      // Отримуємо всі запчастини
      const allParts = await this.storageService.getAllParts();
      
      // Шукаємо аналоги за типом, виключаючи вказаного виробника
      const analogs = allParts.filter((part: Part) => 
        part.type === type && 
        part.manufacturer !== manufacturer &&
        part.type !== undefined && // Переконуємося, що тип визначений
        (!inStockOnly || isPartInStock(part))
      );

      return analogs;
    } catch (error) {
      logger.error('Помилка при пошуку аналогів за виробником:', error);
      throw error;
    }
  }

  /**
   * Пошук аналогів запчастини за параметрами
   * @param part Запчастина для пошуку аналогів
   * @param similarityThreshold Поріг схожості (від 0 до 1)
   * @param inStockOnly Шукати лише серед запчастин в наявності
   * @returns Масив аналогів запчастини з оцінкою схожості
   */
  public async findAnalogsByParameters(part: Part, similarityThreshold = 0.7, inStockOnly = false): Promise<AnalogWithSimilarity[]> {
    try {
      // Отримуємо всі запчастини
      const allParts = await this.storageService.getAllParts();
      
      // Фільтруємо запчастини того ж типу, виключаючи поточну
      const potentialAnalogs = allParts.filter((p: Part) => 
        p.id !== part.id && 
        p.type !== undefined && 
        part.type !== undefined && 
        p.type === part.type &&
        (!inStockOnly || isPartInStock(p))
      );

      // Розраховуємо схожість для кожного потенційного аналога
      const analogsWithSimilarity: AnalogWithSimilarity[] = potentialAnalogs.map((analog: Part) => {
        const similarity = this.calculateSimilarity(part, analog);
        return { part: analog, similarity };
      });

      // Фільтруємо аналоги за порогом схожості та сортуємо за спаданням схожості
      const result = analogsWithSimilarity
        .filter(item => item.similarity >= similarityThreshold)
        .sort((a, b) => b.similarity - a.similarity);
      
      // Зберігаємо аналоги в оригінальній запчастині
      if (result.length > 0) {
        part.analogs = result.map(item => createPartAnalog(part, {
          id: item.part.id,
          articleNumber: item.part.articleNumber,
          name: item.part.name,
          manufacturer: item.part.manufacturer,
          price: item.part.price,
          isAvailable: isPartInStock(item.part),
          compatibilityScore: Math.round(item.similarity * 100), // Конвертуємо у відсотки
          originalPartId: part.id
        }));
        
        // Оновлюємо запчастину в сховищі
        await this.storageService.updatePart(part);
      }
      
      return result;
    } catch (error) {
      logger.error('Помилка при пошуку аналогів за параметрами:', error);
      throw error;
    }
  }

  /**
   * Розрахунок схожості між двома запчастинами
   * @param original Оригінальна запчастина
   * @param analog Потенційний аналог
   * @returns Оцінка схожості (від 0 до 1)
   */
  private calculateSimilarity(original: Part, analog: Part): number {
    let totalWeight = 0;
    let weightedSimilarity = 0;

    // Ваги для різних параметрів
    const weights: SimilarityWeights = {
      category: 0.2,
      type: 0.3,
      model: 0.15,
      manufacturer: 0.1,
      price: 0.1,
      dimensions: 0.15
    };

    // Порівняння категорії
    if (original.category === analog.category) {
      weightedSimilarity += weights.category;
    }
    totalWeight += weights.category;

    // Порівняння типу
    if (original.type && analog.type && original.type === analog.type) {
      weightedSimilarity += weights.type;
    }
    totalWeight += weights.type;

    // Порівняння моделі
    if (original.model && analog.model && original.model === analog.model) {
      weightedSimilarity += weights.model;
    }
    totalWeight += weights.model;

    // Порівняння виробника (менша вага, оскільки аналоги часто від різних виробників)
    if (original.manufacturer === analog.manufacturer) {
      weightedSimilarity += weights.manufacturer;
    }
    totalWeight += weights.manufacturer;

    // Порівняння ціни (схожість на основі різниці в ціні)
    const originalPrice = parseFloat(original.price.toString());
    const analogPrice = parseFloat(analog.price.toString());
    if (!isNaN(originalPrice) && !isNaN(analogPrice) && originalPrice > 0) {
      const priceDifference = Math.abs(originalPrice - analogPrice) / originalPrice;
      const priceSimilarity = Math.max(0, 1 - priceDifference); // Від 0 до 1
      weightedSimilarity += weights.price * priceSimilarity;
    }
    totalWeight += weights.price;

    // Порівняння розмірів (якщо доступні)
    if (original.dimensions && analog.dimensions) {
      const dimensionSimilarity = this.compareDimensions(original.dimensions, analog.dimensions);
      weightedSimilarity += weights.dimensions * dimensionSimilarity;
    }
    totalWeight += weights.dimensions;

    // Нормалізація результату
    return totalWeight > 0 ? weightedSimilarity / totalWeight : 0;
  }

  /**
   * Порівняння розмірів двох запчастин
   * @param originalDimensions Розміри оригінальної запчастини
   * @param analogDimensions Розміри аналога
   * @returns Оцінка схожості розмірів (від 0 до 1)
   */
  private compareDimensions(originalDimensions: string | undefined, analogDimensions: string | undefined): number {
    if (!originalDimensions || !analogDimensions) {
      return 0; // Неможливо порівняти, якщо розміри не вказані
    }
    try {
      // Парсимо розміри у форматі "ШxВxГ" або подібному
      const originalParts = originalDimensions.split('x').map(part => parseFloat(part.trim()));
      const analogParts = analogDimensions.split('x').map(part => parseFloat(part.trim()));

      if (originalParts.length !== analogParts.length || originalParts.some(isNaN) || analogParts.some(isNaN)) {
        return 0; // Неможливо порівняти
      }

      // Розраховуємо середню відносну різницю
      let totalDifference = 0;
      for (let i = 0; i < originalParts.length; i++) {
        if (originalParts[i] > 0) {
          totalDifference += Math.abs(originalParts[i] - analogParts[i]) / originalParts[i];
        }
      }

      const averageDifference = totalDifference / originalParts.length;
      return Math.max(0, 1 - averageDifference); // Від 0 до 1
    } catch (error) {
      return 0; // У випадку помилки вважаємо, що розміри не співпадають
    }
  }

  /**
   * Зберігає результати пошуку аналогів
   * @param result Результат пошуку аналогів
   * @returns Ідентифікатор збереженого результату
   */
  public async saveAnalogSearchResult(result: AnalogSearchResult): Promise<string> {
    try {
      // Тут можна додати логіку для збереження результатів пошуку
      // Наприклад, зберігати в локальному сховищі або відправляти на сервер
      logger.info(`Збережено результат пошуку аналогів для запчастини ${result.originalPart.id}`);
      return `analog_search_${Date.now()}`;
    } catch (error) {
      logger.error('Помилка при збереженні результатів пошуку аналогів:', error);
      throw error;
    }
  }
}

export default AnalogService;
