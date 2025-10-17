/**
 * Типи для логера
 */

/**
 * Рівні логування
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Опції для логера
 */
export interface LoggerOptions {
  /**
   * Ім'я логера (застаріле, використовуйте prefix)
   * @deprecated Використовуйте prefix замість name
   */
  name?: string;
  
  /**
   * Префікс для повідомлень логера
   * @default 'App'
   */
  prefix?: string;
  
  /**
   * Чи показувати часову мітку в повідомленнях
   * @default true
   */
  showTimestamp?: boolean;
  
  /**
   * Чи увімкнено логер
   * @default true
   */
  enabled?: boolean;
  
  /**
   * Мінімальний рівень логування
   * @default 'debug'
   */
  minLevel?: LogLevel;
}

/**
 * Інтерфейс для логера
 */
export interface LoggerInterface {
  /**
   * Логування повідомлення рівня debug
   * @param message Основне повідомлення
   * @param args Додаткові аргументи для логування
   */
  debug(message: string, ...args: unknown[]): void;
  
  /**
   * Логування повідомлення рівня info
   * @param message Основне повідомлення
   * @param args Додаткові аргументи для логування
   */
  info(message: string, ...args: unknown[]): void;
  
  /**
   * Логування повідомлення рівня warn
   * @param message Основне повідомлення
   * @param args Додаткові аргументи для логування
   */
  warn(message: string, ...args: unknown[]): void;
  
  /**
   * Логування повідомлення рівня error
   * @param message Основне повідомлення
   * @param args Додаткові аргументи для логування
   */
  error(message: string, ...args: unknown[]): void;
  
  /**
   * Загальне логування (рівень info)
   * @param message Основне повідомлення
   * @param args Додаткові аргументи для логування
   */
  log(message: string, ...args: unknown[]): void;
}