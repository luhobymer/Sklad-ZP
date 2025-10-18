import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { Logger } from './logger';

// Створюємо екземпляр логера
const logger = new Logger({ name: 'fileUtils' });

/**
 * Type guard для перевірки чи є помилка з кодом
 */
const hasErrorCode = (error: unknown): error is { code: string } => {
  return typeof error === 'object' && error !== null && 'code' in error;
};

/**
 * Utility functions for file operations
 */

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const getFileNameWithoutExtension = (filename: string): string => {
  return filename.replace(/.[^/.]+$/, '');
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const sanitizeFileName = (name: string): string => {
  // Replace invalid characters with underscore
  return name.replace(/[^a-zA-Z0-9_.-]/g, '_');
};

export const getMimeType = (filename: string): string => {
  const ext = getFileExtension(filename).toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    
    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    // Text
    txt: 'text/plain',
    csv: 'text/csv',
    json: 'application/json',
    
    // Archives
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    
    // Default
    bin: 'application/octet-stream',
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
};

export const getDocumentDirectory = (): string => {
  return RNFS.DocumentDirectoryPath;
};

export const getCacheDirectory = (): string => {
  return RNFS.CachesDirectoryPath;
};

export const ensureDirectoryExists = async (dirPath: string): Promise<boolean> => {
  try {
    const dirInfo = await RNFS.stat(dirPath);
    
    if (!dirInfo.isDirectory()) {
      await RNFS.mkdir(dirPath);
      return true;
    }
    
    return true;
  } catch (error: unknown) {
    if (hasErrorCode(error) && error.code === 'ENOENT') {
      // Directory doesn't exist, create it
      try {
        await RNFS.mkdir(dirPath);
        return true;
      } catch (mkdirError) {
        logger.error(`Error creating directory: ${dirPath}`, mkdirError);
        return false;
      }
    }
    
    logger.error(`Error checking directory: ${dirPath}`, error);
    return false;
  }
};

export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    const fileInfo = await RNFS.stat(filePath);
    return fileInfo.isFile();
  } catch (error: unknown) {
    if (hasErrorCode(error) && error.code === 'ENOENT') {
      return false;
    }
    logger.error(`Error checking if file exists: ${filePath}`, error);
    return false;
  }
};

export const directoryExists = async (dirPath: string): Promise<boolean> => {
  try {
    const dirInfo = await RNFS.stat(dirPath);
    return dirInfo.isDirectory();
  } catch (error: unknown) {
    if (hasErrorCode(error) && error.code === 'ENOENT') {
      return false;
    }
    logger.error(`Error checking if directory exists: ${dirPath}`, error);
    return false;
  }
};

export const readFile = async (filePath: string): Promise<string> => {
  try {
    return await RNFS.readFile(filePath, 'utf8');
  } catch (error) {
    logger.error(`Error reading file: ${filePath}`, error);
    throw error;
  }
};

export const writeFile = async (filePath: string, content: string): Promise<void> => {
  try {
    const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
    await ensureDirectoryExists(dirPath);
    
    await RNFS.writeFile(filePath, content, 'utf8');
  } catch (error) {
    logger.error(`Error writing file: ${filePath}`, error);
    throw error;
  }
};

export const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    await RNFS.unlink(filePath);
    return true;
  } catch (error: unknown) {
    if (hasErrorCode(error) && error.code === 'ENOENT') {
      return true; // File doesn't exist, consider it deleted
    }
    logger.error(`Error deleting file: ${filePath}`, error);
    return false;
  }
};

export const copyFile = async (sourcePath: string, destPath: string): Promise<boolean> => {
  try {
    await ensureDirectoryExists(destPath.substring(0, destPath.lastIndexOf('/')));
    await RNFS.copyFile(sourcePath, destPath);
    return true;
  } catch (error) {
    logger.error(`Error copying file from ${sourcePath} to ${destPath}`, error);
    return false;
  }
};

export const moveFile = async (sourcePath: string, destPath: string): Promise<boolean> => {
  try {
    await ensureDirectoryExists(destPath.substring(0, destPath.lastIndexOf('/')));
    await RNFS.moveFile(sourcePath, destPath);
    return true;
  } catch (error) {
    logger.error(`Error moving file from ${sourcePath} to ${destPath}`, error);
    return false;
  }
};

export const listFiles = async (dirPath: string): Promise<string[]> => {
  try {
    await ensureDirectoryExists(dirPath);
    const files = await RNFS.readDir(dirPath);
    return files.map((file) => file.name);
  } catch (error) {
    logger.error(`Error listing files in directory: ${dirPath}`, error);
    return [];
  }
};

export const getFileInfo = async (filePath: string) => {
  try {
    return await RNFS.stat(filePath);
  } catch (error) {
    logger.error(`Error getting file info: ${filePath}`, error);
    throw error;
  }
};

export const getFileSize = async (filePath: string): Promise<number> => {
  try {
    const fileInfo = await RNFS.stat(filePath);
    if (fileInfo.isFile() && 'size' in fileInfo) {
      return (fileInfo as unknown as { size: number }).size;
    }
    return 0;
  } catch (error: unknown) {
    if (hasErrorCode(error) && error.code === 'ENOENT') {
      return 0;
    }
    logger.error(`Error getting file size: ${filePath}`, error);
    return 0;
  }
};

export const getFileUriForPlatform = (filePath: string): string => {
  if (Platform.OS === 'android' && filePath.startsWith('file://')) {
    return filePath;
  }
  
  if (filePath.startsWith('http') || filePath.startsWith('content://') || filePath.startsWith('file://')) {
    return filePath;
  }
  
  return `file://${filePath}`;
};

interface DownloadResult {
  uri: string;
  status: number;
  headers: Record<string, string>;
  mimeType?: string | null;
}

type DownloadProgressCallback = (progress: {
  totalBytesWritten: number;
  totalBytesExpectedToWrite: number;
}) => void;

export const downloadFile = async (
  uri: string, 
  localPath: string, 
  onProgress?: DownloadProgressCallback
): Promise<DownloadResult> => {
  try {
    await ensureDirectoryExists(localPath.substring(0, localPath.lastIndexOf('/')));
    
    const downloadOptions = {
      fromUrl: uri,
      toFile: localPath,
      background: true,
      begin: (res: { bytesWritten: number; contentLength: number }) => {
        logger.debug(`Starting download: ${res.bytesWritten} of ${res.contentLength} bytes`);
      },
      progress: (res: { bytesWritten: number; contentLength: number }) => {
        const progress = (res.bytesWritten / res.contentLength);
        logger.debug(`Download progress: ${progress.toFixed(2)}%`);
        
        if (onProgress) {
          onProgress({
            totalBytesWritten: res.bytesWritten,
            totalBytesExpectedToWrite: res.contentLength
          });
        }
      }
    };

    const result = await RNFS.downloadFile(downloadOptions).promise;
    
    if (result.statusCode !== 200) {
      throw new Error(`Download failed with status code: ${result.statusCode}`);
    }
    
    // Get mime type from file path
    const mimeType = getMimeType(localPath);
    
    return {
      uri: `file://${localPath}`,
      status: result.statusCode,
      headers: {},
      mimeType
    };
  } catch (error) {
    logger.error(`Error downloading file from ${uri} to ${localPath}`, error);
    throw error;
  }
};
