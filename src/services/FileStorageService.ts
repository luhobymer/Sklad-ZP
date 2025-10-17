import * as RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import { Part } from '../models/Part';
import { FileStorageServiceInterface, SearchParams } from '../types/services'; // Removed AnalogPart as it's not used
import { fileStorageLogger as logger } from '../utils/logger';

// Визначаємо шляхи до файлів сховища
const STORAGE_DIRECTORY = `${RNFS.DocumentDirectoryPath}/storage/`;
const PARTS_FILE = `${STORAGE_DIRECTORY}parts.json`;
const HISTORY_FILE = `${STORAGE_DIRECTORY}history.json`;
const FAVORITES_FILE = `${STORAGE_DIRECTORY}favorites.json`;
// const ANALOGS_FILE = `${STORAGE_DIRECTORY}analogs.json`; // Not used currently

/**
 * Сервіс для збереження даних у файловій системі
 * замість SQLite бази даних
 * Реалізує патерн Singleton для забезпечення єдиного екземпляру сервісу
 */
export class FileStorageService implements FileStorageServiceInterface {
  // Реалізація статичного методу getInstance з інтерфейсу
  public static getInstance(): FileStorageServiceInterface {
    if (!FileStorageService.instance) {
      FileStorageService.instance = new FileStorageService();
    }
    return FileStorageService.instance;
  }
  private static instance: FileStorageService;
  private parts: Part[] = [];
  private viewHistory: number[] = []; // Зберігаємо ID запчастин
  private favorites: number[] = []; // Зберігаємо ID запчастин
  private isInitialized = false;

  /**
   * Приватний конструктор для реалізації патерну Singleton
   */
  private constructor() {}

  /**
   * @deprecated Використовуйте статичний метод getInstance()
   */
  public getInstance(): FileStorageServiceInterface {
    return FileStorageService.getInstance();
  }

  /**
   * Ініціалізація сховища
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const dirExists = await RNFS.exists(STORAGE_DIRECTORY);
      if (!dirExists) {
        await RNFS.mkdir(STORAGE_DIRECTORY);
        // Встановлюємо атрибут "не робити бекап" для iOS
        if (Platform.OS === 'ios') {
          await RNFS.writeFile(`${STORAGE_DIRECTORY}.no_backup`, '', 'utf8');
        }
      }

      await this.loadPartsFromFile();
      await this.loadHistoryFromFile();
      await this.loadFavoritesFromFile();
      
      this.isInitialized = true;
      logger.info('FileStorageService ініціалізовано.');
    } catch (error) {
      logger.error('Помилка ініціалізації FileStorageService:', error);
      throw error; // Rethrow to allow caller to handle
    }
  }

  private async loadPartsFromFile(): Promise<void> {
    try {
      const fileExists = await RNFS.exists(PARTS_FILE);
      if (fileExists) {
        const content = await RNFS.readFile(PARTS_FILE, 'utf8');
        this.parts = JSON.parse(content).map((p: any) => ({ // Normalize fields
          ...p,
          articleNumber: typeof p.articleNumber === 'string' ? p.articleNumber.trim() : String(p.articleNumber ?? ''),
          name: typeof p.name === 'string' ? p.name.trim() : String(p.name ?? ''),
          manufacturer: typeof p.manufacturer === 'string' ? p.manufacturer.trim() : String(p.manufacturer ?? ''),
          category: typeof p.category === 'string' ? p.category.trim() : String(p.category ?? ''),
          quantity: Number(p.quantity ?? 0),
          price: Number(p.price ?? 0),
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(0),
          updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(0),
        }));
        logger.info(`Завантажено ${this.parts.length} запчастин з файлу: ${PARTS_FILE}`);
        if (this.parts.length > 0) {
          const s = this.parts[0];
          logger.debug('Перший елемент (snapshot):', {
            id: s.id,
            articleNumber: s.articleNumber,
            name: s.name,
            manufacturer: s.manufacturer,
            quantity: s.quantity,
            price: s.price,
            createdAt: s.createdAt,
          });
        }
      } else {
        this.parts = [];
        await this.savePartsToFile(); // Create file if not exists
        logger.warn(`Файл з частинами не знайдено. Створено порожній файл: ${PARTS_FILE}`);
      }
    } catch (error) {
      logger.error('Помилка завантаження запчастин з файлу:', error);
      this.parts = []; // Reset on error
    }
  }

  /**
   * Повертає службову інформацію для діагностики джерела даних
   */
  public async getDebugInfo(): Promise<{ storageDir: string; partsFile: string; partsCount: number; sample?: Partial<Part> }> {
    await this.initialize();
    const info = {
      storageDir: STORAGE_DIRECTORY,
      partsFile: PARTS_FILE,
      partsCount: this.parts.length,
      sample: this.parts.length > 0 ? {
        id: this.parts[0].id,
        articleNumber: this.parts[0].articleNumber,
        name: this.parts[0].name,
        manufacturer: this.parts[0].manufacturer,
        quantity: this.parts[0].quantity,
        price: this.parts[0].price,
        createdAt: this.parts[0].createdAt,
      } : undefined,
    };
    logger.info('DebugInfo FileStorageService:', info);
    return info;
  }

  private async savePartsToFile(): Promise<void> {
    try {
      await RNFS.writeFile(PARTS_FILE, JSON.stringify(this.parts, null, 2), 'utf8');
    } catch (error) {
      logger.error('Помилка збереження запчастин у файл:', error);
    }
  }

  private async loadHistoryFromFile(): Promise<void> {
    try {
      const fileExists = await RNFS.exists(HISTORY_FILE);
      if (fileExists) {
        const content = await RNFS.readFile(HISTORY_FILE, 'utf8');
        this.viewHistory = JSON.parse(content);
      } else {
        this.viewHistory = [];
        await this.saveHistoryToFile();
      }
    } catch (error) {
      logger.error('Помилка завантаження історії з файлу:', error);
      this.viewHistory = [];
    }
  }

  private async saveHistoryToFile(): Promise<void> {
    try {
      await RNFS.writeFile(HISTORY_FILE, JSON.stringify(this.viewHistory, null, 2), 'utf8');
    } catch (error) {
      logger.error('Помилка збереження історії у файл:', error);
    }
  }

  private async loadFavoritesFromFile(): Promise<void> {
    try {
      const fileExists = await RNFS.exists(FAVORITES_FILE);
      if (fileExists) {
        const content = await RNFS.readFile(FAVORITES_FILE, 'utf8');
        this.favorites = JSON.parse(content);
      } else {
        this.favorites = [];
        await this.saveFavoritesToFile();
      }
    } catch (error) {
      logger.error('Помилка завантаження обраних з файлу:', error);
      this.favorites = [];
    }
  }

  private async saveFavoritesToFile(): Promise<void> {
    try {
      await RNFS.writeFile(FAVORITES_FILE, JSON.stringify(this.favorites, null, 2), 'utf8');
    } catch (error) {
      logger.error('Помилка збереження обраних у файл:', error);
    }
  }

  public async getAllParts(): Promise<Part[]> {
    await this.initialize();
    return [...this.parts]; // Return a copy
  }

  // Updated addPart to correctly handle Part creation with createdAt and updatedAt
  public async addPart(partData: Omit<Part, 'id'>): Promise<number> {
    await this.initialize();
    const newId = this.parts.length > 0 ? Math.max(...this.parts.map(p => p.id)) + 1 : 1;
    const now = new Date();
    const newPart: Part = {
      ...partData,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    this.parts.push(newPart);
    await this.savePartsToFile();
    logger.info(`Додано нову запчастину: ID ${newId}, Артикул: ${newPart.articleNumber}`);
    return newId;
  }
  
  // Removed generateNewId as it's incorporated into addPart

  public async updatePart(updatedPart: Part): Promise<void> {
    await this.initialize();
    const index = this.parts.findIndex(p => p.id === updatedPart.id);
    if (index !== -1) {
      this.parts[index] = {
        ...updatedPart,
        updatedAt: new Date(), // Ensure updatedAt is updated
      };
      await this.savePartsToFile();
      logger.info(`Оновлено запчастину: ID ${updatedPart.id}`);
    } else {
      logger.warn(`Спроба оновити неіснуючу запчастину: ID ${updatedPart.id}`);
      // Optionally throw an error: throw new Error(`Part with id ${updatedPart.id} not found`);
    }
  }

  public async deletePart(id: number): Promise<void> {
    await this.initialize();
    const initialLength = this.parts.length;
    this.parts = this.parts.filter(p => p.id !== id);
    if (this.parts.length < initialLength) {
      await this.savePartsToFile();
      // Also remove from history and favorites
      this.viewHistory = this.viewHistory.filter(partId => partId !== id);
      await this.saveHistoryToFile();
      this.favorites = this.favorites.filter(partId => partId !== id);
      await this.saveFavoritesToFile();
      logger.info(`Видалено запчастину: ID ${id}`);
    } else {
      logger.warn(`Спроба видалити неіснуючу запчастину: ID ${id}`);
    }
  }

  public async getPartById(id: number): Promise<Part | undefined> {
    await this.initialize();
    return this.parts.find(p => p.id === id);
  }

  public async searchParts(params: SearchParams): Promise<Part[]> {
    await this.initialize();
    let filteredParts = [...this.parts];

    if (params.query) {
      const queryLower = params.query.toLowerCase();
      filteredParts = filteredParts.filter(p => 
        p.name.toLowerCase().includes(queryLower) ||
        p.articleNumber.toLowerCase().includes(queryLower) ||
        p.manufacturer.toLowerCase().includes(queryLower) ||
        (p.description && p.description.toLowerCase().includes(queryLower))
      );
    }
    if (params.category) {
      filteredParts = filteredParts.filter(p => p.category === params.category);
    }
    if (params.manufacturer) {
      filteredParts = filteredParts.filter(p => p.manufacturer === params.manufacturer);
    }
    // Add other filters as needed (type, model, dimensions, priceRange, isNew, inStock)

    return filteredParts;
  }

  public async findByArticle(articleNumber: string): Promise<Part | null> {
    await this.initialize();
    const part = this.parts.find(p => p.articleNumber === articleNumber);
    return part || null;
  }

  public async addToViewHistory(partId: number): Promise<void> {
    await this.initialize();
    // Remove if already exists to add to the top (most recent)
    this.viewHistory = this.viewHistory.filter(id => id !== partId);
    this.viewHistory.unshift(partId);
    // Keep history to a certain length, e.g., 50 items
    if (this.viewHistory.length > 50) {
      this.viewHistory.pop();
    }
    await this.saveHistoryToFile();
  }

  public async getViewHistory(): Promise<Part[]> {
    await this.initialize();
    // Map IDs to actual Part objects, filtering out undefined if a part was deleted
    return this.viewHistory
      .map(id => this.parts.find(p => p.id === id))
      .filter(p => p !== undefined) as Part[];
  }

  public async clearViewHistory(): Promise<void> {
    await this.initialize();
    this.viewHistory = [];
    await this.saveHistoryToFile();
    logger.info('Історію переглядів очищено.');
  }

  public async addToFavorites(partId: number): Promise<void> {
    await this.initialize();
    if (!this.favorites.includes(partId)) {
      this.favorites.push(partId);
      await this.saveFavoritesToFile();
      logger.info(`Запчастину ID ${partId} додано до обраних.`);
    }
  }

  public async removeFromFavorites(partId: number): Promise<void> {
    await this.initialize();
    const initialLength = this.favorites.length;
    this.favorites = this.favorites.filter(id => id !== partId);
    if (this.favorites.length < initialLength) {
      await this.saveFavoritesToFile();
      logger.info(`Запчастину ID ${partId} видалено з обраних.`);
    }
  }

  public async getFavorites(): Promise<Part[]> {
    await this.initialize();
    return this.favorites
      .map(id => this.parts.find(p => p.id === id))
      .filter(p => p !== undefined) as Part[];
  }

  public async isFavorite(partId: number): Promise<boolean> {
    await this.initialize();
    return this.favorites.includes(partId);
  }

  /**
   * Перечитує всі файли зі сховища і оновлює кеш у пам'яті
   */
  public async reloadFromDisk(): Promise<void> {
    try {
      // Не чіпаємо прапор isInitialized, просто оновлюємо масиви з файлів
      await this.loadPartsFromFile();
      await this.loadHistoryFromFile();
      await this.loadFavoritesFromFile();
      logger.info('Дані перезавантажено з файлів сховища.');
    } catch (error) {
      logger.error('Помилка reloadFromDisk:', error);
      throw error;
    }
  }

  public async getUniqueCategories(): Promise<string[]> {
    await this.initialize();
    return [...new Set(this.parts.map(p => p.category).filter(c => c))]; // Filter out undefined/empty
  }

  public async getUniqueManufacturers(): Promise<string[]> {
    await this.initialize();
    return [...new Set(this.parts.map(p => p.manufacturer).filter(m => m))]; // Filter out undefined/empty
  }
  
  // Implement other getUnique... methods similarly if needed
  public async getUniqueTypes(): Promise<string[]> { // Placeholder, should be based on a 'type' field in Part if it exists
    await this.initialize();
    // Assuming Part might have a 'type' field, otherwise this needs to be adapted or removed
    // return [...new Set(this.parts.map(p => p.type).filter(t => t))]; 
    logger.warn('getUniqueTypes: Поле "type" не визначено у моделі Part або не використовується.');
    return []; 
  }
  public async getUniqueModels(): Promise<string[]> { // Placeholder
    await this.initialize();
    // Assuming Part might have a 'compatibleCars' field or similar for models
    // This would likely need more complex logic if 'compatibleCars' is an array of strings
    logger.warn('getUniqueModels: Логіка для моделей не реалізована повністю.');
    return [];
  }
  public async getUniqueDimensions(): Promise<string[]> { // Placeholder
    await this.initialize();
    // Assuming Part might have a 'dimensions' field
    // return [...new Set(this.parts.map(p => p.dimensions).filter(d => d))];
    logger.warn('getUniqueDimensions: Поле "dimensions" не визначено у моделі Part або не використовується.');
    return [];
  }

  public async getAnalogs(part: Part): Promise<Part[]> {
    // Basic placeholder for analog search - can be expanded significantly
    await this.initialize();
    logger.warn('Метод getAnalogs не реалізовано повністю, повертає порожній масив.');
    // Example: find parts with similar name but different manufacturer
    // return this.parts.filter(p => 
    //   p.id !== part.id &&
    //   p.name.toLowerCase() === part.name.toLowerCase() && 
    //   p.manufacturer.toLowerCase() !== part.manufacturer.toLowerCase()
    // );
    return [];
  }

  // --- Methods required by FileStorageServiceInterface ---
  public async clearAllData(): Promise<void> {
    await this.initialize(); // Ensure initialized before clearing
    this.parts = [];
    this.viewHistory = [];
    this.favorites = [];
    // Save empty arrays to files
    await this.savePartsToFile();
    await this.saveHistoryToFile();
    await this.saveFavoritesToFile();
    logger.info('Усі дані FileStorageService очищено.');
  }

  public async clearAllParts(): Promise<void> {
    await this.initialize();
    this.parts = [];
    await this.savePartsToFile();
    logger.info('Усі запчастини очищено з FileStorageService.');
  }

  public async clearAllFavorites(): Promise<void> {
    await this.initialize();
    this.favorites = [];
    await this.saveFavoritesToFile();
    logger.info('Список обраних очищено в FileStorageService.');
  }
  // --- End of methods required by FileStorageServiceInterface ---

  // Removed getStringSimilarity as it's not used by the service and was causing issues.
  // If similarity search is needed for analogs, it should be a more robust implementation.
}

// Export the singleton instance
export default FileStorageService.getInstance();
