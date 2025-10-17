// Оголошення для ErrorUtils
type ErrorHandlerCallback = (error: Error | unknown, isFatal?: boolean) => void;

declare global {
  const ErrorUtils: {
    getGlobalHandler(): ErrorHandlerCallback;
    setGlobalHandler(handler: ErrorHandlerCallback): void;
    reportError(error: Error | unknown): void;
  };
}

// Декларації для роботи з файловою системою
declare module 'react-native-fs' {
  export interface FSInfoResult {
    freeSpace: number;
    totalSpace: number;
  }

  export interface DownloadFileOptions {
    fromUrl: string;
    toFile: string;
    headers?: { [key: string]: string };
    background?: boolean;
  }

  export interface UploadFileOptions {
    toUrl: string;
    files: Array<{
      name: string;
      filename: string;
      filepath: string;
      filetype: string;
    }>;
    headers?: { [key: string]: string };
  }

  export interface ReadDirItem {
    ctime?: Date;
    isDirectory: () => boolean;
    isFile: () => boolean;
    mtime?: Date;
    name: string;
    path: string;
    size: number;
  }

  export const CachesDirectoryPath: string;
  export const DocumentDirectoryPath: string;
  export const TemporaryDirectoryPath: string;

  export function readDir(dirpath: string): Promise<ReadDirItem[]>;
  export function readFile(filepath: string, encoding?: string): Promise<string>;
  export function writeFile(filepath: string, contents: string, encoding?: string): Promise<void>;
  export function mkdir(filepath: string): Promise<void>;
  export function unlink(filepath: string): Promise<void>;
  export function exists(filepath: string): Promise<boolean>;
  export function moveFile(fromPath: string, toPath: string): Promise<void>;
  export function copyFile(fromPath: string, toPath: string): Promise<void>;
  export function downloadFile(options: DownloadFileOptions): { jobId: number; promise: Promise<{ statusCode: number }> };
}

// Декларації для модулів без типів
declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.webp' {
  const value: string;
  export default value;
}

// Глобальні типи
declare namespace NodeJS {
  interface Global {
    // Глобальні змінні, які використовуються у додатку
    ErrorUtils: {
      getGlobalHandler(): ErrorHandlerCallback;
      setGlobalHandler(handler: ErrorHandlerCallback): void;
      reportError(error: Error | unknown): void;
    };
  }
}

// Розширення глобального об'єкту React Native
declare module 'react-native' {
  interface ViewProps {
    // Додайте кастомні пропси для компонента View
  }
}

// Декларації для модулів без типів
declare module 'react-native-svg';

declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import { ComponentType } from 'react';
  import { TextProps, StyleProp, TextStyle } from 'react-native';

  export interface MaterialCommunityIconsProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
    style?: StyleProp<TextStyle>;
  }

  const MaterialCommunityIcons: ComponentType<MaterialCommunityIconsProps>;
  
  export default MaterialCommunityIcons;
  export { MaterialCommunityIcons };
}

declare module 'react-native-vector-icons/Ionicons' {
  import { ComponentType } from 'react';
  import { TextProps, StyleProp, TextStyle } from 'react-native';

  export interface IoniconsProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
    style?: StyleProp<TextStyle>;
  }

  const Ionicons: ComponentType<IoniconsProps>;
  
  export default Ionicons;
  export { Ionicons };
}

/** Removed custom declare module 'react-native-paper' to use official types */

declare module 'react-native-reanimated';

// Декларації для модулів з несумісними типами
declare module '@react-navigation/native' {
  export * from '@react-navigation/native/lib/typescript/src/types';
}

declare module '@react-navigation/native-stack' {
  export * from '@react-navigation/native-stack/lib/typescript/src/types';
}
