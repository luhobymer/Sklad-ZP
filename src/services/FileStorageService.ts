import * as FileSystem from 'expo-file-system';
import { Part } from '../models/Part';

// Визначаємо шляхи до файлів сховища
const STORAGE_DIRECTORY = `${FileSystem.documentDirectory}storage/`;
const PARTS_FILE = `${STORAGE_DIRECTORY}parts.json`;
const HISTORY_FILE = `${STORAGE_DIRECTORY}history.json`;
const FAVORITES_FILE = `${STORAGE_DIRECTORY}favorites.json`;

/**
 * Сервіс для збереження даних у файловій системі
 * замість SQLite бази даних
 */
class FileStorageService {
  private static instance: FileStorageService | null = null;
  private parts: Part[] = [];
  private viewHistory: number[] = []; // Масив ID переглянутих запчастин
  private favorites: number[] = []; // Масив ID обраних запчастин
  private isInitialized: boolean = false;

  private constructor() {}

  /**
   * Отримати екземпляр FileStorageService (патерн Singleton)
   */
  public static getInstance(): FileStorageService {
    if (!FileStorageService.instance) {
      FileStorageService.instance = new FileStorageService();
    }
    return FileStorageService.instance;
  }

  /**
   * Ініціалізація сховища
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Перевіряємо і створюємо директорію для сховища, якщо вона не існує
      const dirInfo = await FileSystem.getInfoAsync(STORAGE_DIRECTORY);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(STORAGE_DIRECTORY, { intermediates: true });
      }

      // Завантажуємо дані з файлів
      await this.loadPartsFromFile();
      await this.loadHistoryFromFile();
      await this.loadFavoritesFromFile();

      this.isInitialized = true;
      console.log('FileStorageService успішно ініціалізований');
    } catch (error) {
      console.error('Помилка при ініціалізації FileStorageService:', error);
      throw error;
    }
  }

  /**
   * Завантаження запчастин з файлу
   */
  private async loadPartsFromFile(): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(PARTS_FILE);
      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(PARTS_FILE);
        this.parts = JSON.parse(content);
      } else {
        // Якщо файл не існує, створюємо порожній масив
        this.parts = [];
        await this.savePartsToFile();
      }
    } catch (error) {
      console.error('Помилка при завантаженні запчастин з файлу:', error);
      this.parts = [];
    }
  }

  /**
   * Збереження запчастин у файл
   */
  private async savePartsToFile(): Promise<void> {
    try {
      await FileSystem.writeAsStringAsync(PARTS_FILE, JSON.stringify(this.parts));
    } catch (error) {
      console.error('Помилка при збереженні запчастин у файл:', error);
      throw error;
    }
  }

  /**
   * Завантаження історії переглядів з файлу
   */
  private async loadHistoryFromFile(): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(HISTORY_FILE);
      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(HISTORY_FILE);
        this.viewHistory = JSON.parse(content);
      } else {
        // Якщо файл не існує, створюємо порожній масив
        this.viewHistory = [];
        await this.saveHistoryToFile();
      }
    } catch (error) {
      console.error('Помилка при завантаженні історії з файлу:', error);
      this.viewHistory = [];
    }
  }

  /**
   * Збереження історії переглядів у файл
   */
  private async saveHistoryToFile(): Promise<void> {
    try {
      await FileSystem.writeAsStringAsync(HISTORY_FILE, JSON.stringify(this.viewHistory));
    } catch (error) {
      console.error('Помилка при збереженні історії у файл:', error);
      throw error;
    }
  }

  /**
   * Завантаження обраних запчастин з файлу
   */
  private async loadFavoritesFromFile(): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(FAVORITES_FILE);
      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(FAVORITES_FILE);
        this.favorites = JSON.parse(content);
      } else {
        // Якщо файл не існує, створюємо порожній масив
        this.favorites = [];
        await this.saveFavoritesToFile();
      }
    } catch (error) {
      console.error('Помилка при завантаженні обраних з файлу:', error);
      this.favorites = [];
    }
  }

  /**
   * Збереження обраних запчастин у файл
   */
  private async saveFavoritesToFile(): Promise<void> {
    try {
      await FileSystem.writeAsStringAsync(FAVORITES_FILE, JSON.stringify(this.favorites));
    } catch (error) {
      console.error('Помилка при збереженні обраних у файл:', error);
      throw error;
    }
  }

  /**
   * Отримання всіх запчастин
   */
  public async getAllParts(): Promise<Part[]> {
    await this.initialize();
    return [...this.parts];
  }

  /**
   * Додавання нової запчастини
   */
  public async addPart(part: Omit<Part, 'id'>): Promise<number> {
    await this.initialize();
    
    // Генеруємо унікальний ID
    const newId = this.generateNewId();
    
    // Створюємо нову запчастину з ID
    const newPart: Part = {
      ...part,
      id: newId
    };
    
    this.parts.push(newPart);
    await this.savePartsToFile();
    
    return newId;
  }

  /**
   * Оновлення існуючої запчастини
   */
  public async updatePart(part: Part): Promise<void> {
    await this.initialize();
    
    const index = this.parts.findIndex(p => p.id === part.id);
    if (index !== -1) {
      this.parts[index] = {...part};
      await this.savePartsToFile();
    } else {
      throw new Error(`Запчастина з ID ${part.id} не знайдена`);
    }
  }

  /**
   * Видалення запчастини
   */
  public async deletePart(id: number): Promise<void> {
    await this.initialize();
    
    const initialLength = this.parts.length;
    this.parts = this.parts.filter(p => p.id !== id);
    
    if (this.parts.length === initialLength) {
      throw new Error(`Запчастина з ID ${id} не знайдена`);
    }
    
    await this.savePartsToFile();
    
    // Також видаляємо з історії та обраних
    this.viewHistory = this.viewHistory.filter(historyId => historyId !== id);
    await this.saveHistoryToFile();
    
    this.favorites = this.favorites.filter(favoriteId => favoriteId !== id);
    await this.saveFavoritesToFile();
  }

  /**
   * Пошук запчастин за параметрами
   */
  public async searchParts(params: {
    query?: string;
    category?: string;
    manufacturer?: string;
    priceRange?: { min: number; max: number };
    isNew?: boolean;
    inStock?: boolean;
  }): Promise<Part[]> {
    await this.initialize();
    
    let filteredParts = [...this.parts];
    
    // Фільтрація за запитом (шукаємо в артикулі, назві, виробнику)
    if (params.query) {
      const query = params.query.toLowerCase();
      filteredParts = filteredParts.filter(part => 
        part.articleNumber.toLowerCase().includes(query) ||
        part.name.toLowerCase().includes(query) ||
        part.manufacturer.toLowerCase().includes(query)
      );
    }
    
    // Фільтрація за категорією
    if (params.category) {
      filteredParts = filteredParts.filter(part => 
        part.category.toLowerCase() === params.category?.toLowerCase()
      );
    }
    
    // Фільтрація за виробником
    if (params.manufacturer) {
      filteredParts = filteredParts.filter(part => 
        part.manufacturer.toLowerCase() === params.manufacturer?.toLowerCase()
      );
    }
    
    // Фільтрація за ціновим діапазоном
    if (params.priceRange) {
      filteredParts = filteredParts.filter(part => 
        part.price >= params.priceRange!.min && 
        part.price <= params.priceRange!.max
      );
    }
    
    // Фільтрація за станом (новий/вживаний)
    if (params.isNew !== undefined) {
      filteredParts = filteredParts.filter(part => part.isNew === params.isNew);
    }
    
    // Фільтрація за наявністю
    if (params.inStock) {
      filteredParts = filteredParts.filter(part => part.quantity > 0);
    }
    
    return filteredParts;
  }

  /**
   * Пошук запчастини за артикулом
   */
  public async findByArticle(articleNumber: string): Promise<Part | null> {
    await this.initialize();
    
    const part = this.parts.find(p => p.articleNumber === articleNumber);
    return part || null;
  }

  /**
   * Додавання запчастини до історії переглядів
   */
  public async addToViewHistory(partId: number): Promise<void> {
    await this.initialize();
    
    // Перевіряємо, чи існує запчастина
    const part = this.parts.find(p => p.id === partId);
    if (!part) {
      throw new Error(`Запчастина з ID ${partId} не знайдена`);
    }
    
    // Видаляємо запчастину з історії, якщо вона вже є (щоб додати її на початок)
    this.viewHistory = this.viewHistory.filter(id => id !== partId);
    
    // Додаємо ID запчастини на початок історії
    this.viewHistory.unshift(partId);
    
    // Обмежуємо історію до 50 записів
    if (this.viewHistory.length > 50) {
      this.viewHistory = this.viewHistory.slice(0, 50);
    }
    
    await this.saveHistoryToFile();
  }

  /**
   * Отримання історії переглядів
   */
  public async getViewHistory(): Promise<Part[]> {
    await this.initialize();
    
    // Перетворюємо масив ID в масив запчастин
    const historyParts = this.viewHistory
      .map(id => this.parts.find(part => part.id === id))
      .filter(part => part !== undefined) as Part[];
    
    return historyParts;
  }

  /**
   * Очищення історії переглядів
   */
  public async clearViewHistory(): Promise<void> {
    await this.initialize();
    
    this.viewHistory = [];
    await this.saveHistoryToFile();
  }

  /**
   * Додавання запчастини до обраних
   */
  public async addToFavorites(partId: number): Promise<void> {
    await this.initialize();
    
    // Перевіряємо, чи існує запчастина
    const part = this.parts.find(p => p.id === partId);
    if (!part) {
      throw new Error(`Запчастина з ID ${partId} не знайдена`);
    }
    
    // Додаємо ID запчастини до обраних, якщо її там ще немає
    if (!this.favorites.includes(partId)) {
      this.favorites.push(partId);
      await this.saveFavoritesToFile();
    }
  }

  /**
   * Видалення запчастини з обраних
   */
  public async removeFromFavorites(partId: number): Promise<void> {
    await this.initialize();
    
    // Видаляємо ID запчастини з обраних
    const initialLength = this.favorites.length;
    this.favorites = this.favorites.filter(id => id !== partId);
    
    if (this.favorites.length !== initialLength) {
      await this.saveFavoritesToFile();
    }
  }

  /**
   * Отримання обраних запчастин
   */
  public async getFavorites(): Promise<Part[]> {
    await this.initialize();
    
    // Перетворюємо масив ID в масив запчастин
    const favoriteParts = this.favorites
      .map(id => this.parts.find(part => part.id === id))
      .filter(part => part !== undefined) as Part[];
    
    return favoriteParts;
  }
  
  /**
   * Отримання запчастини за ID
   */
  public getPartById(id: number): Part | undefined {
    return this.parts.find(part => part.id === id);
  }

  /**
   * Генерація нового унікального ID
   */
  private generateNewId(): number {
    // Знаходимо максимальний ID
    const maxId = this.parts.reduce((max, part) => Math.max(max, part.id), 0);
    return maxId + 1;
  }

  /**
   * Експорт даних у файл
   */
  async exportData(): Promise<string> {
    try {
      const allParts = await this.getAllParts();
      const viewHistory = await this.getViewHistory();
      const favorites = await this.getFavorites();
      
      const exportData = {
        parts: allParts,
        viewHistory,
        favorites,
        exportedAt: new Date().toISOString()
      };
      
      const exportFileName = `sklad_export_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      const exportFilePath = `${FileSystem.documentDirectory}${exportFileName}`;
      
      await FileSystem.writeAsStringAsync(exportFilePath, JSON.stringify(exportData));
      
      return exportFilePath;
    } catch (error) {
      console.error('Помилка при експорті даних:', error);
      throw error;
    }
  }
  
  /**
   * Імпорт даних з файлу
   */
  async importData(filePath: string): Promise<void> {
    try {
      const fileContent = await FileSystem.readAsStringAsync(filePath);
      const importedData = JSON.parse(fileContent);
      
      // Перевірка структури даних
      if (!importedData.parts || !Array.isArray(importedData.parts)) {
        throw new Error('Некоректний формат файлу імпорту');
      }
      
      // Зберігаємо імпортовані дані
      this.parts = importedData.parts;
      await this.savePartsToFile();
      
      if (importedData.viewHistory && Array.isArray(importedData.viewHistory)) {
        this.viewHistory = importedData.viewHistory;
        await this.saveHistoryToFile();
      }
      
      if (importedData.favorites && Array.isArray(importedData.favorites)) {
        this.favorites = importedData.favorites;
        await this.saveFavoritesToFile();
      }
    } catch (error) {
      console.error('Помилка при імпорті даних:', error);
      throw error;
    }
  }



  // Отримати унікальні категорії
  async getUniqueCategories(): Promise<string[]> {
    try {
      const parts = await this.getAllParts();
      const uniqueCategories = Array.from(new Set(parts.map(part => part.category).filter(Boolean)));
      return uniqueCategories as string[];
    } catch (error) {
      console.error('Помилка при отриманні унікальних категорій:', error);
      throw error;
    }
  }

  // Отримати унікальних виробників
  async getUniqueManufacturers(): Promise<string[]> {
    try {
      const parts = await this.getAllParts();
      const uniqueManufacturers = Array.from(new Set(parts.map(part => part.manufacturer).filter(Boolean)));
      return uniqueManufacturers as string[];
    } catch (error) {
      console.error('Помилка при отриманні унікальних виробників:', error);
      throw error;
    }
  }

  // Отримати аналоги для запчастини
  async getAnalogs(part: Part): Promise<Part[]> {
    try {
      const allParts = await this.getAllParts();
      
      // Знаходимо аналоги за категорією та схожими характеристиками
      const analogs = allParts.filter(p => 
        p.id !== part.id && (
          p.category === part.category || 
          p.name.toLowerCase().includes(part.name.toLowerCase()) ||
          part.name.toLowerCase().includes(p.name.toLowerCase())
        )
      );
      
      // Обмежуємо кількість аналогів до 10
      return analogs.slice(0, 10);
    } catch (error) {
      console.error('Помилка при отриманні аналогів:', error);
      return [];
    }
  }
  
  /**
   * Очищення всіх запчастин
   */
  async clearAllParts(): Promise<void> {
    try {
      await this.initialize();
      this.parts = [];
      await this.savePartsToFile();
      console.log('Всі запчастини успішно видалено');
    } catch (error) {
      console.error('Помилка при очищенні всіх запчастин:', error);
      throw error;
    }
  }
}

export default FileStorageService;