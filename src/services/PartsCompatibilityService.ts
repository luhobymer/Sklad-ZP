import fileStorageServiceInstance, { FileStorageService as FileStorageServiceType } from './FileStorageService';
import { Part } from '../models/Part';
import { Logger } from '../utils/logger';

export class PartsCompatibilityService {
  // Створюємо логер для PartsCompatibilityService
  private logger: Logger;

  private static instance: PartsCompatibilityService;
  private storageService: FileStorageServiceType;

  private constructor() {
    this.logger = Logger.getInstance({ prefix: 'PartsCompatibilityService' });
    this.storageService = fileStorageServiceInstance as any;
  }

  public static getInstance(): PartsCompatibilityService {
    if (!PartsCompatibilityService.instance) {
      PartsCompatibilityService.instance = new PartsCompatibilityService();
    }
    return PartsCompatibilityService.instance;
  }

  public async findCompatibleParts(part: Part): Promise<Part[]> {
    try {
      const allParts = await this.storageService.getAllParts();
      
      // Фільтруємо запчастини, які мають ту ж категорію і виробника, але не є тією ж запчастиною
      // Також перевіряємо, чи є спільні сумісні автомобілі
      const compatibleParts = allParts.filter((p: Part) => {
        if (p.id === part.id) return false;
        if (p.category !== part.category) return false;
        if (p.manufacturer !== part.manufacturer) return false;
        
        // Якщо сумісні автомобілі не вказані, то пропускаємо цю перевірку
        if (!part.compatibleCars || !p.compatibleCars) return true;
        
        // Перевіряємо наявність спільних сумісних автомобілів
        return part.compatibleCars.some(car => 
          p.compatibleCars?.includes(car)
        );
      });
      
      return compatibleParts;
    } catch (error) {
      this.logger.error('Помилка при пошуку сумісних запчастин:', error);
      throw error;
    }
  }

  public async findAnalogs(part: Part): Promise<Part[]> {
    try {
      const allParts = await this.storageService.getAllParts();
      
      // Фільтруємо запчастини, які мають ту ж категорію, але різних виробників
      // і не є тією ж запчастиною
      // Також перевіряємо, чи є спільні сумісні автомобілі
      const analogs = allParts.filter((p: Part) => {
        if (p.id === part.id) return false;
        if (p.category !== part.category) return false;
        
        // Якщо сумісні автомобілі не вказані, то пропускаємо цю перевірку
        if (!part.compatibleCars || !p.compatibleCars) return true;
        
        // Перевіряємо наявність спільних сумісних автомобілів
        return part.compatibleCars.some(car => 
          p.compatibleCars?.includes(car)
        );
      });
      
      return analogs;
    } catch (error) {
      this.logger.error('Помилка при пошуку аналогів:', error);
      throw error;
    }
  }
}