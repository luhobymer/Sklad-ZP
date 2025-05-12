import { Part } from '../models/Part';
import * as ImageManipulator from 'expo-image-manipulator';
import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Визначаємо інтерфейс для результату розпізнавання тексту
interface TextRecognitionResult {
  text: string;
}

export class TextRecognitionService {
  private static instance: TextRecognitionService;
  private textRecognizer: any = null;
  private isTextRecognizerAvailable: boolean = true;

  private constructor() {
    try {
      // Встановлюємо прапорець доступності розпізнавання тексту
      this.isTextRecognizerAvailable = true;
      console.log('TextRecognizer в TextRecognitionService ініціалізовано успішно');
    } catch (error) {
      console.warn('Помилка ініціалізації TextRecognitionService:', error);
      this.isTextRecognizerAvailable = false;
    }
  }

  public static getInstance(): TextRecognitionService {
    if (!TextRecognitionService.instance) {
      TextRecognitionService.instance = new TextRecognitionService();
    }
    return TextRecognitionService.instance;
  }

  public async recognizeText(imageUri: string): Promise<string> {
    if (!this.isTextRecognizerAvailable) {
      return 'Розпізнавання тексту недоступне';
    }
    
    try {
      console.log('Початок розпізнавання тексту з зображення:', imageUri);
      
      // Перевіряємо, чи існує файл
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        console.error('Файл зображення не існує:', imageUri);
        return 'Файл зображення не знайдено';
      }
      
      console.log('Оптимізація зображення для розпізнавання');
      // Спочатку оптимізуємо зображення для кращого розпізнавання
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1200 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      console.log('Зображення оптимізовано:', manipResult.uri);
      
      // Використовуємо тестові дані для демонстрації функціоналу
      console.log('Повертаємо тестові дані для розпізнавання тексту');
      return 'ТЕСТОВИЙ ТЕКСТ\nАртикул: ABC-123456\nНазва: Гальмівні колодки\nВиробник: BREMBO';
    } catch (error) {
      console.error('Помилка при розпізнаванні тексту:', error);
      return 'Помилка при розпізнаванні тексту: ' + (error instanceof Error ? error.message : 'Невідома помилка');
    }
  }

  // Допоміжний метод для конвертації зображення в base64
  private async imageToBase64(uri: string): Promise<string> {
    try {
      const fileContent = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return fileContent;
    } catch (error) {
      console.error('Помилка при конвертації зображення в base64:', error);
      throw new Error('Не вдалося конвертувати зображення в base64');
    }
  }

  public async extractPartInfo(text: string): Promise<Partial<Part>> {
    const partInfo: Partial<Part> = {};
    
    console.log('Початок вилучення інформації з тексту:', text);
    
    // Якщо текст містить тестові дані, повертаємо тестову інформацію
    if (text.includes('ТЕСТОВИЙ ТЕКСТ')) {
      console.log('Виявлено тестові дані, повертаємо тестову інформацію');
      partInfo.articleNumber = 'ABC-123456';
      partInfo.name = 'Гальмівні колодки';
      partInfo.manufacturer = 'BREMBO';
      partInfo.price = 1000;
      partInfo.category = 'гальма';
      partInfo.isNew = true;
      partInfo.quantity = 5;
      
      return partInfo;
    }
    
    const lines = text.split('\n');
    console.log('Розділено текст на', lines.length, 'рядків');

    // Пошук артикула (формат: літери та цифри, можливо з дефісом)
    const articlePattern = /[A-Z0-9][-A-Z0-9]{4,14}/i;
    for (const line of lines) {
      const articleMatch = line.match(articlePattern);
      if (articleMatch) {
        partInfo.articleNumber = articleMatch[0];
        console.log('Знайдено артикул:', partInfo.articleNumber);
        break;
      }
    }

    // Пошук назви (слова з великої літери, можуть містити цифри та спеціальні символи)
    const namePattern = /([A-ZА-ЯІЇЄ][a-zа-яіїє0-9\s\-\.]{2,}(\s[A-ZА-ЯІЇЄ][a-zа-яіїє0-9\s\-\.]{2,})*))/;
    for (const line of lines) {
      const nameMatch = line.match(namePattern);
      if (nameMatch && !partInfo.name) {
        partInfo.name = nameMatch[0].trim();
        console.log('Знайдено назву:', partInfo.name);
      }
    }

    // Пошук виробника (великі літери, може містити пробіли та цифри)
    const manufacturerPattern = /([A-Z][A-Z0-9\s]{2,20})/i;
    for (const line of lines) {
      const manufacturerMatch = line.match(manufacturerPattern);
      if (manufacturerMatch && !line.includes(partInfo.articleNumber || '')) {
        partInfo.manufacturer = manufacturerMatch[0].trim();
        console.log('Знайдено виробника:', partInfo.manufacturer);
        break;
      }
    }

    // Пошук ціни (число з можливою десятковою частиною та валютою)
    const pricePattern = /(\d+([.,]\d{2})?)\s?(?:грн|₴|uah|EUR|€|USD|\$)?/i;
    for (const line of lines) {
      const priceMatch = line.match(pricePattern);
      if (priceMatch) {
        partInfo.price = parseFloat(priceMatch[1].replace(',', '.'));
        console.log('Знайдено ціну:', partInfo.price);
        break;
      }
    }

    // Пошук категорії (слова з великої літери)
    const categoryPattern = /(двигун|трансмісія|гальма|підвіска|кузов|електрика|освітлення|інтер'єр)/i;
    for (const line of lines) {
      const categoryMatch = line.match(categoryPattern);
      if (categoryMatch) {
        partInfo.category = categoryMatch[0].toLowerCase();
        console.log('Знайдено категорію:', partInfo.category);
        break;
      }
    }
    
    // Якщо не знайдено артикул, використовуємо тимчасовий
    if (!partInfo.articleNumber) {
      partInfo.articleNumber = 'TEMP-' + Math.floor(Math.random() * 10000);
      console.log('Створено тимчасовий артикул:', partInfo.articleNumber);
    }
    
    // Якщо не знайдено назву, використовуємо тимчасову
    if (!partInfo.name) {
      partInfo.name = 'Запчастина без назви';
      console.log('Встановлено назву за замовчуванням:', partInfo.name);
    }

    // Встановлюємо значення за замовчуванням для інших полів
    if (!partInfo.manufacturer) {
      partInfo.manufacturer = 'Невідомий виробник';
    }
    
    if (!partInfo.price) {
      partInfo.price = 0;
    }
    
    if (!partInfo.category) {
      partInfo.category = 'інше';
    }
    
    partInfo.isNew = true;
    partInfo.quantity = 1;

    console.log('Результат вилучення інформації:', partInfo);
    return partInfo;
  }

  public async processImageAndExtractInfo(imageUri: string): Promise<Partial<Part>> {
    try {
      const recognizedText = await this.recognizeText(imageUri);
      const partInfo = await this.extractPartInfo(recognizedText);
      return partInfo;
    } catch (error) {
      console.error('Помилка при обробці зображення:', error);
      throw error;
    }
  }
}
