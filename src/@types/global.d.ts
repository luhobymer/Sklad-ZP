/**
 * Глобальні типи для проекту
 */

import '@types/jest';

// Розширюємо глобальний простір імен для Jest
declare global {
  namespace jest {
    // Додаємо тип для мокування функцій
    interface Mock<T = any, Y extends any[] = any[]> extends Function {
      new (...args: Y): T;
      (...args: Y): T;
      mockImplementation(fn?: (...args: Y) => T): this;
      mockImplementationOnce(fn?: (...args: Y) => T): this;
      mockReturnThis(): this;
      mockReturnValue(val: T): this;
      mockReturnValueOnce(val: T): this;
      mockResolvedValue(val: Awaited<T>): this;
      mockResolvedValueOnce(val: Awaited<T>): this;
      mockRejectedValue(val: unknown): this;
      mockRejectedValueOnce(val: unknown): this;
      mockClear(): this;
      mockReset(): this;
      mockRestore(): this;
      mockName(name: string): this;
      getMockName(): string;
      mock: {
        calls: Y[];
        instances: T[];
        invocationCallOrder: number[];
        results: { type: 'return' | 'throw'; value: any }[];
        lastCall: Y;
      };
    }
  }
}

// Типи для react-native-fs в тестах
declare module 'react-native-fs' {
  export const DocumentDirectoryPath: string;
  export function exists(fileUri: string): Promise<boolean>;
  export function stat(fileUri: string): Promise<{ isDirectory: () => boolean; isFile: () => boolean }>;
  export function readFile(fileUri: string, encoding?: string): Promise<string>;
  export function writeFile(fileUri: string, contents: string, encoding?: string): Promise<void>;
  export function mkdir(fileUri: string): Promise<void>;
  export function unlink(fileUri: string): Promise<void>;
  export interface StatResult {
    isFile: () => boolean;
    isDirectory: () => boolean;
    size: number;
    mtime: number;
    ctime: number;
    path: string;
  }
}

// Тип для моків FileSystem в тестах
declare global {
  interface MockedFileSystem {
    DocumentDirectoryPath: string;
    exists: jest.Mock<any, any[]>;
    stat: jest.Mock<any, any[]>;
    readFile: jest.Mock<any, any[]>;
    writeFile: jest.Mock<any, any[]>;
    mkdir: jest.Mock<any, any[]>;
    unlink: jest.Mock<any, any[]>;
  }
}

// Щоб цей файл був модулем
export {};
