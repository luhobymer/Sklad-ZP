/**
 * Типізований логер для додатку
 * Обгортка навколо console з додатковими можливостями
 */

import { LogLevel, LoggerOptions, LoggerInterface } from '../types/logger';

class Logger implements LoggerInterface {
  private static instance: Logger | null = null;

  /**
   * Отримати екземпляр логера (Singleton)
   * @param options Опції логера
   * @returns Екземпляр логера
   */
  public static getInstance(options: LoggerOptions = {}): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(options);
    }
    return Logger.instance;
  }


  private prefix: string;
  private showTimestamp: boolean;
  private enabled: boolean;

  constructor(options: LoggerOptions = {}) {
    this.prefix = options.prefix || 'App';
    this.showTimestamp = options.showTimestamp !== undefined ? options.showTimestamp : true;
    this.enabled = options.enabled !== undefined ? options.enabled : true;
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, message: string): string {
    let formattedMessage = `[${this.prefix}]`;
    
    if (this.showTimestamp) {
      formattedMessage = `${formattedMessage} [${this.getTimestamp()}]`;
    }
    
    formattedMessage = `${formattedMessage} [${level.toUpperCase()}]: ${message}`;
    return formattedMessage;
  }

  /**
   * Логування повідомлення рівня debug
   * @param message Основне повідомлення
   * @param args Додаткові аргументи для логування
   */
  debug(message: string, ...args: unknown[]): void {
    if (!this.enabled) return;
    console.debug(this.formatMessage('debug', message), ...args);
  }

  /**
   * Логування повідомлення рівня info
   * @param message Основне повідомлення
   * @param args Додаткові аргументи для логування
   */
  info(message: string, ...args: unknown[]): void {
    if (!this.enabled) return;
    console.info(this.formatMessage('info', message), ...args);
  }

  /**
   * Логування повідомлення рівня warn
   * @param message Основне повідомлення
   * @param args Додаткові аргументи для логування
   */
  warn(message: string, ...args: unknown[]): void {
    if (!this.enabled) return;
    console.warn(this.formatMessage('warn', message), ...args);
  }

  /**
   * Логування повідомлення рівня error
   * @param message Основне повідомлення
   * @param args Додаткові аргументи для логування
   */
  error(message: string, ...args: unknown[]): void {
    if (!this.enabled) return;
    console.error(this.formatMessage('error', message), ...args);
  }

  /**
   * Загальне логування (рівень info)
   * @param message Основне повідомлення
   * @param args Додаткові аргументи для логування
   */
  log(message: string, ...args: unknown[]): void {
    if (!this.enabled) return;
    console.info(this.formatMessage('info', message), ...args);
  }
}

// Створення глобального логера
const globalLogger = Logger.getInstance({ prefix: 'App' });

// Створюємо логери для різних частин додатку
export const fileStorageLogger = new Logger({ prefix: 'FileStorage' });
export const textRecognitionLogger = new Logger({ prefix: 'TextRecognition' });
export const backupServiceLogger = new Logger({ prefix: 'BackupService' });

// Експорт за замовчуванням
export default globalLogger;

// Додаткові логегрі
export const databaseLogger = new Logger({ prefix: 'Database' });
export const appLogger = new Logger({ prefix: 'App' });
export const analogLogger = new Logger({ prefix: 'Analog' });
export const backupLogger = new Logger({ prefix: 'Backup' });
export const googleDriveLogger = new Logger({ prefix: 'GoogleDrive' });
export const reportLogger = new Logger({ prefix: 'Report' });
export const compatibilityLogger = new Logger({ prefix: 'Compatibility' });

// Експортуємо клас для створення власних логерів
export { Logger };

// Експортуємо функцію для створення нового логера
export function createLogger(options: LoggerOptions): Logger {
  return new Logger(options);
}
