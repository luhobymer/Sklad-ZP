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
      // Спочатку оптимізуємо зображення для кращого розпізнавання
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1200 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      // Використовуємо Google Cloud Vision API для розпізнавання тексту
      // Це найбільш надійний спосіб для розпізнавання тексту в мобільному додатку
      const apiKey = 'AIzaSyBVvrJLaUvkUd-DhAWxs8LPPWVN_8tQGkI'; // Це демо-ключ, для реального додатку потрібно використовувати власний
      const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
      
      // Конвертуємо зображення в base64
      const base64Image = await this.imageToBase64(manipResult.uri);
      
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
      
      // Відправляємо запит до API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      // Обробляємо відповідь
      const responseData = await response.json();
      
      // Перевіряємо наявність результатів
      if (responseData.responses && 
          responseData.responses[0] && 
          responseData.responses[0].textAnnotations && 
          responseData.responses[0].textAnnotations[0]) {
        return responseData.responses[0].textAnnotations[0].description;
      } else {
        return 'Текст не знайдено на зображенні';
      }
    } catch (error) {
      console.error('Помилка при розпізнаванні тексту:', error);
      Alert.alert('Помилка', 'Не вдалося обробити зображення');
      return 'Не вдалося розпізнати текст з зображення';
    }
  }
  
  // Допоміжний метод для конвертації зображення в base64
  private async imageToBase64(uri: string): Promise<string> {
    try {
      // Читаємо файл як base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64
      });
      return base64;
    } catch (error) {
      console.error('Помилка при конвертації зображення в base64:', error);
      throw error;
    }
  }

  public async extractPartInfo(text: string): Promise<Partial<Part>> {
    const partInfo: Partial<Part> = {};
    
    if (text === 'Розпізнавання тексту недоступне') {
      partInfo.articleNumber = 'DEMO-12345';
      partInfo.name = 'Демо запчастина';
      partInfo.manufacturer = 'DEMO';
      partInfo.price = 999;
      partInfo.category = 'інше';
      return partInfo;
    }
    
    const lines = text.split('\n');

    // Пошук артикула (формат: літери та цифри, можливо з дефісом)
    const articlePattern = /[A-Z0-9][-A-Z0-9]{4,14}/i;
    for (const line of lines) {
      const articleMatch = line.match(articlePattern);
      if (articleMatch) {
        partInfo.articleNumber = articleMatch[0];
        break;
      }
    }

    // Пошук назви (слова з великої літери, можуть містити цифри та спеціальні символи)
    const namePattern = /([A-ZА-ЯІЇЄ][a-zа-яіїє0-9\s\-\.]{2,}(\s[A-ZА-ЯІЇЄ][a-zа-яіїє0-9\s\-\.]{2,})*)/;
    for (const line of lines) {
      const nameMatch = line.match(namePattern);
      if (nameMatch && !partInfo.name) {
        partInfo.name = nameMatch[0].trim();
      }
    }

    // Пошук виробника (великі літери, може містити пробіли та цифри)
    const manufacturerPattern = /([A-Z][A-Z0-9\s]{2,20})/i;
    for (const line of lines) {
      const manufacturerMatch = line.match(manufacturerPattern);
      if (manufacturerMatch && !line.includes(partInfo.articleNumber || '')) {
        partInfo.manufacturer = manufacturerMatch[0].trim();
        break;
      }
    }

    // Пошук ціни (число з можливою десятковою частиною та валютою)
    const pricePattern = /(\d+([.,]\d{2})?)(\s?(?:грн|₴|uah|EUR|€|USD|\$))?/i;
    for (const line of lines) {
      const priceMatch = line.match(pricePattern);
      if (priceMatch) {
        partInfo.price = parseFloat(priceMatch[1].replace(',', '.'));
        break;
      }
    }

    // Пошук категорії (слова з великої літери)
    const categoryPattern = /(двигун|трансмісія|гальма|підвіска|кузов|електрика|освітлення|інтер'єр)/i;
    for (const line of lines) {
      const categoryMatch = line.match(categoryPattern);
      if (categoryMatch) {
        partInfo.category = categoryMatch[0].toLowerCase();
        break;
      }
    }

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