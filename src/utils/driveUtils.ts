import RNFS from 'react-native-fs';
import { Logger } from '../utils/logger';

// Створюємо логер для driveUtils
const logger = Logger.getInstance({ prefix: 'driveUtils' });


/**
 * Utility functions for Google Drive operations
 */

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
};

/**
 * Generate a unique filename with timestamp
 */
export const generateUniqueFilename = (originalName: string): string => {
  const ext = getFileExtension(originalName);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${random}.${ext}`;
};

/**
 * Get MIME type from file extension
 */
export const getMimeType = (filename: string): string => {
  const ext = getFileExtension(filename);
  
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

/**
 * Get file size in a human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Read file as base64 string
 */
export const readFileAsBase64 = async (uri: string): Promise<string> => {
  try {
    const filePath = uri.replace('file://', '');
    const exists = await RNFS.exists(filePath);
    if (!exists) {
      throw new Error(`File not found: ${uri}`);
    }
    const base64 = await RNFS.readFile(filePath, 'base64');
    return base64;
  } catch (error) {
    logger.error('Error reading file as base64:', error);
    throw error;
  }
};

export const getFileInfo = async (uri: string): Promise<{
  name: string;
  size: number;
  type: string;
  uri: string;
}> => {
  const filePath = uri.replace('file://', '');
  const exists = await RNFS.exists(filePath);
  if (!exists) {
    throw new Error(`File not found: ${uri}`);
  }
  const stat = await RNFS.stat(filePath);
  const filename = uri.split('/').pop() || 'file';
  const mimeType = getMimeType(filename);
  return {
    name: filename,
    size: (stat as any).size || 0,
    type: mimeType,
    uri,
  };
};

/**
 * Check if file exists in app's document directory
 */
export const fileExists = async (filename: string): Promise<boolean> => {
  const filePath = `${RNFS.DocumentDirectoryPath}/${filename}`;
  return RNFS.exists(filePath);
};

export const copyToAppDirectory = async (
  sourceUri: string,
  destinationFilename?: string
): Promise<string> => {
  const filename = destinationFilename || sourceUri.split('/').pop() || 'file';
  const destinationPath = `${RNFS.DocumentDirectoryPath}/${filename}`;
  const isLocal = !sourceUri.startsWith('http');
  try {
    if (isLocal) {
      const sourcePath = sourceUri.replace('file://', '');
      await RNFS.copyFile(sourcePath, destinationPath);
    } else {
      const downloadResult = await RNFS.downloadFile({ fromUrl: sourceUri, toFile: destinationPath }).promise;
      if (downloadResult.statusCode !== 200) {
        throw new Error('Failed to download file');
      }
    }
    return `file://${destinationPath}`;
  } catch (error) {
    logger.error('Error copying file:', error);
    throw error;
  }
};

/**
 * Load file from app's assets
 * Note: This function is deprecated as Asset is not available in React Native without Expo
 */
export const loadFileFromAssets = async (assetModule: any): Promise<string> => {
  try {
    // TODO: Implement asset loading without Expo
    throw new Error('Asset loading not implemented without Expo');
  } catch (error) {
    logger.error('Error loading asset:', error);
    throw error;
  }
};
