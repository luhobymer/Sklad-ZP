import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import RNFS from 'react-native-fs';
import { GoogleDriveService } from '../services/GoogleDriveService';
import { DriveFile } from '../types/drive';
import { RootStackParamList } from '../types/navigation';
import { createLogger } from '../utils/logger';

// Створюємо логер для GoogleDriveScreen
const logger = createLogger({ prefix: 'GoogleDriveScreen' });

type GoogleDriveScreenProps = {
  navigation: {
    navigate: (screen: keyof RootStackParamList, params?: any) => void;
    goBack: () => void;
  };
};

/**
 * Екран для роботи з Google Drive
 * Дозволяє авторизуватися, завантажувати, скачувати та видаляти файли
 */
const GoogleDriveScreen: React.FC<GoogleDriveScreenProps> = ({ navigation }) => {
  // Ініціалізація сервісу Google Drive
  const [googleDriveService] = useState(() => GoogleDriveService.getInstance());
  
  // Стани
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [googleDriveError, setGoogleDriveError] = useState<string | null>(null);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Функція для завантаження списку файлів
  const loadFiles = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const backups = await googleDriveService.getBackupsList();
      // Фільтруємо лише файли, ігноруючи папки
      const fileItems = backups.filter((item): item is DriveFile => 'mimeType' in item);
      setFiles(fileItems);
      setLocalError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
      logger.error('Помилка завантаження файлів:', error);
      setGoogleDriveError(`Помилка завантаження списку файлів: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [googleDriveService]);

  // Функція для завантаження файлу з Google Drive
  const handleDownloadFile = async (fileId: string, fileName: string) => {
    try {
      setIsLoading(true);
      // Створюємо шлях для збереження файлу
      const fileUri = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      await googleDriveService.downloadFile(fileId, fileUri);
      Alert.alert('Успіх', 'Файл успішно завантажено');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
      setLocalError(`Помилка завантаження файлу: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Функція для видалення файлу з Google Drive
  const handleDeleteFile = async (fileId: string) => {
    try {
      setIsLoading(true);
      await googleDriveService.deleteFile(fileId);
      // Оновлюємо список файлів після видалення
      await loadFiles();
      Alert.alert('Успіх', 'Файл успішно видалено');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
      setLocalError(`Помилка видалення файлу: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Функція для авторизації в Google Drive
  const handleAuthorize = React.useCallback(async () => {
    try {
      setLocalError(null);
      setIsLoading(true);
      
      const success = await googleDriveService.authorize();
      setIsAuthorized(success);
      
      if (success) {
        Alert.alert('Успіх', 'Авторизація пройшла успішно!');
        await loadFiles();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
      logger.error('Помилка авторизації:', error);
      setLocalError(`Помилка авторизації: ${errorMessage}`);
      setGoogleDriveError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [googleDriveService, loadFiles]);

  // Перевірка авторизації при завантаженні компонента
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const isAuth = await googleDriveService.isAuthorized();
        setIsAuthorized(isAuth);
        if (isAuth) {
          await loadFiles();
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
        logger.error('Помилка перевірки авторизації:', error);
        setGoogleDriveError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [googleDriveService, loadFiles]);

  /**
   * Завантаження тестового файлу на Google Drive
   */
  const handleUploadTestFile = async () => {
    try {
      setLocalError(null);
      setIsLoading(true);
      
      // Перевіряємо, чи користувач авторизований
      if (!isAuthorized) {
        const isAuth = await googleDriveService.isAuthorized();
        if (!isAuth) {
          Alert.alert('Помилка', 'Будь ласка, спочатку авторизуйтеся в Google Drive');
          return;
        }
      }
      
      const testContent = JSON.stringify({ 
        test: 'test data', 
        date: new Date().toISOString(),
        app: 'Sklad ZP',
        version: '1.0.0'
      });
      
      const testFilePath = `${RNFS.DocumentDirectoryPath}/test_${Date.now()}.json`;
      
      // Зберігаємо тестовий файл локально
      await RNFS.writeFile(testFilePath, testContent, 'utf8');
      
      // Створюємо унікальне ім'я файлу з часом створення
      const fileName = `test_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      
      // Завантажуємо на Google Drive
      const fileId = await googleDriveService.uploadFile(testFilePath, fileName);
      
      if (fileId) {
        Alert.alert('Успіх', 'Тестовий файл успішно завантажено на Google Drive');
        // Оновлюємо список файлів після успішного завантаження
        await loadFiles();
      } else {
        throw new Error('Не вдалося завантажити файл на Google Drive');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
      logger.error('Помилка завантаження тестового файлу:', error);
      setLocalError(`Помилка завантаження файлу: ${errorMessage}`);
      Alert.alert('Помилка', `Не вдалося завантажити файл: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Інтеграція з Google Drive</Text>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Стан: {isAuthorized ? '✅ Авторизовано' : '❌ Не авторизовано'}
          </Text>
          {isLoading && (
            <ActivityIndicator size="small" color="#0066cc" style={styles.loader} />
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={handleAuthorize}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isAuthorized ? 'Оновити авторизацію' : 'Увійти в Google Drive'}
            </Text>
          </TouchableOpacity>

          {isAuthorized && (
            <>
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]}
                onPress={loadFiles}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>Оновити список файлів</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.successButton]}
                onPress={handleUploadTestFile}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>Створити тестовий файл</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        
        {(localError || googleDriveError) && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {localError || googleDriveError}
            </Text>
          </View>
        )}
      </View>

      {files.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Файли на Google Drive:</Text>
          {files.map((file) => {
            // Переконуємо TypeScript, що це об'єкт типу DriveFile
            const driveFile = file as DriveFile;
            return (
              <View key={driveFile.id} style={styles.fileItem}>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="tail">
                    {driveFile.name}
                  </Text>
                  <Text style={styles.fileDate}>
                    {driveFile.createdTime ? new Date(driveFile.createdTime).toLocaleString() : 'Невідомо'}
                    {driveFile.sizeFormatted ? ` • ${driveFile.sizeFormatted}` : ''}
                  </Text>
                </View>
                <View style={styles.fileActions}>
                  <TouchableOpacity 
                    style={[styles.fileButton, styles.downloadButton]}
                    onPress={() => handleDownloadFile(driveFile.id, driveFile.name)}
                    disabled={isLoading}
                  >
                    <Text style={styles.fileButtonText}>Скачати</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.fileButton, styles.deleteButton]}
                    onPress={() => handleDeleteFile(driveFile.id)}
                    disabled={isLoading}
                  >
                    <Text style={styles.fileButtonText}>Видалити</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#444',
  },
  statusContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  statusText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  tokenText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    marginTop: 8,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  successButton: {
    backgroundColor: '#5856D6',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  fileInfo: {
    flex: 1,
    marginRight: 10,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  fileDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  fileActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  fileButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginLeft: 8,
  },
  downloadButton: {
    backgroundColor: '#34C759',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  fileButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  loader: {
    marginTop: 8,
  },
});

export default GoogleDriveScreen;
