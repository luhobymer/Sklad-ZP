import { FileStorageService } from '../services/FileStorageService';
import { Part, createPart, PartAnalog } from '../models/Part';
// Використовуємо require після оголошення mock, щоб уникнути завантаження нативного модуля до підміни

import { FileStorageServiceInterface } from '../types/services';

// Допоміжна функція для перетворення дат у рядки
const toISODateString = (date: Date): string => date.toISOString();

// Моки для react-native-fs
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/test/documents',
  mkdir: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn(),
  writeFile: jest.fn().mockResolvedValue(undefined),
  unlink: jest.fn().mockResolvedValue(undefined),
  exists: jest.fn().mockResolvedValue(true),
  readDir: jest.fn(),
  stat: jest.fn().mockResolvedValue({ isDirectory: () => true }),
}));
// Після оголошення mock отримуємо посилання на модуль
// @ts-ignore
const RNFS = require('react-native-fs');

// Моки для логера
jest.mock('../utils/logger', () => ({
  fileStorageLogger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('FileStorageService', () => {
  let service: FileStorageServiceInterface;
  // Оголошуємо базову тестову запчастину
  const createTestPart = (overrides: Partial<Omit<Part, 'id' | 'createdAt' | 'updatedAt'>> = {}): Omit<Part, 'id'> => {
    const now = new Date();
    
    // Визначаємо базові значення
    const baseValues: Omit<Part, 'id' | 'createdAt' | 'updatedAt'> = {
      articleNumber: 'TEST123',
      name: 'Test Part',
      manufacturer: 'Test Manufacturer',
      category: 'Test Category',
      isNew: true,
      quantity: 10,
      price: 100,
      description: 'Test description',
      photoPath: null,
      compatibleCars: [],
      type: 'Test Type',
      model: 'Test Model',
      dimensions: '10x10x10cm',
      analogs: [],
      isFavorite: false,
      lastViewed: now
    };
    
    // Об'єднуємо з перевизначеннями
    const partData = {
      ...baseValues,
      ...overrides
    };
    
    // Використовуємо createPart для валідації даних
    const part = createPart(partData);
    
    // Додаємо поля часу (примусово, оскільки ми знаємо, що вони будуть додані)
    (part as any).createdAt = now;
    (part as any).updatedAt = now;
    
    return part as Omit<Part, 'id'>;
  };
  
  let testPart: ReturnType<typeof createTestPart>;

  beforeEach(async () => {
    // Очищаємо всі моки перед кожним тестом
    jest.clearAllMocks();
    
    // Створюємо новий екземпляр сервісу для кожного тесту
    service = FileStorageService.getInstance() as unknown as FileStorageServiceInterface;
    // Скидаємо внутрішні дані сервісу між тестами
    await service.clearAllData();
    
    // Створюємо тестову запчастину
    testPart = createTestPart();
    
    // Налаштовуємо моки за замовчуванням
    (RNFS.exists as jest.Mock).mockResolvedValue(false);
    (RNFS.mkdir as jest.Mock).mockResolvedValue(undefined);
    (RNFS.readFile as jest.Mock).mockRejectedValue(new Error('File not found'));
    (RNFS.writeFile as jest.Mock).mockResolvedValue(undefined);
  });

  describe('addPart', () => {
    it('should add a new part and return it with an ID', async () => {
      // Налаштовуємо мок для читання файлу (файл не існує)
      (RNFS.readFile as jest.Mock).mockRejectedValueOnce(new Error('File not found'));
      
      // Налаштовуємо мок для запису файлу
      (RNFS.writeFile as jest.Mock).mockResolvedValue(undefined);
      // Перехоплюємо запис у файл без додаткових перевірок
      (RNFS.writeFile as jest.Mock).mockResolvedValue(undefined);
      
      // Викликаємо метод, який тестуємо
      const newId = await service.addPart(testPart);
      
      // Перевіряємо результати
      expect(typeof newId).toBe('number');
      expect(newId).toBeGreaterThan(0);
      expect(RNFS.writeFile).toHaveBeenCalled();
    });
  });

  describe('getPartById', () => {
    it('should return a part by ID', async () => {
      const now = new Date();
      // Створюємо об'єкт запчастини з усіма необхідними полями
      // Додаємо запчастину через сервис
      const id = await service.addPart(testPart);
      const testPartWithId: Part = {
        ...testPart,
        id: 1,
        createdAt: now,
        updatedAt: now,
        // Додаємо всі обов'язкові поля з інтерфейсу Part
        type: 'Test Type',
        model: 'Test Model',
      };
      
      // Викликаємо метод, який тестуємо
      const result = await service.getPartById(id);
      
      // Перевіряємо результати
      expect(result).toBeDefined();
      if (result) {
        expect(result.id).toBe(id);
        expect(result.articleNumber).toBe('TEST123');
        expect(result.name).toBe('Test Part');
        expect(result.manufacturer).toBe('Test Manufacturer');
        expect(result.category).toBe('Test Category');
        expect(result.isNew).toBe(true);
        expect(result.quantity).toBe(10);
        expect(result.price).toBe(100);
        expect(result.description).toBe('Test description');
        expect(result.photoPath).toBeNull();
        expect(Array.isArray(result.compatibleCars)).toBe(true);
        expect(result.createdAt).toBeInstanceOf(Date);
        expect(result.updatedAt).toBeInstanceOf(Date);
      }
    });

    it('should return undefined if part not found', async () => {
            // Файл існує
      (RNFS.exists as jest.Mock).mockResolvedValueOnce(true);
      // Налаштовуємо мок для читання файлу (пустий масив)
      (RNFS.readFile as jest.Mock).mockResolvedValueOnce('[]');
      
      // Викликаємо метод, який тестуємо
      const result = await service.getPartById(999);
      
      // Перевіряємо результати
      expect(result).toBeUndefined();
    });
  });

  describe('updatePart', () => {
    it('should update an existing part', async () => {
      const now = new Date();
      const existingPart = { 
        ...testPart, 
        id: 1, 
        createdAt: now,
        updatedAt: now
      };
      
      const updatedPart: Part = { 
        ...existingPart, 
        name: 'Updated Name',
        updatedAt: new Date()
      };
      
      // Налаштовуємо моки
      (RNFS.readFile as jest.Mock).mockResolvedValueOnce(
        JSON.stringify([existingPart])
      );
      
      (RNFS.writeFile as jest.Mock).mockResolvedValue(undefined);
      // Викликаємо метод, який тестуємо
      await service.updatePart(updatedPart);
      
      // Перевіряємо результати
      expect(RNFS.writeFile).toHaveBeenCalled();
    });
  });

  describe('deletePart', () => {
    it('should delete a part by ID', async () => {
      const now = new Date();
      const existingPart = { 
        ...testPart, 
        id: 1,
        createdAt: now,
        updatedAt: now
      };
      
      // Налаштовуємо моки
      (RNFS.readFile as jest.Mock).mockResolvedValueOnce(
        JSON.stringify([existingPart])
      );
      
      (RNFS.writeFile as jest.Mock).mockResolvedValue(undefined);
      
      // Викликаємо метод, який тестуємо
      await service.deletePart(1);
      
      // Перевіряємо результати
      expect(RNFS.writeFile).toHaveBeenCalled();
      
      expect(RNFS.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        '[]',
        'utf8'
      );
    });
  });

  describe('getAllParts', () => {
    it('should return all parts', async () => {
      // Додаємо дві запчастини
      await service.addPart(testPart);
      await service.addPart({ ...testPart, articleNumber: 'TEST124' });
      
      // Викликаємо метод, який тестуємо
      const result = await service.getAllParts();
      
      // Перевіряємо результати
      expect(result.length).toBe(2);
      expect(result[0]).toMatchObject({
        articleNumber: 'TEST123',
        name: 'Test Part',
        manufacturer: 'Test Manufacturer'
      });
      expect(result[1]).toMatchObject({
        articleNumber: 'TEST124',
        name: 'Test Part',
        manufacturer: 'Test Manufacturer'
      });
    });

    it('should return empty array if file does not exist', async () => {
      // Налаштовуємо мок для читання файлу (файл не існує)
      (RNFS.readFile as jest.Mock).mockRejectedValueOnce(new Error('File not found'));
      
      // Викликаємо метод, який тестуємо
      const result = await service.getAllParts();
      
      // Перевіряємо результати
      expect(result).toEqual([]);
    });
  });
});
