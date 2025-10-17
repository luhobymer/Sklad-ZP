/**
 * Тести для TextRecognitionService
 */
import { TextRecognitionService } from '../src/services/TextRecognitionService';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import { PartExtractionResult } from '../src/types/services';

// Jest globals are available without explicit import

// Мокуємо модулі react-native-fs та react-native-image-resizer
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: 'file:///mock/directory/',
  exists: jest.fn().mockResolvedValue(true),
  readFile: jest.fn().mockResolvedValue('test content'),
  writeFile: jest.fn().mockResolvedValue(undefined),
  stat: jest.fn().mockResolvedValue({ isFile: () => true, isDirectory: () => false }),
}));

jest.mock('react-native-image-resizer', () => ({
  createResizedImage: jest.fn().mockImplementation((uri: string, width: number, height: number, format: string, quality: number) => {
    return Promise.resolve({ uri: 'file:///optimized-image.jpg', width: 800, height: 600, size: 12345 });
  }),
}));

describe('TextRecognitionService', () => {
  let service: TextRecognitionService;
  
  beforeEach(() => {
    // Очищаємо моки перед кожним тестом
    jest.clearAllMocks();
    
    // Отримуємо екземпляр сервісу
    service = TextRecognitionService.getInstance();
  });
  
  test('getInstance повертає той самий екземпляр (Singleton)', () => {
    const instance1 = TextRecognitionService.getInstance();
    const instance2 = TextRecognitionService.getInstance();
    
    expect(instance1).toBe(instance2);
  });
  
  test('optimizeImageForRecognition оптимізує зображення', async () => {
    const imageUri = 'file:///test-image.jpg';
    const optimizedImageUri = await service.optimizeImageForRecognition(imageUri);
    
    // Перевіряємо, що createResizedImage було викликано
    expect(ImageResizer.createResizedImage).toHaveBeenCalled();
    
    // Перевіряємо, що повернуто URI оптимізованого зображення
    expect(optimizedImageUri).toBe('file:///optimized-image.jpg');
  });
  
  test('recognizeText перевіряє існування файлу перед розпізнаванням', async () => {
    const imageUri = 'file:///test-image.jpg';
    
    // Мокуємо exists, щоб повернути, що файл існує
    (RNFS.exists as jest.Mock).mockResolvedValueOnce(true);
    
    await service.recognizeText(imageUri);
    
    // Перевіряємо, що exists було викликано з правильним URI
    expect(RNFS.exists).toHaveBeenCalledWith(imageUri);
  });
  
  test('recognizeText повертає помилку, якщо файл не існує', async () => {
    const imageUri = 'file:///non-existent-image.jpg';
    
    // Мокуємо exists, щоб повернути, що файл не існує
    (RNFS.exists as jest.Mock).mockResolvedValueOnce(false);
    
    // Очікуємо, що метод поверне помилку
    await expect(service.recognizeText(imageUri)).rejects.toThrow('Файл зображення не існує');
  });
  
  test('extractPartInfo вилучає інформацію про запчастину з тексту', async () => {
    const text = `
      Артикул: ABC123
      Назва: Гальмівний диск
      Виробник: Bosch
      Ціна: 1500 грн
      Категорія: Гальмівна система
    `;
    
    const result = await service.extractPartInfo(text);
    
    // Перевіряємо, що вилучено правильну інформацію
    expect(result.success).toBe(true);
    expect(result.part?.articleNumber).toBe('ABC123');
    expect(result.part?.name).toBe('Гальмівний диск');
    expect(result.part?.manufacturer).toBe('Bosch');
    expect(result.part?.price).toBe(1500);
    expect(result.part?.category).toBe('Гальмівна система');
  });
});
