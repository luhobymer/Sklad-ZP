export interface LoggerOptions {
  name?: string;
  prefix?: string;
  showTimestamp?: boolean;
  enabled?: boolean;
  level?: 'error' | 'warn' | 'info' | 'debug';
}

export class Logger {
  constructor(options: string | LoggerOptions);
  error(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}
