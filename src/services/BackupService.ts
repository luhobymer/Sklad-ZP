import * as RNFS from 'react-native-fs';
import { Platform, Alert } from 'react-native';
// TODO: Замінити на react-native-crypto або інший нативний модуль
import DeviceInfo from 'react-native-device-info';
import Sharing from 'react-native-share';
import DocumentPicker from 'react-native-document-picker';
import fileStorageServiceInstance from './FileStorageService';
import { FileStorageService as FileStorageServiceType } from './FileStorageService';
import { Part } from '../models/Part';
import { DriveFile } from '../types/drive';
import { 
  BackupServiceInterface, 
  FileOperationResult, 
  BackupData,
  BackupMetadata,
  GoogleDriveServiceInterface 
} from '../types/services';
import { backupLogger as logger } from '../utils/logger';
import env from '../config/environment';

// Константи для роботи з резервними копіями
const BACKUP_FOLDER_NAME = 'SkladZP_Backups';
const BACKUP_FILE_PREFIX = 'skladzp_backup_';
const METADATA_FILE = 'backup_metadata.json';

/**
 * Сервіс для створення та відновлення резервних копій
 * Реалізує патерн Singleton
 */
class BackupService implements BackupServiceInterface {
  private static instance: BackupService;
  private googleDriveService: GoogleDriveServiceInterface | null = null;
  private storageService: FileStorageServiceType;
  private backupDirectory: string;
  private backupFolderId: string | null = null;
  private initialized = false;

  /**
   * Приватний конструктор для реалізації патерну Singleton
   */
  private constructor() {
    this.storageService = fileStorageServiceInstance as any;
    this.backupDirectory = `${RNFS.DocumentDirectoryPath}/backups/`;
    // Ініціалізуємо сервіс
    this.initialize().catch((error: unknown) => {
      logger.error('Помилка ініціалізації BackupService:', error);
    });
  }

  /**
   * Отримання єдиного екземпляру сервісу
   * @returns Екземпляр BackupService
   */
  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  /**
   * Ініціалізація сервісу резервного копіювання
   * @returns Promise<boolean> Результат ініціалізації
   */
  public async initialize(): Promise<boolean> {
    if (this.initialized) return true;
    
    try {
      // Перевіряємо наявність директорії для резервних копій
      const dirExists = await RNFS.exists(this.backupDirectory);
      if (!dirExists) {
        await RNFS.mkdir(this.backupDirectory);
      // Встановлюємо атрибут "не робити бекап" для iOS
      if (Platform.OS === 'ios') {
        await RNFS.writeFile(`${this.backupDirectory}.no_backup`, '', 'utf8');
      }
      }
      
      // Ініціалізуємо Google Drive
      await this.initGoogleDriveService();
      
      this.initialized = true;
      logger.info('BackupService успішно ініціалізовано');
      return true;
    } catch (error) {
      logger.error('Помилка ініціалізації BackupService:', error);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Ініціалізація сервісу Google Drive
   * @returns Promise<boolean> Результат ініціалізації
   */
  private async initGoogleDriveService(): Promise<boolean> {
    try {
      // Тут буде код ініціалізації Google Drive API
      // Наразі просто заглушка
      this.googleDriveService = null;
      logger.info('Ініціалізація Google Drive сервісу не реалізована');
      return false;
    } catch (error) {
      logger.error('Помилка ініціалізації Google Drive сервісу:', error);
      return false;
    }
  }

  /**
   * Форматування розміру файлу в читабельний формат
   * @param bytes Розмір файлу в байтах
   * @returns Рядок з розміром файлу у відповідних одиницях
   */
  private formatFileSize(bytes: number | undefined): string {
    if (typeof bytes !== 'number' || bytes <= 0) {
      return '0 B';
    }
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Перевірка наявності папки для резервних копій на Google Drive
   * @returns Promise<string | null> ID папки або null
   */
  private async ensureBackupFolderExists(): Promise<string | null> {
    try {
      if (!this.googleDriveService) {
        logger.warn('Google Drive сервіс не ініціалізовано');
        return null;
      }
      
      // Реалізувати, коли буде готова інтеграція з Google Drive
      this.backupFolderId = null;
      return this.backupFolderId;
    } catch (error) {
      logger.error('Помилка перевірки папки для резервних копій:', error);
      return null;
    }
  }

  /**
   * Отримання інформації про пристрій для метаданих резервної копії
   * @returns Promise<string> Інформація про пристрій
   */
  private async getDeviceInfo(): Promise<string> {
    try {
      // Використовуємо react-native-device-info для отримання інформації про пристрій
      const deviceName = await DeviceInfo.getDeviceName();
      const osName = Platform.OS;
      const osVersion = Platform.Version?.toString() || await DeviceInfo.getSystemVersion();
      const appVersion = await DeviceInfo.getVersion() || env.APP_VERSION || '1.0.0';
      return `${deviceName} (${osName} ${osVersion}) - Додаток v${appVersion}`;
    } catch (error) {
      logger.error('Помилка отримання інформації про пристрій:', error);
      return 'Невідомий пристрій';
    }
  }

  /**
   * Створення резервної копії
   * @param name Назва резервної копії (опціонально)
   * @returns Promise<string> Шлях до створеної резервної копії
   */
  public async createBackup(name = ''): Promise<string> {
    try {
      await this.initialize();
      
      // Отримуємо всі запчастини
      const parts = await this.storageService.getAllParts();
      
      // Отримуємо історію переглядів
      const viewHistory = await this.storageService.getViewHistory();
      
      // Отримуємо обрані запчастини
      const favorites = await this.storageService.getFavorites();
      
      // Створюємо метадані резервної копії
      const metadata: BackupMetadata = {
        id: Date.now().toString(),
        name: name || `Резервна_копія_${new Date().toISOString().split('T')[0]}`,
        description: `Автоматичне резервне копіювання від ${new Date().toLocaleString()}`,
        createdAt: new Date().toISOString(),
        size: 0,
        sizeFormatted: '0 B',
        fileId: '',
        version: env.APP_VERSION || '1.0.0',
        appVersion: env.APP_VERSION || '1.0.0',
        deviceInfo: {
          os: Platform.OS,
          osVersion: Platform.Version.toString(),
          model: DeviceInfo.getModel() || 'Невідомо',
          manufacturer: DeviceInfo.getManufacturerSync() || 'Невідомо',
        },
        partsCount: parts.length,
      };
      
      // Формуємо ім'я файлу, якщо не вказано
      const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
      const fileName = name || `${BACKUP_FILE_PREFIX}${timestamp}.json`;
      
      // Шлях до файлу резервної копії
      const backupPath = `${this.backupDirectory}${fileName}`;
      
      // Створюємо об'єкт резервної копії
      const backupData: BackupData = {
        parts: parts,
        viewHistory: viewHistory.map(part => part.id),
        favorites: favorites.map(part => part.id),
        version: env.APP_VERSION || '1.0.0',
        createdAt: new Date().toISOString()
      };
      
      // Зберігаємо резервну копію у файл
      await RNFS.writeFile(backupPath, JSON.stringify({ metadata, data: backupData }, null, 2), 'utf8');
      
      // Оновлюємо розмір файлу в метаданих
      const fileExists = await RNFS.exists(backupPath);
      if (fileExists) {
        // Отримуємо інформацію про файл через readDir
        const dirContents = await RNFS.readDir(this.backupDirectory);
        const file = dirContents.find(f => f.path === backupPath);
        const currentSize = file ? file.size : 0;
        // Оновлюємо розмір, якщо він невірний або відсутній, або не співпадає з актуальним
        if (typeof metadata.size !== 'number' || metadata.size !== currentSize) {
          metadata.size = currentSize;
          metadata.sizeFormatted = this.formatFileSize(currentSize);
        }
        // Оновлюємо файл з правильним розміром
        await RNFS.writeFile(backupPath, JSON.stringify({ metadata, data: backupData }, null, 2), 'utf8');
      }
      
      logger.info(`Резервна копія створена: ${backupPath}`);
      return backupPath;
    } catch (error) {
      logger.error('Помилка створення резервної копії:', error);
      throw new Error(`Помилка створення резервної копії: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Завантаження резервної копії на Google Drive
   * @param localPath Локальний шлях до резервної копії
   * @param name Назва резервної копії на Google Drive (опціонально)
   * @returns Promise<string> ID файлу на Google Drive
   */
  public async uploadBackupToDrive(localPath: string, name?: string): Promise<string> {
    try {
      if (!this.googleDriveService) {
        throw new Error('Google Drive сервіс не ініціалізовано');
      }
      
      // Перевіряємо наявність папки для резервних копій
      if (!this.backupFolderId) {
        this.backupFolderId = await this.ensureBackupFolderExists();
        if (!this.backupFolderId) {
          throw new Error('Не вдалося створити папку для резервних копій на Google Drive');
        }
      }
      
      // Перевіряємо наявність файлу
      const fileExists = await RNFS.exists(localPath);
      if (!fileExists) {
        throw new Error('Файл резервної копії не існує');
      }
      
      // Отримуємо ім'я файлу
      const fileName = name || localPath.split('/').pop() || 'backup.json';
      
      // Завантажуємо файл на Google Drive
      const fileId = await this.googleDriveService.uploadFile(localPath, fileName);
      
      logger.info(`Резервна копія завантажена на Google Drive: ${fileId}`);
      return fileId;
    } catch (error) {
      logger.error('Помилка завантаження резервної копії на Google Drive:', error);
      throw new Error(`Помилка завантаження резервної копії: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Отримання списку локальних резервних копій
   * @returns Promise<string[]> Список шляхів до резервних копій
   */
  public async getLocalBackups(): Promise<string[]> {
    try {
      await this.initialize();
      
      // Отримуємо список файлів у директорії резервних копій
      const files = await RNFS.readDir(this.backupDirectory);
      
      // Фільтруємо файли за розширенням .json
      const backupFiles = files.filter(file => file.name.endsWith('.json'));
      
      // Формуємо повні шляхи до файлів
      const backupPaths = backupFiles.map(file => `${this.backupDirectory}${file.name}`);
      
      logger.info(`Знайдено ${backupPaths.length} локальних резервних копій`);
      return backupPaths;
    } catch (error) {
      logger.error('Помилка отримання списку локальних резервних копій:', error);
      return [];
    }
  }

  /**
   * Отримання списку резервних копій на Google Drive
   * @returns Promise<DriveFile[]> Список файлів на Google Drive
   */
  public async getDriveBackups(): Promise<DriveFile[]> {
    try {
      if (!this.googleDriveService) {
        logger.warn('Google Drive сервіс не ініціалізовано');
        return [];
      }
      
      // Отримуємо список файлів з папки резервних копій
      const backups = await this.googleDriveService.getBackupsList();
      
      logger.info(`Знайдено ${backups.length} резервних копій на Google Drive`);
      return backups;
    } catch (error) {
      logger.error('Помилка отримання списку резервних копій на Google Drive:', error);
      return [];
    }
  }

  /**
   * Відновлення з локальної резервної копії
   * @param backupPath Шлях до резервної копії
   * @returns Promise<boolean> Результат відновлення
   */
  public async restoreFromLocalBackup(backupPath: string): Promise<boolean> {
    try {
      // Перевіряємо наявність файлу
      const fileExists = await RNFS.exists(backupPath);
      if (!fileExists) {
        throw new Error('Файл резервної копії не існує');
      }
      
      // Читаємо вміст файлу
      const content = await RNFS.readFile(backupPath, 'utf8');
      
      // Парсимо JSON
      const backup = JSON.parse(content);
      
      // Перевіряємо структуру резервної копії
      if (!backup.data || !backup.metadata) {
        throw new Error('Некоректна структура резервної копії');
      }
      
      // Відновлюємо запчастини
      await this.storageService.clearAllParts();
      for (const part of backup.data.parts) {
        await this.storageService.addPart(part);
      }
      
      // Відновлюємо історію переглядів
      await this.storageService.clearViewHistory();
      if (backup.data.viewHistory && Array.isArray(backup.data.viewHistory)) {
        for (const partId of backup.data.viewHistory) {
          await this.storageService.addToViewHistory(partId);
        }
      }
      
      // Відновлюємо обрані запчастини
      await this.storageService.clearAllFavorites();
      if (backup.data.favorites && Array.isArray(backup.data.favorites)) {
        for (const partId of backup.data.favorites) {
          await this.storageService.addToFavorites(partId);
        }
      }
      
      logger.info(`Відновлення з резервної копії успішно завершено: ${backupPath}`);
      return true;
    } catch (error) {
      logger.error('Помилка відновлення з резервної копії:', error);
      return false;
    }
  }

  /**
   * Відновлення з резервної копії на Google Drive
   * @param fileId ID файлу на Google Drive
   * @returns Promise<boolean> Результат відновлення
   */
  public async restoreFromDriveBackup(fileId: string): Promise<boolean> {
    try {
      if (!this.googleDriveService) {
        throw new Error('Google Drive сервіс не ініціалізовано');
      }
      
      // Створюємо тимчасовий файл для завантаження
      const tempFilePath = `${RNFS.CachesDirectoryPath}/temp_backup.json`;
      
      // Завантажуємо файл з Google Drive
      await this.googleDriveService.downloadFile(fileId, tempFilePath);
      
      // Відновлюємо з локального файлу
      const result = await this.restoreFromLocalBackup(tempFilePath);
      
      // Видаляємо тимчасовий файл
      await RNFS.unlink(tempFilePath).catch(() => {});
      
      logger.info(`Відновлення з резервної копії на Google Drive успішно завершено: ${fileId}`);
      return result;
    } catch (error) {
      logger.error('Помилка відновлення з резервної копії на Google Drive:', error);
      return false;
    }
  }

  /**
   * Видалення локальної резервної копії
   * @param backupPath Шлях до резервної копії
   * @returns Promise<boolean> Результат видалення
   */
  public async deleteLocalBackup(backupPath: string): Promise<boolean> {
    try {
      // Перевіряємо наявність файлу
      const fileExists = await RNFS.exists(backupPath);
      if (!fileExists) {
        logger.warn(`Файл резервної копії не існує: ${backupPath}`);
        return true; // Вважаємо успішним, якщо файлу вже немає
      }
      
      // Видаляємо файл
      await RNFS.unlink(backupPath).catch(() => {});
      
      logger.info(`Резервна копія видалена: ${backupPath}`);
      return true;
    } catch (error) {
      logger.error('Помилка видалення резервної копії:', error);
      return false;
    }
  }

  /**
   * Видалення резервної копії на Google Drive
   * @param fileId ID файлу на Google Drive
   * @returns Promise<boolean> Результат видалення
   */
  public async deleteDriveBackup(fileId: string): Promise<boolean> {
    try {
      if (!this.googleDriveService) {
        throw new Error('Google Drive сервіс не ініціалізовано');
      }
      
      // Видаляємо файл з Google Drive
      await this.googleDriveService.deleteFile(fileId);
      
      logger.info(`Резервна копія на Google Drive видалена: ${fileId}`);
      return true;
    } catch (error) {
      logger.error('Помилка видалення резервної копії на Google Drive:', error);
      return false;
    }
  }

  /**
   * Експорт резервної копії (поділитися файлом)
   * @param backupPath Шлях до резервної копії
   * @returns Promise<boolean> Результат експорту
   */
  public async exportBackup(backupPath: string): Promise<boolean> {
    try {
      // Перевіряємо наявність файлу
      const fileExists = await RNFS.exists(backupPath);
      if (!fileExists) {
        throw new Error('Файл резервної копії не існує');
      }
      
      // Ділимося файлом
      await Sharing.open({
        url: `file://${backupPath}`,
        type: 'application/json',
        title: 'Експорт резервної копії'
      });
      
      logger.info(`Резервна копія експортована: ${backupPath}`);
      return true;
    } catch (error) {
      logger.error('Помилка експорту резервної копії:', error);
      return false;
    }
  }

  /**
   * Імпорт резервної копії (вибір файлу)
   * @returns Promise<string | null> Шлях до імпортованого файлу або null
   */
  public async importBackup(): Promise<string | null> {
    try {
      // Вибираємо файл
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
        copyTo: 'cachesDirectory'
      });
      
      if (!result.uri) { 
        logger.warn('Файл успішно вибрано, але URI відсутній.');
        return null;
      }
      
      const filePath = result.fileCopyUri || result.uri;
      
      // Копіюємо файл у директорію резервних копій
      const fileName = result.name || `imported_backup_${Date.now()}.json`;
      if (!result.name) {
          logger.warn(`Ім'я файлу не знайдено в результаті DocumentPicker, використано згенероване ім'я: ${fileName}`);
      }
      const targetPath = `${this.backupDirectory}${fileName}`;
      
      await RNFS.copyFile(filePath, targetPath);
      
      logger.info(`Резервна копія імпортована: ${targetPath}`);
      return targetPath;
    } catch (error) {
      logger.error('Помилка імпорту резервної копії:', error);
      return null;
    }
  }
}
export default BackupService;
