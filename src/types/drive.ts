/**
 * Types for Google Drive integration
 */

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  iconLink?: string;
  hasThumbnail?: boolean;
  fileExtension?: string;
  fullFileExtension?: string;
  sizeFormatted?: string;
  modifiedFormatted?: string;
  isFolder?: boolean;
  parents?: string[];
}

export interface DriveFolder {
  id: string;
  name: string;
  mimeType: 'application/vnd.google-apps.folder';
  createdTime?: string;
  modifiedTime?: string;
  parents?: string[];
  webViewLink?: string;
}

export interface UploadProgress {
  totalBytesExpectedToSend: number;
  totalBytesSent: number;
  progress: number; // 0 to 1
}

export type DownloadProgress = UploadProgress

export interface DriveError {
  code: string;
  message: string;
  errors?: Array<{
    message: string;
    domain: string;
    reason: string;
    location?: string;
    locationType?: string;
  }>;
}

export interface DriveFileList {
  nextPageToken?: string;
  files: DriveFile[];
}

export interface DriveUploadOptions {
  mimeType?: string;
  folderId?: string;
  onProgress?: (progress: UploadProgress) => void;
  onComplete?: (file: DriveFile) => void;
  onError?: (error: DriveError) => void;
}

export interface DriveDownloadOptions {
  onProgress?: (progress: DownloadProgress) => void;
  onComplete?: (localUri: string) => void;
  onError?: (error: DriveError) => void;
}

export interface BackupMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  size: number;
  sizeFormatted: string;
  fileId: string;
  version?: string;
  appVersion?: string;
  deviceInfo?: {
    os?: string;
    osVersion?: string;
    model?: string;
    manufacturer?: string;
  };
  customData?: Record<string, any>;
}
