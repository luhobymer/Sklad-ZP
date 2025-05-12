import FileStorageService from './FileStorageService';
import { Part } from '../models/Part';

export class PartsCompatibilityService {
  private static instance: PartsCompatibilityService;
  private storageService: FileStorageService;

  private constructor() {
    this.storageService = FileStorageService.getInstance();
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
      const compatibleParts = allParts.filter(p => {
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
      console.error('Помилка при пошуку сумісних запчастин:', error);
      throw error;
    }
  }

  public async findAnalogs(part: Part): Promise<Part[]> {
    try {
      const allParts = await this.storageService.getAllParts();
      
      // Фільтруємо запчастини, які мають ту ж категорію, але різних виробників
      // і не є тією ж запчастиною
      // Також перевіряємо, чи є спільні сумісні автомобілі
      const analogs = allParts.filter(p => {
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
      console.error('Помилка при пошуку аналогів:', error);
      throw error;
    }
  }
}