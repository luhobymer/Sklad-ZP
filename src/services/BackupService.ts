import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import FileStorageService from './FileStorageService';
import { Part } from '../models/Part';

/**
 * Сервіс для резервного копіювання та відновлення даних
 */
export class BackupService {
  private static instance: BackupService;
  private storageService: FileStorageService;
  private backupDirectory: string;

  private constructor() {
    this.storageService = FileStorageService.getInstance();
    this.backupDirectory = `${FileSystem.documentDirectory}backups/`;
  }

  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  /**
   * Ініціалізація сервісу резервного копіювання
   */
  public async initialize(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.backupDirectory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.backupDirectory, { intermediates: true });
      }
    } catch (error) {
      console.error('Помилка при ініціалізації сервісу резервного копіювання:', error);
      throw error;
    }
  }

  /**
   * Створення резервної копії даних
   */
  public async createBackup(name: string = ''): Promise<string> {
    try {
      await this.initialize();
      
      // Отримуємо всі запчастини
      const parts = await this.storageService.getAllParts();
      
      // Формуємо ім'я файлу резервної копії
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = name ? 
        `${name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${timestamp}.json` : 
        `backup_${timestamp}.json`;
      
      const backupPath = `${this.backupDirectory}${fileName}`;
      
      // Створюємо об'єкт з даними для резервного копіювання
      const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        parts: parts
      };
      
      // Зберігаємо дані у файл
      await FileSystem.writeAsStringAsync(
        backupPath,
        JSON.stringify(backupData, null, 2)
      );
      
      return backupPath;
    } catch (error) {
      console.error('Помилка при створенні резервної копії:', error);
      throw error;
    }
  }

  /**
   * Отримання списку резервних копій
   */
  public async getBackupsList(): Promise<{ name: string; path: string; date: Date }[]> {
    try {
      await this.initialize();
      
      const backupFiles = await FileSystem.readDirectoryAsync(this.backupDirectory);
      
      const backups = await Promise.all(
        backupFiles
          .filter(file => file.endsWith('.json'))
          .map(async file => {
            const path = `${this.backupDirectory}${file}`;
            const fileInfo = await FileSystem.getInfoAsync(path);
            
            // Отримуємо дату з імені файлу
            // Спробуємо витягнути дату з імені файлу (backup_2025-05-11T20-47-48.json)
            const dateMatch = file.match(/_(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/i);
            let date = new Date();
            
            if (dateMatch && dateMatch[1]) {
              // Якщо знайдено дату в імені файлу
              const dateStr = dateMatch[1].replace(/-/g, (match, offset) => {
                // Замінюємо тільки дефіси в часі, а не в даті
                return offset > 10 ? ':' : '-';
              });
              date = new Date(dateStr);
            }
            
            return {
              name: file,
              path,
              date
            };
          })
      );
      
      // Сортуємо за датою (найновіші спочатку)
      return backups.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
      console.error('Помилка при отриманні списку резервних копій:', error);
      throw error;
    }
  }

  /**
   * Відновлення даних з резервної копії
   */
  public async restoreFromBackup(backupPath: string): Promise<void> {
    try {
      const fileContent = await FileSystem.readAsStringAsync(backupPath);
      const backupData = JSON.parse(fileContent);
      
      // Перевіряємо формат резервної копії
      if (!backupData.parts || !Array.isArray(backupData.parts)) {
        throw new Error('Некоректний формат резервної копії');
      }
      
      // Відновлюємо запчастини
      const parts: Part[] = backupData.parts.map((part: any) => ({
        ...part,
        createdAt: new Date(part.createdAt),
        updatedAt: new Date(part.updatedAt)
      }));
      
      // Очищаємо поточні дані і додаємо відновлені
      await this.storageService.clearAllParts();
      
      for (const part of parts) {
        await this.storageService.addPart(part);
      }
    } catch (error) {
      console.error('Помилка при відновленні з резервної копії:', error);
      throw error;
    }
  }

  /**
   * Експорт даних у форматі CSV
   */
  public async exportToCSV(): Promise<string> {
    try {
      await this.initialize();
      
      // Отримуємо всі запчастини
      const parts = await this.storageService.getAllParts();
      
      // Формуємо заголовок CSV
      const headers = [
        'ID',
        'Артикул',
        'Назва',
        'Виробник',
        'Категорія',
        'Нова',
        'Кількість',
        'Ціна',
        'Опис',
        'Сумісні автомобілі',
        'Дата створення',
        'Дата оновлення'
      ].join(',');
      
      // Формуємо рядки з даними
      const rows = parts.map(part => [
        part.id,
        `"${part.articleNumber}"`,
        `"${part.name.replace(/"/g, '""')}"`,
        `"${part.manufacturer.replace(/"/g, '""')}"`,
        `"${part.category || ''}"`,
        part.isNew ? 'Так' : 'Ні',
        part.quantity,
        part.price,
        part.description ? `"${part.description.replace(/"/g, '""')}"` : '',
        part.compatibleCars ? `"${part.compatibleCars.join(', ').replace(/"/g, '""')}"` : '',
        new Date(part.createdAt).toLocaleString(),
        new Date(part.updatedAt).toLocaleString()
      ].join(','));
      
      // Об'єднуємо заголовок і рядки
      const csvContent = [headers, ...rows].join('\n');
      
      // Зберігаємо CSV у файл
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `parts_export_${timestamp}.csv`;
      const filePath = `${this.backupDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, csvContent);
      
      return filePath;
    } catch (error) {
      console.error('Помилка при експорті в CSV:', error);
      throw error;
    }
  }

  /**
   * Імпорт даних з CSV файлу
   */
  public async importFromCSV(filePath: string, replaceExisting: boolean = false): Promise<number> {
    try {
      const fileContent = await FileSystem.readAsStringAsync(filePath);
      const lines = fileContent.split('\n');
      
      if (lines.length < 2) {
        throw new Error('CSV файл не містить даних');
      }
      
      // Парсимо заголовок
      const headers = lines[0].split(',');
      
      // Індекси колонок
      const columnIndices = {
        articleNumber: headers.findIndex(h => h.includes('Артикул')),
        name: headers.findIndex(h => h.includes('Назва')),
        manufacturer: headers.findIndex(h => h.includes('Виробник')),
        category: headers.findIndex(h => h.includes('Категорія')),
        isNew: headers.findIndex(h => h.includes('Нова')),
        quantity: headers.findIndex(h => h.includes('Кількість')),
        price: headers.findIndex(h => h.includes('Ціна')),
        description: headers.findIndex(h => h.includes('Опис')),
        compatibleCars: headers.findIndex(h => h.includes('Сумісні'))
      };
      
      // Перевіряємо, чи знайдені обов'язкові колонки
      if (columnIndices.articleNumber === -1 || columnIndices.name === -1) {
        throw new Error("CSV файл не містить обов'язкових колонок (Артикул, Назва)");
      }
      
      // Парсимо дані
      const importedParts: Part[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = this.parseCSVLine(lines[i]);
        
        const part: Partial<Part> = {
          articleNumber: values[columnIndices.articleNumber]?.replace(/^"|"$/g, '') || '',
          name: values[columnIndices.name]?.replace(/^"|"$/g, '') || '',
          manufacturer: values[columnIndices.manufacturer]?.replace(/^"|"$/g, '') || 'Невідомий',
          category: columnIndices.category !== -1 ? values[columnIndices.category]?.replace(/^"|"$/g, '') || '' : '',
          isNew: columnIndices.isNew !== -1 ? values[columnIndices.isNew]?.includes('Так') : false,
          quantity: columnIndices.quantity !== -1 ? parseInt(values[columnIndices.quantity], 10) || 0 : 0,
          price: columnIndices.price !== -1 ? parseFloat(values[columnIndices.price]) || 0 : 0,
          description: columnIndices.description !== -1 ? values[columnIndices.description]?.replace(/^"|"$/g, '') || null : null,
          compatibleCars: columnIndices.compatibleCars !== -1 && values[columnIndices.compatibleCars] ? 
            values[columnIndices.compatibleCars].replace(/^"|"$/g, '').split(',').map(car => car.trim()) : 
            null
        };
        
        if (part.articleNumber && part.name) {
          importedParts.push(part as Part);
        }
      }
      
      // Зберігаємо імпортовані запчастини
      if (replaceExisting) {
        await this.storageService.clearAllParts();
      }
      
      for (const part of importedParts) {
        await this.storageService.addPart(part);
      }
      
      return importedParts.length;
    } catch (error) {
      console.error('Помилка при імпорті з CSV:', error);
      throw error;
    }
  }

  /**
   * Парсинг рядка CSV з урахуванням лапок
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        // Якщо це подвійні лапки всередині значення в лапках
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // Пропускаємо наступний символ
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  /**
   * Поділитися файлом
   */
  public async shareFile(filePath: string): Promise<void> {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Помилка", "Функція поділитися недоступна на цьому пристрої");
        return;
      }
      
      await Sharing.shareAsync(filePath);
    } catch (error) {
      console.error('Помилка при поділенні файлом:', error);
      throw error;
    }
  }

  /**
   * Вибір файлу для імпорту
   */
  public async pickFileForImport(): Promise<string | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/csv'],
        copyToCacheDirectory: true
      });
      
      if (result.canceled) {
        return null;
      }
      
      return result.assets[0].uri;
    } catch (error) {
      console.error('Помилка при виборі файлу:', error);
      throw error;
    }
  }

  /**
   * Видалення резервної копії
   */
  public async deleteBackup(backupPath: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(backupPath);
    } catch (error) {
      console.error('Помилка при видаленні резервної копії:', error);
      throw error;
    }
  }
}

export default BackupService;
