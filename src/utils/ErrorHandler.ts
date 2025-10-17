import { Alert, Platform } from 'react-native';
import { STORAGE_KEYS } from '../constants/AppConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseService } from '../services/FirebaseService';

/**
 * Клас для обробки помилок додатку
 */
class ErrorHandler {
  private static instance: ErrorHandler;
  private isDevelopment: boolean = __DEV__;
  private errorReports: Array<{
    timestamp: string;
    error: {
      name: string;
      message: string;
      stack?: string;
    };
    context?: Record<string, unknown>;
  }> = [];
  private maxErrorReports: number = 100;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private async initialize() {
    try {
      const savedErrors = await AsyncStorage.getItem(STORAGE_KEYS.ERROR_REPORTS);
      if (savedErrors) {
        this.errorReports = JSON.parse(savedErrors);
      }
    } catch (error) {
      console.error('Помилка при завантаженні збережених помилок:', error);
    }
  }

  private async saveErrorReports() {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ERROR_REPORTS,
        JSON.stringify(this.errorReports)
      );
    } catch (error) {
      console.error('Помилка при збереженні звітів про помилки:', error);
    }
  }

  /**
   * Обробка помилки
   * @param error - Об'єкт помилки або повідомлення про помилку
   * @param context - Додатковий контекст помилки
   * @param showAlert - Показувати спливаюче повідомлення про помилку
   */
  public handleError(
    error: Error | string | unknown,
    context?: Record<string, unknown>,
    showAlert: boolean = true
  ): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const timestamp = new Date().toISOString();
    
    // Записуємо помилку в консоль у режимі розробки
    if (this.isDevelopment) {
      console.error(`[${timestamp}]`, errorObj);
      if (context) {
        console.error('Контекст помилки:', context);
      }
    }

    // Зберігаємо помилку для подальшого аналізу
    this.errorReports.unshift({
      timestamp,
      error: {
        name: errorObj.name,
        message: errorObj.message,
        stack: errorObj.stack,
      },
      context,
    });

    // Обмежуємо кількість збережених помилок
    if (this.errorReports.length > this.maxErrorReports) {
      this.errorReports = this.errorReports.slice(0, this.maxErrorReports);
    }

    // Зберігаємо оновлений список помилок
    this.saveErrorReports();

    // Логуємо помилку в Firebase Crashlytics
    try {
      FirebaseService.getInstance().logError(errorObj, `${errorObj.name}: ${errorObj.message}`);
      if (context) {
        FirebaseService.getInstance().setCustomKey('errorContext', JSON.stringify(context));
      }
    } catch (e) {
      console.error('Помилка при логуванні в Crashlytics:', e);
    }

    // Показуємо користувачу повідомлення про помилку, якщо потрібно
    if (showAlert) {
      this.showErrorAlert(errorObj, context);
    }
  }

  /**
   * Показує спливаюче повідомлення про помилку
   */
  private showErrorAlert(error: Error, context?: any): void {
    let message = 'Сталася помилка. Будь ласка, спробуйте ще раз.';
    
    // Кастомні повідомлення для різних типів помилок
    if (error.message.includes('network')) {
      message = 'Помилка мережі. Перевірте підключення до інтернету.';
    } else if (error.message.includes('timeout')) {
      message = 'Час очікування вийшов. Спробуйте ще раз.';
    } else if (error.message.includes('permission')) {
      message = 'Недостатньо дозволів для виконання цієї дії.';
    }

    // У режимі розробки показуємо більш детальну інформацію
    if (this.isDevelopment) {
      message += `\n\n${error.name}: ${error.message}`;
      if (context) {
        message += `\n\nКонтекст: ${JSON.stringify(context, null, 2)}`;
      }
    }

    // Показуємо спливаюче повідомлення
    Alert.alert(
      'Помилка',
      message,
      [{ text: 'OK' }],
      { cancelable: true }
    );
  }

  /**
   * Отримує всі збережені помилки
   */
  public getErrorReports() {
    return [...this.errorReports];
  }

  /**
   * Очищає всі збережені помилки
   */
  public async clearErrorReports() {
    this.errorReports = [];
    await AsyncStorage.removeItem(STORAGE_KEYS.ERROR_REPORTS);
  }

  /**
   * Налаштування глобальної обробки помилок
   */
  public setupGlobalErrorHandling(): void {
    // Обробка необроблених помилок
    if (typeof window !== 'undefined') {
      window.onerror = (message, source, lineno, colno, error) => {
        const errorObj = error || new Error(String(message));
        const context = { 
          source: 'window.onerror',
          sourceFile: source,
          line: lineno,
          column: colno
        };
        
        this.handleError(errorObj, context, true);
        
        // Логуємо помилку в Firebase Crashlytics напряму
        try {
          FirebaseService.getInstance().logError(errorObj, 'Необроблена помилка');
          FirebaseService.getInstance().setCustomKey('errorContext', JSON.stringify(context));
        } catch (e) {
          console.error('Помилка при логуванні в Crashlytics:', e);
        }
        
        // Повертаємо false, щоб помилка також показувалася в консолі
        return false;
      };
    }

    // Обробка необроблених відхилень промісів
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason || new Error('Unhandled promise rejection');
        this.handleError(error, { source: 'unhandledrejection' }, true);
      });
    }
  }
}

export default ErrorHandler.getInstance();
