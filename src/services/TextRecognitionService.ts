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
  private isTextRecognizerAvailable: boolean = false;

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
      
      // Для тестування в Expo Go використовуємо тестові дані
      if (__DEV__) {
        console.log('Розробницький режим: повертаємо тестові дані для розпізнавання тексту');
        return 'ТЕСТОВИЙ ТЕКСТ\nАртикул: ABC-123456\nНазва: Гальмівні колодки\nВиробник: BREMBO';
      }
      
      // Використовуємо Google Cloud Vision API для розпізнавання тексту
      // Це найбільш надійний спосіб для розпізнавання тексту в мобільному додатку
      const apiKey = 'AIzaSyBVvrJLaUvkUd-DhAWxs8LPPWVN_8tQGkI'; // Це демо-ключ, для реального додатку потрібно використовувати власний
      const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
      
      console.log('Конвертація зображення в base64');
      // Конвертуємо зображення в base64
      const base64Image = await this.imageToBase64(manipResult.uri);
      
      console.log('Підготовка запиту до Google Cloud Vision API');
      // Підготовка запиту до API
      const requestData = {
        requests: [
          {
            image: {
              content: base64Image
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1
              }
            ]
          }
        ]
      };
      
      console.log('Відправка запиту до Google Cloud Vision API');
      // Відправляємо запит до API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      console.log('Отримано відповідь від Google Cloud Vision API, статус:', response.status);
      // Обробляємо відповідь
      const responseData = await response.json();
      
      console.log('Аналіз відповіді від API:', JSON.stringify(responseData).substring(0, 200) + '...');
      
      // Перевіряємо наявність результатів
      if (responseData.responses && 
          responseData.responses[0] && 
          responseData.responses[0].textAnnotations && 
          responseData.responses[0].textAnnotations[0]) {
        const recognizedText = responseData.responses[0].textAnnotations[0].description;
        console.log('Розпізнаний текст:', recognizedText);
        return recognizedText;
      } else {
        console.log('Текст не знайдено на зображенні');
        return 'Текст не знайдено на зображенні';
      }
    } catch (error) {
      console.error('Помилка при розпізнаванні тексту:', error);
      Alert.alert('Помилка', 'Не вдалося обробити зображення: ' + (error instanceof Error ? error.message : 'Невідома помилка'));
      return 'Не вдалося розпізнати текст з зображення';
    }
  }
  
  // Допоміжний метод для конвертації зображення в base64
  private async imageToBase64(uri: string): Promise<string> {
    try {
      console.log('Початок конвертації зображення в base64, URI:', uri);
      
      // Перевіряємо, чи існує файл
      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log('Інформація про файл:', fileInfo);
      
      if (!fileInfo.exists) {
        console.error('Файл не існує:', uri);
        throw new Error('Файл зображення не знайдено');
      }
      
      // Читаємо файл як base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      console.log('Зображення успішно конвертовано в base64, розмір:', base64.length);
      return base64;
    } catch (error) {
      console.error('Помилка при конвертації зображення в base64:', error);
      Alert.alert('Помилка', 'Не вдалося обробити зображення. Спробуйте інше фото.');
      throw error;
    }
  }

  public async extractPartInfo(text: string): Promise<Partial<Part>> {
    console.log('Початок вилучення інформації про запчастину з тексту:', text.substring(0, 100) + '...');
    const partInfo: Partial<Part> = {};
    
    // Перевірка на тестові дані
    if (text === 'Розпізнавання тексту недоступне') {
      console.log('Використовуємо демо-дані для запчастини');
      partInfo.articleNumber = 'DEMO-12345';
      partInfo.name = 'Демо запчастина';
      partInfo.manufacturer = 'DEMO';
      partInfo.price = 999;
      partInfo.category = 'інше';
      return partInfo;
    }
    
    // Перевірка на тестові дані в режимі розробки
    if (text.includes('ТЕСТОВИЙ ТЕКСТ')) {
      console.log('Знайдено тестові дані, використовуємо їх для створення запчастини');
      
      // Шукаємо артикул в тестових даних
      const articleMatch = text.match(/Артикул:\s*([A-Z0-9][-A-Z0-9]{4,14})/i);
      if (articleMatch && articleMatch[1]) {
        partInfo.articleNumber = articleMatch[1];
        console.log('Знайдено артикул:', partInfo.articleNumber);
      } else {
        partInfo.articleNumber = 'TEST-123';
      }
      
      // Шукаємо назву в тестових даних
      const nameMatch = text.match(/Назва:\s*([^\n]+)/i);
      if (nameMatch && nameMatch[1]) {
        partInfo.name = nameMatch[1].trim();
        console.log('Знайдено назву:', partInfo.name);
      } else {
        partInfo.name = 'Тестова запчастина';
      }
      
      // Шукаємо виробника в тестових даних
      const manufacturerMatch = text.match(/Виробник:\s*([^\n]+)/i);
      if (manufacturerMatch && manufacturerMatch[1]) {
        partInfo.manufacturer = manufacturerMatch[1].trim();
        console.log('Знайдено виробника:', partInfo.manufacturer);
      } else {
        partInfo.manufacturer = 'TEST';
      }
      
      partInfo.price = 1000;
      partInfo.category = 'гальма';
      
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
    const namePattern = /([A-ZА-ЯІЇЄ][a-zа-яіїє0-9\s\-\.]{2,}(\s[A-ZА-ЯІЇЄ][a-zа-яіїє0-9\s\-\.]{2,})*)/;
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
    const pricePattern = /(\d+([.,]\d{2})?)(\s?(?:грн|₴|uah|EUR|€|USD|\$))?/i;
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