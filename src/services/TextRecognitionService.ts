import * as RNFS from 'react-native-fs';
import { Image } from 'react-native';
import { Part } from '../models/Part';
import { TextRecognitionServiceInterface, PartExtractionResult, PartExtractionOptions } from '../types/services';
import { textRecognitionLogger as logger } from '../utils/logger';
import ImageResizer from 'react-native-image-resizer';

/**
 * Інтерфейс для текстового розпізнавача
 */
interface TextRecognizer {
  /**
   * Обробка зображення для розпізнавання тексту
   * @param imageUri URI зображення для обробки
   * @param options Опції розпізнавання
   * @returns Promise з результатом розпізнавання
   */
  processImage(imageUri: string, options?: TextRecognitionOptions): Promise<TextRecognitionResult>;
}

/**
 * Тип для параметрів обробки зображення
 */
interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'JPEG' | 'PNG' | 'WEBP';
}

/**
 * Опції для розпізнавання тексту
 */
interface TextRecognitionOptions {
  /** Мова розпізнавання (за замовчуванням 'uk') */
  language?: string;
  /** Чи використовувати оптимізацію зображення перед розпізнаванням */
  optimizeImage?: boolean;
  /** Чи розпізнавати тільки текст (без структурування) */
  textOnly?: boolean;
  /** Мінімальна впевненість для розпізнаних блоків тексту */
  minConfidence?: number;
}

/**
 * Блок розпізнаного тексту
 */
interface TextBlock {
  /** Текст блоку */
  text: string;
  /** Впевненість розпізнавання блоку (0-1) */
  confidence?: number;
  /** Обмежувальна рамка блоку на зображенні */
  boundingBox?: {
    /** X координата */
    x: number;
    /** Y координата */
    y: number;
    /** Ширина блоку */
    width: number;
    /** Висота блоку */
    height: number;
  };
  /** Рядки тексту в блоці */
  lines?: Array<{
    /** Текст рядка */
    text: string;
    /** Впевненість розпізнавання рядка (0-1) */
    confidence?: number;
    /** Слова в рядку */
    words?: Array<{
      /** Текст слова */
      text: string;
      /** Впевненість розпізнавання слова (0-1) */
      confidence?: number;
    }>;
  }>;
}

/**
 * Результат розпізнавання тексту
 */
interface TextRecognitionResult {
  /** Повний розпізнаний текст */
  text: string;
  /** Структуровані блоки розпізнаного тексту */
  blocks?: TextBlock[];
  /** Загальна впевненість розпізнавання (0-1) */
  confidence?: number;
  /** Мова, якою був розпізнаний текст */
  language?: string;
  /** Час виконання розпізнавання в мілісекундах */
  processingTimeMs?: number;
  /** Чи успішно завершилося розпізнавання */
  success?: boolean;
  /** Повідомлення про помилку, якщо розпізнавання не вдалося */
  error?: string;
}

/**
 * Сервіс для розпізнавання тексту з зображень та вилучення інформації про запчастини
 */
class TextRecognitionService implements TextRecognitionServiceInterface {
  private static instance: TextRecognitionService | null = null;
  private textRecognizer: TextRecognizer | null = null;
  private isTextRecognizerAvailable = false;
  
  /**
   * Приватний конструктор для реалізації патерну Singleton
   */
  public static getInstance(): TextRecognitionService {
    if (!TextRecognitionService.instance) {
      TextRecognitionService.instance = new TextRecognitionService();
    }
    return TextRecognitionService.instance;
  }

  private constructor() {
    logger.info('Створено екземпляр TextRecognitionService');
    try {
      // Встановлюємо прапорець доступності розпізнавання тексту
      this.isTextRecognizerAvailable = true;
      logger.info('TextRecognizer в TextRecognitionService ініціалізовано успішно');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn('Помилка ініціалізації TextRecognitionService:', errorMessage);
      this.isTextRecognizerAvailable = false;
    }
  }

  /**
   * Отримання єдиного екземпляру сервісу (патерн Singleton)
   * @returns Екземпляр TextRecognitionService
   */


  /**
   * Оптимізація зображення для кращого розпізнавання тексту
   * @param imageUri URI зображення для оптимізації
   * @param options Опції оптимізації
   * @returns Promise з URI оптимізованого зображення
   */


  /**
   * Розпізнавання тексту з зображення
   * @param imageUri URI зображення
   * @param options Опції розпізнавання
   * @returns Promise з результатом розпізнавання
   */
  public async recognizeText(imageUri: string, options?: TextRecognitionOptions): Promise<TextRecognitionResult> {
    const startTime = Date.now();
    try {
      logger.info('Розпізнавання тексту з зображення:', imageUri);
      
      // Перевіряємо чи існує файл
      const fileExists = await RNFS.exists(imageUri.replace('file://', ''));
      if (!fileExists) {
        throw new Error(`Файл не знайдено: ${imageUri}`);
      }
      
      // Перевіряємо доступність розпізнавання
      if (!this.isTextRecognizerAvailable) {
        throw new Error('Розпізнавання тексту недоступне на цьому пристрої');
      }
      
      // Оптимізуємо зображення для кращого розпізнавання (заглушка)
      const optimizedImageUri = imageUri;
      
      // Виконуємо розпізнавання тексту (MOCK IMPLEMENTATION)
      logger.info('Виклик TextRecognition.recognizeImage (MOCK) з опціями:', options);
      const mockResult: TextRecognitionResult = {
        text: 'Артикул: MOCK456 Виробник: MockProducer2 Назва: Mock Part 2 Категорія: Двигун Ціна: 456.78 UAH',
        blocks: [{
          text: 'Артикул: MOCK456',
          boundingBox: { x: 10, y: 10, width: 100, height: 20 },
          lines: [{
            text: 'Артикул: MOCK456',
            words: [{ text: 'Артикул:' }, { text: 'MOCK456' }],
          }],
        }, {
          text: 'Виробник: MockProducer2',
          boundingBox: { x: 10, y: 30, width: 150, height: 20 },
          lines: [{
            text: 'Виробник: MockProducer2',
            words: [{ text: 'Виробник:' }, { text: 'MockProducer2' }],
          }],
        }],
        confidence: 0.92,
        language: options?.language || 'uk',
        processingTimeMs: Date.now() - startTime,
      };
      logger.info('Отримано MOCK відповідь від TextRecognition.recognizeImage');

      if (typeof mockResult.text !== 'string') {
        logger.warn('MOCK відповідь не містить тексту або має невірний формат.');
        throw new Error('Не вдалося розпізнати текст: невірний формат MOCK відповіді.');
      }
      
      return {
        ...mockResult,
        text: mockResult.text.trim(),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Помилка розпізнавання тексту:', errorMessage);
      throw new Error(`Помилка розпізнавання тексту: ${errorMessage}`);
    }
  }

  /**
   * Обробка зображення та вилучення інформації про запчастину
   * @param imageUri URI зображення
   * @param options Опції вилучення інформації
   * @returns Promise з результатом вилучення інформації
   */
  public async processImageAndExtractInfo(imageUri: string, options?: PartExtractionOptions & { recognitionOptions?: TextRecognitionOptions }): Promise<PartExtractionResult> {
    try {
      const startTime = Date.now();
      logger.info('Обробка зображення та вилучення інформації:', imageUri);
      
      // Налаштування опцій розпізнавання
      const textRecOptions: TextRecognitionOptions = {
        // language: 'uk', // Мова розпізнавання (за замовчуванням 'uk')
        // returnBlocks: true, // Чи повертати структуровані блоки
      };
      
      // Розпізнаємо текст з зображення
      const recognitionResult = await this.recognizeText(imageUri, { ...textRecOptions, ...options?.recognitionOptions });
      
      // Перевіряємо чи успішно розпізнано текст
      if (!recognitionResult.success || !recognitionResult.text) {
        return {
          success: false,
          error: recognitionResult.error || 'Не вдалося розпізнати текст на зображенні',
          part: null,
          processingTimeMs: Date.now() - startTime,
          extractionDate: new Date()
        };
      }
      
      // Налаштування опцій вилучення інформації
      const extractionOptions = {
        minConfidence: 0.5,
        extractArticleNumber: true,
        extractName: true,
        extractManufacturer: true,
        extractPrice: true,
        extractCategory: true,
        extractQuantity: true,
        saveOriginalText: true,
        ...options
      };
      
      // Вилучаємо інформацію про запчастину з тексту
      const extractionResult = await this.extractPartInfo(recognitionResult.text, extractionOptions);
      
      // Додаємо інформацію про зображення
      if (extractionResult.success && extractionResult.part) {
        // Додаємо шлях до фото
        extractionResult.part.photoPath = imageUri;
        
        // Додаємо інформацію про розпізнавання
        if (extractionOptions.saveOriginalText && !extractionResult.originalText) {
          extractionResult.originalText = recognitionResult.text;
        }
        
        // Додаємо інформацію про впевненість розпізнавання
        if (recognitionResult.confidence && (!extractionResult.confidence || extractionResult.confidence < 0.1)) {
          extractionResult.confidence = recognitionResult.confidence;
        }
        
        // Оновлюємо час обробки
        extractionResult.processingTimeMs = Date.now() - startTime;
      }
      
      return extractionResult;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Помилка обробки зображення:', errorMessage);
      return {
        success: false,
        error: errorMessage,
        part: null,
        processingTimeMs: 0,
        extractionDate: new Date()
      };
    }
  }

  /**
   * Оптимізація зображення для кращого розпізнавання
   * @param imageUri URI зображення
   * @param options Опції оптимізації
   * @returns Promise з URI оптимізованого зображення
   */
  public async optimizeImageForRecognition(imageUri: string, options?: ImageProcessingOptions): Promise<string> {
    try {
      const defaultOptions = {
        width: 1200,
        height: 1200,
        quality: 80, // ImageResizer використовує значення від 0 до 100
        format: 'JPEG' as const
      };
      
      const mergedOptions = { ...defaultOptions, ...options };
      
      logger.info('Оптимізация зображення для розпізнавання:', imageUri);
      
      // Видаляємо префікс file:// якщо він є
      const cleanImageUri = imageUri.startsWith('file://') ? imageUri.substring(7) : imageUri;
      
      // Застосовуємо маніпуляції до зображення за допомогою ImageResizer
      const result = await ImageResizer.createResizedImage(
        cleanImageUri,
        mergedOptions.width,
        mergedOptions.height,
        mergedOptions.format as any,
        mergedOptions.quality,
        0, // rotation
        undefined, // outputPath (якщо не вказано, зберігається в тимчасовій директорії)
        false, // keepMeta
        { onlyScaleDown: true } // options
      );
      
      logger.info('Зображення оптимізовано:', result.uri);
      
      return result.uri;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Помилка оптимізації зображення:', errorMessage);
      return imageUri; // Повертаємо оригінальний URI у випадку помилки
    }
  }

  /**
   * Вилучення структурованої інформації про запчастину з розпізнаного тексту.
   * @param text Розпізнаний текст.
   * @param options Опції вилучення.
   * @returns Promise з результатом вилучення інформації.
   */
  public async extractPartInfo(text: string, options?: PartExtractionOptions): Promise<PartExtractionResult> {
    const startTime = Date.now();
    logger.info('Початок вилучення інформації про запчастину з тексту.');

    const defaultOptions: PartExtractionOptions = {
      extractArticleNumber: true,
      extractName: true,
      extractManufacturer: true,
      extractPrice: true,
      extractCategory: true,
      extractQuantity: false, // За замовчуванням не вилучаємо кількість
      minConfidence: 0.5, // Мінімальна впевненість для окремих полів
      saveOriginalText: false, // Не зберігати оригінальний текст за замовчуванням
    };

    const tempOptions = { ...defaultOptions, ...options };
    const extractionOptions = {
      ...tempOptions,
      minConfidence: tempOptions.minConfidence ?? defaultOptions.minConfidence!,
    };
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);

    const partInfo: Partial<Part> = {}; // Використовуємо Partial<Part> для поступового заповнення
    const confidenceValues: number[] = [];

    try {
      // Вилучаємо артикул
      if (extractionOptions.extractArticleNumber) {
        const articleNumberResult = this.extractArticleNumber(lines); // Немає await, метод синхронний
        if (articleNumberResult.value && articleNumberResult.confidence >= extractionOptions.minConfidence) {
          partInfo.articleNumber = articleNumberResult.value;
          confidenceValues.push(articleNumberResult.confidence);
          logger.info('Знайдено артикул:', partInfo.articleNumber, 'з впевненістю:', articleNumberResult.confidence);
        }
      }

      // Вилучаємо назву
      if (extractionOptions.extractName) {
        const nameResult = this.extractName(lines); // Немає await
        if (nameResult.value && nameResult.confidence >= extractionOptions.minConfidence) {
          partInfo.name = nameResult.value;
          confidenceValues.push(nameResult.confidence);
          logger.info('Знайдено назву:', partInfo.name, 'з впевненістю:', nameResult.confidence);
        }
      }

      // Вилучаємо виробника
      if (extractionOptions.extractManufacturer) {
        const manufacturerResult = this.extractManufacturer(lines); // Немає await
        if (manufacturerResult.value && manufacturerResult.confidence >= extractionOptions.minConfidence) {
          partInfo.manufacturer = manufacturerResult.value;
          confidenceValues.push(manufacturerResult.confidence);
          logger.info('Знайдено виробника:', partInfo.manufacturer, 'з впевненістю:', manufacturerResult.confidence);
        }
      }

      // Вилучаємо ціну
      if (extractionOptions.extractPrice) {
        const priceResult = this.extractPrice(lines); // Немає await
        if (priceResult.value !== undefined && priceResult.confidence >= extractionOptions.minConfidence) { // Перевіряємо на undefined
          partInfo.price = priceResult.value;
          confidenceValues.push(priceResult.confidence);
          logger.info('Знайдено ціну:', partInfo.price, 'з впевненістю:', priceResult.confidence);
        }
      }

      // Вилучаємо категорію
      if (extractionOptions.extractCategory) {
        const categoryResult = this.extractCategory(lines); // Немає await
        if (categoryResult.value && categoryResult.confidence >= extractionOptions.minConfidence) {
          partInfo.category = categoryResult.value;
          confidenceValues.push(categoryResult.confidence);
          logger.info('Знайдено категорію:', partInfo.category, 'з впевненістю:', categoryResult.confidence);
        }
      }

      // Встановлюємо значення за замовчуванням, якщо вони не були вилучені
      partInfo.isNew = partInfo.isNew ?? true;
      partInfo.quantity = partInfo.quantity ?? (extractionOptions.extractQuantity ? 1 : 0); // Кількість 1, якщо вилучається, інакше 0
      if (partInfo.quantity && partInfo.quantity > 0 && extractionOptions.extractQuantity) {
        confidenceValues.push(0.7); // Додаємо впевненість для кількості, якщо вона встановлена
      }

      // Розраховуємо загальну впевненість
      const avgConfidence = confidenceValues.length > 0
        ? confidenceValues.reduce((sum, val) => sum + val, 0) / confidenceValues.length
        : 0;

      // Перевіряємо, чи вдалося вилучити хоча б якусь ключову інформацію
      const isSufficientDataExtracted = !!(partInfo.articleNumber || partInfo.name || partInfo.manufacturer);
      
      const processingTimeMs = Date.now() - startTime;

      // Формуємо результат
      const result: PartExtractionResult = {
        success: isSufficientDataExtracted,
        part: isSufficientDataExtracted ? (partInfo as Part) : null, // Приводимо до Part, якщо успішно
        confidence: avgConfidence,
        extractionDate: new Date(),
        processingTimeMs,
      };

      // Додаємо оригінальний текст, якщо потрібно
      if (extractionOptions.saveOriginalText) {
        result.originalText = text;
      }

      // Логуємо результат
      if (!isSufficientDataExtracted) {
        result.error = 'Не вдалося вилучити достатньо ключової інформації (артикул, назва або виробник).';
        logger.warn(result.error, 'Вилучені дані:', partInfo, 'Впевненість:', avgConfidence);
      } else {
        logger.info('Успішно вилучено інформацію про запчастину.', 'Впевненість:', avgConfidence, 'Дані:', partInfo);
      }
      
      return result;

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Критична помилка під час вилучення інформації про запчастину:', errorMessage, error);
      return {
        success: false,
        error: `Помилка вилучення: ${errorMessage}`,
        part: null,
        confidence: 0,
        extractionDate: new Date(),
        processingTimeMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Вилучення артикулу з тексту
   * @param lines Рядки тексту
   * @returns Об'єкт з вилученим значенням та впевненістю
   */
  private extractArticleNumber(lines: string[]): { value: string | null; confidence: number } {
    // Шукаємо артикул у форматі "Артикул: ABC123" або "ABC123"
    const articlePattern = /(?:артикул|код|номер|арт.?|art.?|#)[:№#]?\s*([a-z0-9-]{3,})/i;
    
    for (const line of lines) {
      const match = line.match(articlePattern);
      if (match) {
        return { value: match[1].toUpperCase(), confidence: 0.9 };
      }
    }
    
    // Шукаємо будь-яку комбінацію літер і цифр, яка може бути артикулом
    const fallbackPattern = /([a-z0-9-]{5,})/i;
    
    for (const line of lines) {
      const match = line.match(fallbackPattern);
      if (match) {
        return { value: match[1].toUpperCase(), confidence: 0.6 };
      }
    }
    
    return { value: null, confidence: 0 };
  }

  /**
   * Вилучення назви з тексту
   * @param lines Рядки тексту
   * @returns Об'єкт з вилученим значенням та впевненістю
   */
  private extractName(lines: string[]): { value: string | null; confidence: number } {
    // Шукаємо назву у форматі "Назва: Гальмівні колодки" або просто "Гальмівні колодки"
    const namePattern = /(?:назва|найменування|name)[:]\s*(.+)/i;
    
    for (const line of lines) {
      const match = line.match(namePattern);
      if (match) {
        return { value: match[1].trim(), confidence: 0.9 };
      }
    }
    
    // Якщо не знайдено за шаблоном, беремо перший рядок, який не є артикулом, ціною або виробником
    const excludePatterns = [
      /(?:артикул|код|номер|арт.?|art.?|#)[:№#]?\s*([a-z0-9-]{3,})/i,
      /(?:ціна|price|вартість|cost)[:]\s*(.+)/i,
      /(?:виробник|manufacturer|бренд|brand)[:]\s*(.+)/i
    ];
    
    for (const line of lines) {
      let isExcluded = false;
      
      for (const pattern of excludePatterns) {
        if (pattern.test(line)) {
          isExcluded = true;
          break;
        }
      }
      
      if (!isExcluded && line.length > 5) {
        return { value: line.trim(), confidence: 0.7 };
      }
    }
    
    return { value: null, confidence: 0 };
  }

  /**
   * Вилучення виробника з тексту
   * @param lines Рядки тексту
   * @returns Об'єкт з вилученим значенням та впевненістю
   */
  private extractManufacturer(lines: string[]): { value: string | null; confidence: number } {
    // Шукаємо виробника у форматі "Виробник: Bosch" або "Бренд: Bosch"
    const manufacturerPattern = /(?:виробник|manufacturer|бренд|brand|марка|make)[:]\s*(.+)/i;
    
    for (const line of lines) {
      const match = line.match(manufacturerPattern);
      if (match) {
        return { value: match[1].trim(), confidence: 0.9 };
      }
    }
    
    // Список відомих виробників
    const knownManufacturers = [
      'Bosch', 'Brembo', 'Continental', 'Denso', 'Valeo', 'NGK', 'Mahle', 'Hella',
      'ZF', 'TRW', 'Delphi', 'Febi', 'Sachs', 'Lemförder', 'Bilstein', 'Monroe',
      'Ate', 'Textar', 'Ferodo', 'Nissens', 'NTN-SNR', 'SKF', 'FAG', 'INA'
    ];
    
    // Шукаємо відомих виробників у тексті
    for (const line of lines) {
      for (const manufacturer of knownManufacturers) {
        if (line.toLowerCase().includes(manufacturer.toLowerCase())) {
          return { value: manufacturer, confidence: 0.8 };
        }
      }
    }
    
    return { value: null, confidence: 0 };
  }

  /**
   * Вилучення ціни з тексту
   * @param lines Рядки тексту
   * @returns Об'єкт з вилученим значенням та впевненістю
   */
  private extractPrice(lines: string[]): { value: number | undefined; confidence: number } {
    // Шукаємо ціну у форматі "Ціна: 1200 грн" або "1200 грн"
    const pricePattern = /(?:ціна|price|вартість|cost)[:]\s*(\d+(?:[.,]\d+)?)\s*(?:грн|₴|uah|EUR|€|USD|\$)?/i;
    
    for (const line of lines) {
      const match = line.match(pricePattern);
      if (match) {
        return { value: parseFloat(match[1].replace(',', '.')), confidence: 0.9 };
      }
    }
    
    // Шукаємо будь-яке число з валютою
    const fallbackPattern = /(\d+(?:[.,]\d+)?)\s*(?:грн|₴|uah|EUR|€|USD|\$)/i;
    
    for (const line of lines) {
      const match = line.match(fallbackPattern);
      if (match) {
        return { value: parseFloat(match[1].replace(',', '.')), confidence: 0.8 };
      }
    }
    
    return { value: undefined, confidence: 0 };
  }

  /**
   * Вилучення категорії з тексту
   * @param lines Рядки тексту
   * @returns Об'єкт з вилученим значенням та впевненістю
   */
  private extractCategory(lines: string[]): { value: string | null; confidence: number } {
    // Шукаємо категорію у форматі "Категорія: Гальма" або "Розділ: Гальма"
    const categoryPattern = /(?:категорія|category|розділ|section)[:]\s*(.+)/i;
    
    for (const line of lines) {
      const match = line.match(categoryPattern);
      if (match) {
        return { value: match[1].trim(), confidence: 0.9 };
      }
    }
    
    // Список відомих категорій
    const knownCategories = [
      'Двигун', 'Трансмісія', 'Гальма', 'Підвіска', 'Кузов', 'Електрика',
      'Освітлення', 'Інтер\'єр', 'Охолодження', 'Опалення', 'Кондиціонер',
      'Паливна система', 'Вихлопна система', 'Рульове керування'
    ];
    
    // Шукаємо відомі категорії у тексті
    for (const line of lines) {
      for (const category of knownCategories) {
        if (line.toLowerCase().includes(category.toLowerCase())) {
          return { value: category, confidence: 0.8 };
        }
      }
    }
    
    return { value: null, confidence: 0 };
  }
}

// Експортуємо клас для можливості використання типу
export { TextRecognitionService };

// Експортуємо екземпляр сервісу за замовчуванням (Singleton)
const textRecognitionService = TextRecognitionService.getInstance();
export default textRecognitionService;