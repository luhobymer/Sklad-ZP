import { Platform } from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';
import { Logger } from '../utils/logger';

const logger = new Logger({ prefix: 'FirebaseService' });

export class FirebaseService {
  private static instance: FirebaseService;
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      if (this.initialized) {
        logger.info('Firebase вже ініціалізовано');
        return;
      }

      logger.info('Ініціалізація Firebase...');
      
      // Увімкнення збору даних про збої
      await crashlytics().setCrashlyticsCollectionEnabled(true);
      
      // Встановлення користувацьких атрибутів
      await crashlytics().setAttribute('platform', Platform.OS);
      await crashlytics().setAttribute('appVersion', require('../../package.json').version);
      
      this.initialized = true;
      logger.info('Firebase успішно ініціалізовано');
    } catch (error) {
      logger.error('Помилка при ініціалізації Firebase:', error);
      // Не викидаємо помилку, щоб додаток міг працювати без Crashlytics
    }
  }

  public logError(error: Error, customMessage?: string): void {
    try {
      if (!this.initialized) {
        logger.warn('Firebase не ініціалізовано, помилка не буде записана');
        return;
      }

      if (customMessage) {
        crashlytics().log(customMessage);
      }

      crashlytics().recordError(error);
      logger.info('Помилка записана в Crashlytics');
    } catch (e) {
      logger.error('Помилка при записі в Crashlytics:', e);
    }
  }

  public setUserId(userId: string): void {
    try {
      if (!this.initialized) {
        logger.warn('Firebase не ініціалізовано, userId не буде встановлено');
        return;
      }

      crashlytics().setUserId(userId);
      logger.info('UserId встановлено в Crashlytics');
    } catch (e) {
      logger.error('Помилка при встановленні userId в Crashlytics:', e);
    }
  }

  public setCustomKey(key: string, value: string | number | boolean): void {
    try {
      if (!this.initialized) {
        logger.warn('Firebase не ініціалізовано, ключ не буде встановлено');
        return;
      }

      // Використовуємо setAttribute для всіх типів значень
      crashlytics().setAttribute(key, value.toString());

      logger.info(`Ключ ${key} встановлено в Crashlytics`);
    } catch (e) {
      logger.error('Помилка при встановленні ключа в Crashlytics:', e);
    }
  }
}