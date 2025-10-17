// Видалено залежність від expo-file-system
import RNFS from 'react-native-fs';
// TODO: Замінити на react-native-inappbrowser-reborn або Linking.openURL
// TODO: Замінити на Google Sign-In для React Native
import { Alert, Platform, LogBox } from 'react-native';
import { getGoogleAuthConfig } from '../config/google';
import { DriveFile, DriveFolder, DriveError, DriveFileList, DriveUploadOptions, DriveDownloadOptions } from '../types/drive';
import { GoogleDriveServiceInterface } from '../types/services';
import { Logger } from '../utils/logger';
import { formatFileSize } from '../utils/formatters';
import { useState, useEffect, useCallback } from 'react';
// Мок для Google Signin, оскільки модуль може бути відсутнім
const GoogleSignin = {
  configure: () => {},
  signIn: async () => ({ user: { id: 'mock', email: 'mock@example.com' }, idToken: 'mock', accessToken: 'mock' }),
  signOut: async () => {},
  isSignedIn: async () => false,
  getCurrentUser: async () => null,
  getTokens: async () => ({ accessToken: 'mock_access_token', idToken: 'mock_id_token' }),
};

const statusCodes = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
};

type User = any;

/**
 * Інтерфейс для конфігурації Google Auth
 * @interface GoogleAuthConfig
 */
interface GoogleAuthConfig {
  /** Ідентифікатор клієнта Google OAuth */
  clientId: string;
  /** URL перенаправлення після авторизації */
  redirectUri: string;
  /** Масив областей доступу для Google API */
  scopes: string[];
}

// Ігноруємо попередження про використання WebView та інші некритичні попередження
LogBox.ignoreLogs([
  'WebView',
  'Setting a timer',
  'AsyncStorage has been extracted',
]);

/**
 * Константи для роботи з Google Drive API
 */
// Базові URL-адреси API
const GOOGLE_DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const GOOGLE_DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';

// MIME-типи
const GOOGLE_DRIVE_FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';
const JSON_MIME_TYPE = 'application/json';

// Назва папки за замовчуванням для резервних копій
const DEFAULT_BACKUP_FOLDER_NAME = 'Склад Автозапчастин - Резервні копії';

/**
 * Логер для GoogleDriveService
 * Використовується для відстеження операцій з Google Drive
 */
const driveLogger = new Logger({ prefix: 'GoogleDriveService' });

/**
 * Клас для роботи з Google Drive API
 * Реалізує інтерфейс GoogleDriveServiceInterface
 * 
 * На даний момент містить заглушки для методів, які будуть реалізовані пізніше при інтеграції з реальним Google Drive API.
 * Використовує патерн Singleton для забезпечення єдиного екземпляру сервісу в додатку.
 * 
 * @class GoogleDriveService
 * @implements {GoogleDriveServiceInterface}
 */
class GoogleDriveService implements GoogleDriveServiceInterface {
  /** Токен доступу до Google Drive API */
  private accessToken: string | null = null;
  
  /** Статус ініціалізації сервісу */
  private initialized = false;
  
  /** Конфігурація авторизації Google */
  private googleAuthConfig: GoogleAuthConfig;
  
  /** Ідентифікатор папки для резервних копій */
  private backupFolderId: string | null = null;
  private driveFiles: DriveFile[] = [];
  
  /** Єдиний екземпляр класу (патерн Singleton) */
  private static instance: GoogleDriveService;

  /**
   * Приватний конструктор для реалізації патерну Singleton
   * Ініціалізує конфігурацію Google Auth
   * @private
   */
  private constructor() {
    this.googleAuthConfig = getGoogleAuthConfig();
    driveLogger.info('Створено новий екземпляр GoogleDriveService');
  }

  /**
   * Отримання єдиного екземпляру класу (Singleton)
   * Забезпечує існування лише одного екземпляру сервісу в додатку
   * 
   * @returns {GoogleDriveService} Єдиний екземпляр GoogleDriveService
   * @static
   * @public
   */
  public static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
      driveLogger.info('Створено новий екземпляр GoogleDriveService через getInstance');
    }
    return GoogleDriveService.instance;
  }

  /**
   * Ініціалізація сервісу Google Drive
   * Перевіряє стан ініціалізації та виконує необхідні підготовчі операції
   * 
   * @returns {Promise<boolean>} Результат ініціалізації (true - успішно, false - помилка)
   * @public
   */
  /**
   * Отримання поточного токена доступу
   * @returns {string | null} Поточний токен доступу або null
   * @public
   */
  public getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Ініціалізація сервісу Google Drive
   * Перевіряє стан ініціалізації та виконує необхідні підготовчі операції
   *
   * @returns {Promise<boolean>} Результат ініціалізації (true - успішно, false - помилка)
   * @public
   */
  public async initialize(): Promise<boolean> {
    try {
      // Якщо сервіс вже ініціалізовано, повертаємо true
      if (this.initialized) {
        driveLogger.debug('Google Drive Service вже ініціалізовано');
        return true;
      }

      driveLogger.info('Початок ініціалізації Google Drive Service');

      // Перевіряємо наявність збереженого токену
      // TODO: Реалізувати збереження токену в SecureStore
      // Наприклад: this.accessToken = await SecureStore.getItemAsync('google_drive_token');
      
      // Перевіряємо наявність конфігурації Google Auth
      if (!this.googleAuthConfig || !this.googleAuthConfig.clientId) {
        driveLogger.error('Помилка ініціалізації: відсутня конфігурація Google Auth');
        return false;
      }
      
      this.initialized = true;
      driveLogger.info('Google Drive Service успішно ініціалізовано');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
      driveLogger.error(`Помилка ініціалізації Google Drive Service: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Перевірка, чи авторизований користувач
   * Перевіряє наявність та валідність токена доступу
   * 
   * @returns {Promise<boolean>} Результат перевірки авторизації (true - авторизований, false - не авторизований)
   * @public
   */
  public async isAuthorized(): Promise<boolean> {
    try {
      // Спочатку перевіряємо, чи ініціалізовано сервіс
      await this.initialize();
      
      // Перевіряємо наявність токена доступу
      const isAuth = !!this.accessToken;
      
      driveLogger.debug(`Статус авторизації: ${isAuth ? 'авторизований' : 'не авторизований'}`);
      return isAuth;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
      driveLogger.error(`Помилка при перевірці статусу авторизації: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Авторизація в Google Drive
   * Запускає процес авторизації користувача в Google Drive
   * 
   * @returns {Promise<boolean>} Результат авторизації (true - успішно, false - помилка)
   * @public
   */
  public async authorize(): Promise<boolean> {
    try {
      // Спочатку перевіряємо, чи вже авторизований
      const isAlreadyAuthorized = await this.isAuthorized();
      if (isAlreadyAuthorized) {
        driveLogger.info('Користувач вже авторизований в Google Drive');
        return true;
      }
      driveLogger.info('Початок процесу авторизації в Google Drive');
      // Ініціалізуємо Google Sign-In
      GoogleSignin.configure();
      try {
        const userInfo = await GoogleSignin.signIn();
        const tokens = await GoogleSignin.getTokens();
        this.accessToken = tokens.accessToken;
        driveLogger.info('Авторизація Google Drive успішна');
        return true;
      } catch (err: any) {
        if (err.code === statusCodes.SIGN_IN_CANCELLED) {
          driveLogger.info('Користувач скасував вхід через Google');
        } else if (err.code === statusCodes.IN_PROGRESS) {
          driveLogger.info('Вхід через Google вже виконується');
        } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          driveLogger.error('Google Play Services недоступні');
        } else {
          driveLogger.error(`Помилка авторизації Google: ${err.message}`);
        }
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
      driveLogger.error(`Помилка авторизації в Google Drive: ${errorMessage}`);
      Alert.alert('Помилка авторизації', 'Не вдалося увійти через Google Drive');
      return false;
    }
  }

  /**
   * Завантаження файлу на Google Drive
   * Завантажує локальний файл на Google Drive та повертає його ідентифікатор
   * 
   * @param {string} localPath Локальний шлях до файлу
   * @param {string} fileName Назва файлу на Google Drive
   * @returns {Promise<string>} Ідентифікатор файлу на Google Drive
   * @throws {Error} Якщо користувач не авторизований або файл не існує
   * @public
   */
  public async uploadFile(localPath: string, fileName: string): Promise<string> {
    try {
      driveLogger.info(`Початок завантаження файлу на Google Drive: ${fileName}`);
      
      // Ініціалізуємо сервіс
      await this.initialize();
      
      // Перевіряємо авторизацію
      if (!this.accessToken) {
        const errorMessage = 'Користувач не авторизований в Google Drive';
        driveLogger.error(errorMessage);
        throw new Error(errorMessage);
      }

      // Перевіряємо наявність файлу
      const fileExists = await RNFS.exists(localPath);
      if (!fileExists) {
        const errorMessage = `Файл не знайдено: ${localPath}`;
        driveLogger.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      // Отримуємо інформацію про файл
      const fileInfo = await RNFS.stat(localPath);
      driveLogger.debug(`Файл знайдено: ${localPath}, розмір: ${(fileInfo as any).size || 0} байт`);

      // Читаємо вміст файлу
      const fileContent = await RNFS.readFile(localPath, 'utf8');
      driveLogger.debug(`Файл успішно прочитано, довжина вмісту: ${fileContent.length} символів`);
      
      // Отримуємо або створюємо папку для резервних копій
      if (!this.backupFolderId) {
        driveLogger.info('Отримання або створення папки для резервних копій');
        this.backupFolderId = await this.getOrCreateBackupFolder();
        driveLogger.debug(`Отримано ідентифікатор папки: ${this.backupFolderId}`);
      }
      
      // Створюємо метадані файлу
      const metadata = {
        name: fileName,
        mimeType: JSON_MIME_TYPE,
        parents: [this.backupFolderId || 'root']
      };
      
      driveLogger.info(`Завантаження файлу на Google Drive: ${fileName}`);
      
      // Це заглушка для демонстрації інтерфейсу
      // TODO: Реалізувати реальне завантаження на Google Drive
      /*
      // Приклад реалізації з використанням fetch API:
      const metadataString = JSON.stringify(metadata);
      const boundary = `boundary-${Date.now()}`;
      const contentType = `multipart/related; boundary=${boundary}`;
      
      const body = `--${boundary}\r\n` +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        `${metadataString}\r\n` +
        `--${boundary}\r\n` +
        `Content-Type: ${JSON_MIME_TYPE}\r\n\r\n` +
        `${fileContent}\r\n` +
        `--${boundary}--`;

      const response = await fetch(`${GOOGLE_DRIVE_UPLOAD_URL}/files?uploadType=multipart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': contentType,
          'Content-Length': body.length.toString()
        },
        body
      });

      if (!response.ok) {
        throw new Error(`Помилка завантаження: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.id;
      */
      
      // Заглушка - генеруємо унікальний ідентифікатор файлу
      const fileId = `drive_file_${Date.now()}`;
      driveLogger.info(`Файл успішно завантажено на Google Drive, ідентифікатор: ${fileId}`);
      return fileId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
      driveLogger.error(`Помилка при завантаженні файлу на Google Drive: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Завантаження файлу з Google Drive
   * Завантажує файл з Google Drive за його ідентифікатором та зберігає його локально
   * 
   * @param {string} fileId Ідентифікатор файлу на Google Drive
   * @param {string} localPath Локальний шлях для збереження файлу
   * @returns {Promise<void>} Promise, який вирішується після завершення завантаження
   * @throws {Error} Якщо користувач не авторизований або виникла помилка при завантаженні
   * @public
   */
  public async downloadFile(fileId: string, localPath: string): Promise<void> {
    try {
      driveLogger.info(`Початок завантаження файлу з Google Drive, ідентифікатор: ${fileId}`);
      
      // Ініціалізуємо сервіс
      await this.initialize();
      
      // Перевіряємо авторизацію
      if (!this.accessToken) {
        const errorMessage = 'Користувач не авторизований в Google Drive';
        driveLogger.error(errorMessage);
        throw new Error(errorMessage);
      }

      // Перевіряємо параметри
      if (!fileId) {
        const errorMessage = 'Не вказано ідентифікатор файлу';
        driveLogger.error(errorMessage);
        throw new Error(errorMessage);
      }

      if (!localPath) {
        const errorMessage = 'Не вказано локальний шлях для збереження файлу';
        driveLogger.error(errorMessage);
        throw new Error(errorMessage);
      }

      driveLogger.info(`Завантаження файлу з Google Drive: ${fileId} в ${localPath}`);
      
      // Це заглушка для демонстрації інтерфейсу
      // TODO: Реалізувати реальне завантаження з Google Drive
      /*
      // Приклад реалізації з використанням fetch API:
      const response = await fetch(`${GOOGLE_DRIVE_API_URL}/files/${fileId}?alt=media`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Помилка завантаження: ${response.status} ${response.statusText}`);
      }

      const content = await response.text();
      await FileSystem.writeAsStringAsync(localPath, content);
      */
      
      // Створюємо тестовий вміст файлу для демонстрації
      const dummyContent = JSON.stringify({
        parts: [],
        viewHistory: [],
        favorites: [],
        version: '1.0.0',
        createdAt: new Date().toISOString()
      }, null, 2);
      
      // Перевіряємо, чи існує директорія для збереження файлу
      const dirPath = localPath.substring(0, localPath.lastIndexOf('/'));
      const dirExists = await RNFS.exists(dirPath);
      
      if (!dirExists) {
        driveLogger.debug(`Створення директорії: ${dirPath}`);
        await RNFS.mkdir(dirPath);
      }
      
      // Зберігаємо файл локально
      await RNFS.writeFile(localPath, dummyContent, 'utf8');
      
      driveLogger.info(`Файл успішно завантажено та збережено локально: ${localPath}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
      driveLogger.error(`Помилка при завантаженні файлу з Google Drive: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Видалення файлу з Google Drive
   * Видаляє файл з Google Drive за його ідентифікатором
   * 
   * @param {string} fileId Ідентифікатор файлу на Google Drive
   * @returns {Promise<void>} Promise, який вирішується після завершення видалення
   * @throws {Error} Якщо користувач не авторизований або виникла помилка при видаленні
   * @public
   */
  public async deleteFile(fileId: string): Promise<void> {
    try {
      driveLogger.info(`Початок видалення файлу з Google Drive, ідентифікатор: ${fileId}`);
      
      // Ініціалізуємо сервіс
      await this.initialize();
      
      // Перевіряємо авторизацію
      if (!this.accessToken) {
        const errorMessage = 'Користувач не авторизований в Google Drive';
        driveLogger.error(errorMessage);
        throw new Error(errorMessage);
      }

      // Перевіряємо параметри
      if (!fileId) {
        const errorMessage = 'Не вказано ідентифікатор файлу';
        driveLogger.error(errorMessage);
        throw new Error(errorMessage);
      }

      driveLogger.info(`Видалення файлу з Google Drive: ${fileId}`);
      
      // Це заглушка для демонстрації інтерфейсу
      // TODO: Реалізувати реальне видалення з Google Drive
      /*
      // Приклад реалізації з використанням fetch API:
      const response = await fetch(`${GOOGLE_DRIVE_API_URL}/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Помилка видалення: ${response.status} ${response.statusText}`);
      }
      */
      
      // Імітуємо успішне видалення
      driveLogger.info(`Файл успішно видалено з Google Drive: ${fileId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
      driveLogger.error(`Помилка при видаленні файлу з Google Drive: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Отримання список резервних копій з Google Drive
   * @returns {Promise<DriveFile[]>} Масив файлів резервних копій
   */
  public async getBackupsList(): Promise<DriveFile[]> {
    try {
      if (!this.accessToken) {
        const errorMessage = 'Користувач не авторизований в Google Drive';
        driveLogger.error(errorMessage);
        throw new Error(errorMessage);
      }

      // Отримуємо або створюємо папку для резервних копій
      const backupFolderId = await this.getOrCreateBackupFolder();
      
      if (!backupFolderId) {
        const errorMessage = 'Не вдалося отримати або створити папку для резервних копій';
        driveLogger.error(errorMessage);
        throw new Error(errorMessage);
      }

      // Отримуємо список файлів у папці
      const response = await fetch(
        `${GOOGLE_DRIVE_API_URL}/files?q='${backupFolderId}'+in+parents&fields=files(id,name,createdTime,modifiedTime,size,mimeType,webViewLink)&orderBy=createdTime+desc`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Помилка отримання списку файлів: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      // Форматуємо результати
      const files = result.files.map((file: any) => ({
        id: file.id,
        name: file.name,
        createdTime: file.createdTime,
        modifiedTime: file.modifiedTime,
        size: file.size || 0,
        mimeType: file.mimeType,
        webViewLink: file.webViewLink || '',
        sizeFormatted: file.size ? formatFileSize(file.size) : 'Невідомо'
      }));
      
      driveLogger.info(`Отримано ${files.length} резервних копій`);
      return files;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
      driveLogger.error(`Помилка при отриманні списку файлів з Google Drive: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Створення папки на Google Drive
   * Створює нову папку на Google Drive та повертає її ідентифікатор
   * 
   * @param {string} name Назва папки
   * @returns {Promise<string>} Ідентифікатор створеної папки
   * @throws {Error} Якщо користувач не авторизований або виникла помилка при створенні папки
   * @public
   */
  public async createFolder(name: string): Promise<string> {
    try {
      driveLogger.info(`Початок створення папки на Google Drive: ${name}`);
      
      // Ініціалізуємо сервіс
      await this.initialize();
      
      // Перевіряємо авторизацію
      if (!this.accessToken) {
        const errorMessage = 'Користувач не авторизований в Google Drive';
        driveLogger.error(errorMessage);
        throw new Error(errorMessage);
      }

      // Перевіряємо параметри
      if (!name || name.trim() === '') {
        const errorMessage = 'Назва папки не може бути порожньою';
        driveLogger.error(errorMessage);
        throw new Error(errorMessage);
      }

      driveLogger.info(`Створення папки на Google Drive: ${name}`);
      
      // Це заглушка для демонстрації інтерфейсу
      // TODO: Реалізувати реальне створення папки на Google Drive
      /*
      // Приклад реалізації з використанням fetch API:
      const metadata = {
        name: name,
        mimeType: GOOGLE_DRIVE_FOLDER_MIME_TYPE,
        parents: ['root']
      };
      
      const response = await fetch(`${GOOGLE_DRIVE_API_URL}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
      });

      if (!response.ok) {
        throw new Error(`Помилка створення папки: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.id;
      */
      
      // Заглушка - генеруємо унікальний ідентифікатор папки
      const folderId = `folder_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      driveLogger.info(`Папку успішно створено, ідентифікатор: ${folderId}`);
      
      return folderId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
      driveLogger.error(`Помилка при створенні папки на Google Drive: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Отримання або створення папки для резервних копій
   * @param folderName Назва папки для резервних копій
   * @returns Promise<string> Ідентифікатор папки
   */
  /**
   * Отримання вмісту папки на Google Drive
   * Отримує список файлів та папок, які знаходяться в зазначеній папці на Google Drive
   * 
   * @param {string} folderId Ідентифікатор папки на Google Drive
   * @returns {Promise<(DriveFile | DriveFolder)[]>} Масив файлів та папок
   * @throws {Error} Якщо користувач не авторизований або виникла помилка при отриманні вмісту папки
   * @public
   */
  /**
   * Отримання вмісту папки на Google Drive
   * Отримує список файлів, які знаходяться в зазначеній папці
   * 
   * @param {string} folderId Ідентифікатор папки на Google Drive
   * @returns {Promise<DriveFile[]>} Масив файлів у папці
   * @public
   */
  public async getFolderContents(folderId: string): Promise<DriveFile[]> {
    try {
      driveLogger.info(`Початок отримання вмісту папки на Google Drive, ідентифікатор: ${folderId}`);
      
      // Ініціалізуємо сервіс
      await this.initialize();
      
      // Перевіряємо авторизацію
      if (!this.accessToken) {
        const errorMessage = 'Користувач не авторизований в Google Drive';
        driveLogger.error(errorMessage);
        throw new Error(errorMessage);
      }

      // Перевіряємо параметри
      if (!folderId) {
        const errorMessage = 'Не вказано ідентифікатор папки';
        driveLogger.error(errorMessage);
        throw new Error(errorMessage);
      }

      driveLogger.info(`Отримання вмісту папки: ${folderId}`);
      
      // Це заглушка для демонстрації інтерфейсу
      // TODO: Реалізувати реальне отримання вмісту папки з Google Drive
      /*
      // Приклад реалізації з використанням fetch API:
      const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
      const fields = encodeURIComponent('files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink)');
      
      const response = await fetch(`${GOOGLE_DRIVE_API_URL}/files?q=${query}&fields=${fields}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Помилка отримання вмісту папки: ${response.status} ${response.statusText}`);
      }

      const result: DriveFileList = await response.json();
      
      // Форматуємо результати
      const contents = result.files.map(file => {
        if (file.mimeType === GOOGLE_DRIVE_FOLDER_MIME_TYPE) {
          // Це папка
          return {
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            createdTime: file.createdTime,
            modifiedTime: file.modifiedTime
          } as DriveFolder;
        } else {
          // Це файл
          return {
            ...file,
            sizeFormatted: file.size ? formatFileSize(file.size) : 'Невідомо'
          } as DriveFile;
        }
      });
      
      return contents;
      */
      
      // Створюємо тестові дані для демонстрації
      const currentDate = new Date();
      const dummyContents: DriveFile[] = [
        {
          id: `dummy_file_${Date.now()}_1`,
          name: 'Файл резервної копії.json',
          mimeType: JSON_MIME_TYPE,
          size: 1024,
          createdTime: currentDate.toISOString(),
          modifiedTime: currentDate.toISOString(),
          webViewLink: 'https://drive.google.com',
          sizeFormatted: '1 KB'
        },
        {
          id: `dummy_file_${Date.now()}_2`,
          name: 'Дані про запчастини.json',
          mimeType: JSON_MIME_TYPE,
          size: 2048,
          createdTime: currentDate.toISOString(),
          modifiedTime: currentDate.toISOString(),
          webViewLink: 'https://drive.google.com',
          sizeFormatted: '2 KB'
        }
      ];
      
      driveLogger.info(`Отримано ${dummyContents.length} елементів у папці`);
      return dummyContents;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
      driveLogger.error(`Помилка при отриманні вмісту папки з Google Drive: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Отримання або створення папки для резервних копій
   * Перевіряє, чи існує папка для резервних копій на Google Drive, і якщо ні, створює її
   * 
   * @param {string} folderName Назва папки для резервних копій
   * @returns {Promise<string>} Ідентифікатор папки
   * @throws {Error} Якщо виникла помилка при отриманні або створенні папки
   * @private
   */
  /**
   * Отримання або створення папки для резервних копій
   * 
   * @param {string} folderName Назва папки для резервних копій
   * @returns {Promise<string>} Ідентифікатор папки
   * @private
   */
  private async getOrCreateBackupFolder(folderName = 'Склад Автозапчастин - Резервні копії'): Promise<string> {
    try {
      driveLogger.info(`Початок пошуку або створення папки для резервних копій: ${folderName}`);
      
      // Перевіряємо авторизацію
      if (!this.accessToken) {
        const errorMessage = 'Користувач не авторизований в Google Drive';
        driveLogger.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      // Це заглушка для демонстрації інтерфейсу
      // TODO: Реалізувати реальний пошук або створення папки на Google Drive
      /*
      // Приклад реалізації з використанням fetch API:
      // 1. Спочатку шукаємо папку за назвою
      const query = encodeURIComponent(`name='${folderName}' and mimeType='${GOOGLE_DRIVE_FOLDER_MIME_TYPE}' and trashed=false`);
      const fields = encodeURIComponent('files(id,name)');
      
      const response = await fetch(`${GOOGLE_DRIVE_API_URL}/files?q=${query}&fields=${fields}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Помилка пошуку папки: ${response.status} ${response.statusText}`);
      }

      const result: DriveFileList = await response.json();
      
      // 2. Якщо папка існує, повертаємо її ідентифікатор
      if (result.files && result.files.length > 0) {
        driveLogger.info(`Знайдено існуючу папку: ${result.files[0].name}, ідентифікатор: ${result.files[0].id}`);
        return result.files[0].id;
      }
      
      // 3. Якщо папки немає, створюємо нову
      driveLogger.info(`Папку не знайдено, створюємо нову: ${folderName}`);
      */
      
      driveLogger.info(`Створюємо нову папку для резервних копій: ${folderName}`);
      const folderId = await this.createFolder(folderName);
      driveLogger.info(`Папку для резервних копій успішно створено, ідентифікатор: ${folderId}`);
      
      return folderId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
      driveLogger.error(`Помилка при отриманні/створенні папки для резервних копій: ${errorMessage}`);
      throw error;
    }
  }
}

// Експортуємо клас
export { GoogleDriveService };

// Експортуємо функцію для отримання екземпляра сервісу
export const getGoogleDriveService = (): GoogleDriveServiceInterface => {
  return GoogleDriveService.getInstance();
};

/**
 * Custom React Hook для роботи з GoogleDriveService.
 * Надає стан завантаження, помилок, токен доступу та функції для взаємодії з Google Drive.
 */
export const useGoogleDrive = () => {
  const service = GoogleDriveService.getInstance();
  const [currentAccessToken, setCurrentAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ініціалізація сервісу та перевірка стану авторизації при монтуванні хука
    const initService = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await service.initialize();
        const authorized = await service.isAuthorized();
        if (authorized) {
          setCurrentAccessToken(service.getAccessToken());
        } else {
          setCurrentAccessToken(null);
        }
      } catch (e: any) {
        setError(e.message || 'Помилка ініціалізації Google Drive');
        setCurrentAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    initService();
  }, [service]); // Залежність від service (хоча він є сінглтоном і не зміниться)

  const authorize = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const success = await service.authorize();
      setCurrentAccessToken(service.getAccessToken());
      return success;
    } catch (e: any) {
      setError(e.message || 'Помилка авторизації');
      setCurrentAccessToken(null);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const isAuthorized = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const authStatus = await service.isAuthorized();
      setCurrentAccessToken(service.getAccessToken()); // Оновлюємо токен
      return authStatus;
    } catch (e: any) {
      setError(e.message || 'Помилка перевірки статусу авторизації');
      setCurrentAccessToken(null);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const listFiles = useCallback(async (folderId?: string, query?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      let files: DriveFile[];
      if (folderId) {
        files = await service.getFolderContents(folderId);
        // TODO: Handle query if getFolderContents can support it or if filtering is done client-side
      } else {
        files = await service.getBackupsList();
        // TODO: Handle query if getBackupsList can support it or if filtering is done client-side
      }
      return files;
    } catch (e: any) {
      setError(e.message || 'Помилка отримання списку файлів');
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const uploadFile = useCallback(async (fileUri: string, fileName: string, options?: DriveUploadOptions) => {
    setIsLoading(true);
    setError(null);
    try {
      const fileId = await service.uploadFile(fileUri, fileName);
      return fileId;
    } catch (e: any) {
      setError(e.message || 'Помилка завантаження файлу');
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const downloadFile = useCallback(async (fileId: string, destinationUri: string, options?: DriveDownloadOptions) => {
    setIsLoading(true);
    setError(null);
    try {
      await service.downloadFile(fileId, destinationUri);
      return true;
    } catch (e: any) {
      setError(e.message || 'Помилка скачування файлу');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const deleteFile = useCallback(async (fileId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await service.deleteFile(fileId);
      return true;
    } catch (e: any) {
      setError(e.message || 'Помилка видалення файлу');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  return {
    isAuthorized,
    authorize,
    uploadFile,
    downloadFile,
    deleteFile,
    listFiles,
    accessToken: currentAccessToken,
    isLoading,
    error,
  };
};
