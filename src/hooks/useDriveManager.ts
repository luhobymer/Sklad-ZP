import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import RNFS from 'react-native-fs';
import { useGoogleDrive } from '../services/GoogleDriveService';
import { formatFileSize, getFileInfo } from '../utils/driveUtils';
import { DriveFile } from '../types/drive';
import { Logger } from '../utils/logger';

// Створюємо логер для useDriveManager
const logger = new Logger({ prefix: 'useDriveManager' });


/**
 * Custom hook for managing Google Drive operations
 */
const useDriveManager = () => {
  const {
    isAuthorized,
    authorize,
    uploadFile: driveUploadFile,
    downloadFile: driveDownloadFile,
    deleteFile: driveDeleteFile,
    listFiles: driveListFiles,
    accessToken,
    isLoading: isDriveLoading,
    error: driveError,
  } = useGoogleDrive();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<DriveFile[]>([]);

  // Update error state when driveError changes
  useEffect(() => {
    if (driveError) {
      setError(driveError);
    }
  }, [driveError]);

  /**
   * Handle authentication with Google Drive
   */
  const handleAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await authorize();
      
      if (success) {
        await loadFiles();
        return true;
      }
      
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to authenticate with Google Drive';
      setError(errorMessage);
      logger.error('Authentication error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [authorize]);

  /**
   * Load files from Google Drive
   */
  const loadFiles = useCallback(async () => {
    if (!isAuthorized()) {
      const authSuccess = await handleAuth();
      if (!authSuccess) return [];
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const fileList = await driveListFiles();
      setFiles(fileList);
      return fileList;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load files from Google Drive';
      setError(errorMessage);
      logger.error('Error loading files:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isAuthorized, handleAuth, driveListFiles]);

  /**
   * Upload a file to Google Drive
   */
  const uploadFile = useCallback(async (fileUri: string, fileName?: string) => {
    if (!isAuthorized()) {
      const authSuccess = await handleAuth();
      if (!authSuccess) {
        throw new Error('Authentication required');
      }
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Get file info
      const fileInfo = await getFileInfo(fileUri);
      const finalFilename = fileName || fileInfo.name;
      
      // Upload the file
      const fileId = await driveUploadFile(fileUri, finalFilename);
      
      if (!fileId) {
        throw new Error('Failed to upload file');
      }
      
      // Refresh files list
      await loadFiles();
      
      return fileId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file to Google Drive';
      setError(errorMessage);
      logger.error('Upload error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthorized, handleAuth, driveUploadFile, loadFiles]);

  /**
   * Download a file from Google Drive
   */
  const downloadFile = useCallback(async (fileId: string, fileName: string) => {
    if (!isAuthorized()) {
      const authSuccess = await handleAuth();
      if (!authSuccess) {
        throw new Error('Authentication required');
      }
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Create a local file path
      const localUri = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      
      // Download the file
      const success = await driveDownloadFile(fileId, localUri);
      
      if (!success) {
        throw new Error('Failed to download file');
      }
      
      return localUri;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download file from Google Drive';
      setError(errorMessage);
      logger.error('Download error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthorized, handleAuth, driveDownloadFile]);

  /**
   * Delete a file from Google Drive
   */
  const deleteFile = useCallback(async (fileId: string) => {
    if (!isAuthorized()) {
      const authSuccess = await handleAuth();
      if (!authSuccess) {
        throw new Error('Authentication required');
      }
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Delete the file
      const success = await driveDeleteFile(fileId);
      
      if (!success) {
        throw new Error('Failed to delete file');
      }
      
      // Refresh files list
      await loadFiles();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete file from Google Drive';
      setError(errorMessage);
      logger.error('Delete error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthorized, handleAuth, driveDeleteFile, loadFiles]);

  /**
   * Create a backup of app data
   */
  const createBackup = useCallback(async (data: any, backupName = `backup_${new Date().toISOString()}.json`) => {
    if (!isAuthorized()) {
      const authSuccess = await handleAuth();
      if (!authSuccess) {
        throw new Error('Authentication required');
      }
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Convert data to JSON string
      const jsonData = JSON.stringify(data, null, 2);
      
      // Create a temporary file
      const tempUri = `${RNFS.CachesDirectoryPath}/${backupName}`;
      await RNFS.writeFile(tempUri, jsonData, 'utf8');
      
      // Upload the backup file
      const fileId = await uploadFile(tempUri, backupName);
      
      // Clean up temporary file
      await RNFS.unlink(tempUri);
      
      return fileId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create backup';
      setError(errorMessage);
      logger.error('Backup creation error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthorized, handleAuth, uploadFile]);

  /**
   * Restore app data from a backup
   */
  const restoreBackup = useCallback(async (fileId: string): Promise<any> => {
    if (!isAuthorized()) {
      const authSuccess = await handleAuth();
      if (!authSuccess) {
        throw new Error('Authentication required');
      }
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Download the backup file
      const tempUri = `${RNFS.CachesDirectoryPath}/restore_${Date.now()}.json`;
      await downloadFile(fileId, tempUri);
      
      // Read the file content
      const fileContent = await RNFS.readFile(tempUri, 'utf8');
      
      // Parse the JSON data
      const data = JSON.parse(fileContent);
      
      // Clean up temporary file
      await RNFS.unlink(tempUri);
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore backup';
      setError(errorMessage);
      logger.error('Restore error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthorized, handleAuth, downloadFile]);

  /**
   * Get file metadata
   */
  const getFileMetadata = useCallback(async (fileId: string) => {
    if (!isAuthorized()) {
      const authSuccess = await handleAuth();
      if (!authSuccess) {
        throw new Error('Authentication required');
      }
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Get file metadata from Google Drive
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,size,mimeType,createdTime,modifiedTime`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get file metadata');
      }
      
      const fileData = await response.json();
      
      // Format the file data
      const formattedFile: DriveFile = {
        id: fileData.id,
        name: fileData.name,
        mimeType: fileData.mimeType,
        size: parseInt(fileData.size || '0'),
        createdTime: fileData.createdTime,
        modifiedTime: fileData.modifiedTime,
        sizeFormatted: formatFileSize(parseInt(fileData.size || '0')),
      };
      
      return formattedFile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get file metadata';
      setError(errorMessage);
      logger.error('Metadata error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, isAuthorized, handleAuth]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isAuthorized: isAuthorized(),
    isLoading: isLoading || isDriveLoading,
    error,
    files,
    accessToken,
    
    // Actions
    authorize: handleAuth,
    signOut: useCallback(() => {
      // This would be implemented in the GoogleDriveService
      // For now, we'll just clear the local state
      setFiles([]);
      setError(null);
    }, []),
    loadFiles,
    uploadFile,
    downloadFile,
    deleteFile,
    createBackup,
    restoreBackup,
    getFileMetadata,
    clearError,
  };
};

export default useDriveManager;
