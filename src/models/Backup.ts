/**
 * Інтерфейс для резервної копії
 */
export interface Backup {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  size: number; // розмір у байтах
  filePath: string;
  isCloud: boolean; // чи зберігається в хмарі
  cloudId?: string; // ідентифікатор в хмарному сховищі
  status: BackupStatus;
  metadata?: BackupMetadata;
}

/**
 * Статус резервної копії
 */
export enum BackupStatus {
  CREATING = 'creating',
  READY = 'ready',
  UPLOADING = 'uploading',
  DOWNLOADING = 'downloading',
  RESTORING = 'restoring',
  FAILED = 'failed',
  DELETED = 'deleted'
}

/**
 * Метадані резервної копії
 */
export interface BackupMetadata {
  partsCount: number;
  categoriesCount: number;
  version: string;
  deviceInfo: string;
  checksum: string;
}

/**
 * Інтерфейс для прогресу операції з резервною копією
 */
export interface BackupProgress {
  status: BackupStatus;
  progress: number; // від 0 до 100
  message?: string;
  error?: string;
}

/**
 * Створює нову резервну копію
 * @param data Дані для створення резервної копії
 * @returns Нова резервна копія
 */
export const createBackup = (data: Omit<Backup, 'id' | 'createdAt' | 'status'>): Omit<Backup, 'id'> => {
  return {
    ...data,
    createdAt: new Date(),
    status: BackupStatus.CREATING
  };
};

/**
 * Перевіряє, чи є об'єкт резервною копією
 * @param obj Об'єкт для перевірки
 * @returns true, якщо об'єкт є резервною копією
 */
export const isBackup = (obj: unknown): obj is Backup => {
  if (!obj || typeof obj !== 'object') return false;
  
  const backup = obj as Partial<Backup>;
  return (
    typeof backup.id === 'string' &&
    typeof backup.name === 'string' &&
    typeof backup.filePath === 'string' &&
    typeof backup.size === 'number' &&
    typeof backup.isCloud === 'boolean' &&
    (backup.createdAt instanceof Date) &&
    Object.values(BackupStatus).includes(backup.status as BackupStatus)
  );
};

/**
 * Перевіряє, чи є резервна копія доступною для відновлення
 * @param backup Резервна копія для перевірки
 * @returns true, якщо резервна копія доступна для відновлення
 */
export const isBackupAvailableForRestore = (backup: Backup): boolean => {
  return backup.status === BackupStatus.READY;
};

/**
 * Оновлює статус резервної копії
 * @param backup Резервна копія
 * @param status Новий статус
 * @returns Оновлена резервна копія
 */
export const updateBackupStatus = (backup: Backup, status: BackupStatus): Backup => {
  return {
    ...backup,
    status
  };
};

/**
 * Перетворює дані з бази даних у об'єкт резервної копії
 * @param data Дані з бази даних
 * @returns Об'єкт резервної копії
 */
export const fromDatabase = (data: Record<string, unknown>): Backup => {
  return {
    id: String(data.id),
    name: String(data.name),
    description: data.description ? String(data.description) : null,
    createdAt: new Date(String(data.createdAt)),
    size: Number(data.size),
    filePath: String(data.filePath),
    isCloud: Boolean(data.isCloud),
    cloudId: data.cloudId ? String(data.cloudId) : undefined,
    status: data.status as BackupStatus,
    metadata: data.metadata ? JSON.parse(String(data.metadata)) as BackupMetadata : undefined
  };
};

/**
 * Перетворює об'єкт резервної копії у формат для зберігання в базі даних
 * @param backup Об'єкт резервної копії
 * @returns Об'єкт для зберігання в базі даних
 */
export const toDatabase = (backup: Backup): Record<string, unknown> => ({
  id: backup.id,
  name: backup.name,
  description: backup.description || null,
  createdAt: backup.createdAt.toISOString(),
  size: backup.size,
  filePath: backup.filePath,
  isCloud: backup.isCloud,
  cloudId: backup.cloudId || null,
  status: backup.status,
  metadata: backup.metadata ? JSON.stringify(backup.metadata) : null
});
