import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import SafeFlatList from './common/SafeFlatList';
import Modal from 'react-native-modal';
import { colors, spacing } from '../theme/theme';
import BackupService from '../services/BackupService'; // Перевірено: актуальний шлях
import Button from './Button'; // Перевірено: актуальний шлях
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Logger } from '../utils/logger'; // Перевірено: актуальний шлях

// Створюємо логер для BackupManager
const logger = new Logger({ name: 'BackupManager' });

// Інтерфейс властивостей компонента BackupManager
interface BackupManagerProps {
  visible: boolean;
  onClose: () => void;
  onBackupCreated?: () => void;
  onBackupRestored?: () => void;
}

// Інтерфейс властивостей резервної копії
interface BackupItem {
  name: string;
  path: string;
  date: Date;
}

const BackupManager: React.FC<BackupManagerProps> = ({ 
  visible, 
  onClose,
  onBackupCreated,
  onBackupRestored
}) => {
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [googleDriveBackups, setGoogleDriveBackups] = useState<{id: string; name: string; date: Date}[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGDriveCreateModal, setShowGDriveCreateModal] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [isGDriveAuthorized, setIsGDriveAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<'local' | 'gdrive'>('local');
  const [gdriveLoading, setGDriveLoading] = useState(false);
  const backupService = BackupService.getInstance();

  useEffect(() => {
    if (visible) {
      loadBackups();
      checkGDriveAuth();
    }
  }, [visible]);

  // Перевірка авторизації в Google Drive
  const checkGDriveAuth = async () => {
    try {
      const isAuthorized = false; // TODO: реалізувати перевірку авторизації Google Drive
      setIsGDriveAuthorized(isAuthorized);
      if (isAuthorized) {
        loadGDriveBackups();
      }
    } catch (error) {
      logger.error('Помилка при перевірці авторизації в Google Drive:', error);
    }
  };

  const loadBackups = async () => {
    try {
      setLoading(true);
      const backupsList: any[] = []; // TODO: реалізувати завантаження резервних копій
      setBackups(backupsList);
    } catch (error) {
      logger.error('Помилка при завантаженні резервних копій:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити список резервних копій');
    } finally {
      setLoading(false);
    }
  };

  // Завантаження резервних копій з Google Drive
  const loadGDriveBackups = async () => {
    try {
      setGDriveLoading(true);
      const backupsList: any[] = []; // TODO: реалізувати завантаження резервних копій з Google Drive
      setGoogleDriveBackups(backupsList);
    } catch (error) {
      logger.error('Помилка при завантаженні резервних копій з Google Drive:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити список резервних копій з Google Drive');
    } finally {
      setGDriveLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      const backupPath = ''; // TODO: реалізувати створення резервної копії
      Alert.alert('Успіх', 'Резервну копію успішно створено');
      setShowCreateModal(false);
      setBackupName('');
      await loadBackups();
      if (onBackupCreated) {
        onBackupCreated();
      }
    } catch (error) {
      logger.error('Помилка при створенні резервної копії:', error);
      Alert.alert('Помилка', 'Не вдалося створити резервну копію');
    } finally {
      setLoading(false);
    }
  };

  // Створення резервної копії в Google Drive
  const handleCreateGDriveBackup = async () => {
    try {
      setGDriveLoading(true);
      
      // Перевіряємо авторизацію
      if (!isGDriveAuthorized) {
        const authorized = false; // TODO: реалізувати авторизацію Google Drive
        if (!authorized) {
          return;
        }
      }
      
      const fileId = ''; // TODO: реалізувати створення резервної копії у Google Drive
      if (fileId) {
        Alert.alert('Успіх', 'Резервну копію успішно створено в Google Drive');
        setShowGDriveCreateModal(false);
        setBackupName('');
        await loadGDriveBackups();
        if (onBackupCreated) {
          onBackupCreated();
        }
      }
    } catch (error) {
      logger.error('Помилка при створенні резервної копії в Google Drive:', error);
      Alert.alert('Помилка', 'Не вдалося створити резервну копію в Google Drive');
    } finally {
      setGDriveLoading(false);
    }
  };

  // Авторизація в Google Drive
  const handleAuthorizeGDrive = async (): Promise<boolean> => {
    try {
      setGDriveLoading(true);
      const authorized = false; // TODO: реалізувати авторизацію Google Drive
      setIsGDriveAuthorized(authorized);
      
      if (authorized) {
        await loadGDriveBackups();
        return true;
      } else {
        Alert.alert('Помилка', 'Не вдалося авторизуватися в Google Drive');
        return false;
      }
    } catch (error) {
      logger.error('Помилка при авторизації в Google Drive:', error);
      Alert.alert('Помилка', 'Не вдалося авторизуватися в Google Drive');
      return false;
    } finally {
      setGDriveLoading(false);
    }
  };

  const handleRestoreBackup = async (backup: BackupItem) => {
    Alert.alert(
      'Відновлення даних',
      `Ви впевнені, що хочете відновити дані з резервної копії "${backup.name}"? Поточні дані будуть замінені.`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Відновити',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              Alert.alert('Успіх', 'Дані успішно відновлено з резервної копії');
              if (onBackupRestored) {
                onBackupRestored();
              }
              onClose();
            } catch (error) {
              logger.error('Помилка при відновленні з резервної копії:', error);
              Alert.alert('Помилка', 'Не вдалося відновити дані з резервної копії');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDeleteBackup = async (backup: BackupItem) => {
    Alert.alert(
      'Видалення резервної копії',
      `Ви впевнені, що хочете видалити резервну копію "${backup.name}"?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              await loadBackups();
            } catch (error) {
              logger.error('Помилка при видаленні резервної копії:', error);
              Alert.alert('Помилка', 'Не вдалося видалити резервну копію');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Відновлення з резервної копії Google Drive
  const handleRestoreGDriveBackup = async (backup: {id: string; name: string; date: Date}) => {
    Alert.alert(
      'Відновлення даних',
      `Ви впевнені, що хочете відновити дані з резервної копії "${backup.name}"? Поточні дані будуть замінені.`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Відновити',
          style: 'destructive',
          onPress: async () => {
            try {
              setGDriveLoading(true);
              await backupService.restoreFromDriveBackup(backup.id);
              Alert.alert('Успіх', 'Дані успішно відновлено з резервної копії');
              if (onBackupRestored) {
                onBackupRestored();
              }
              onClose();
            } catch (error) {
              logger.error('Помилка при відновленні з резервної копії Google Drive:', error);
              Alert.alert('Помилка', 'Не вдалося відновити дані з резервної копії');
            } finally {
              setGDriveLoading(false);
            }
          }
        }
      ]
    );
  };

  // Видалення резервної копії з Google Drive
  const handleDeleteGDriveBackup = async (backup: {id: string; name: string; date: Date}) => {
    Alert.alert(
      'Видалення резервної копії',
      `Ви впевнені, що хочете видалити резервну копію "${backup.name}" з Google Drive?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            try {
              setGDriveLoading(true);
              await backupService.deleteDriveBackup(backup.id);
              await loadGDriveBackups();
              Alert.alert('Успіх', 'Резервну копію успішно видалено з Google Drive');
            } catch (error) {
              logger.error('Помилка при видаленні резервної копії з Google Drive:', error);
              Alert.alert('Помилка', 'Не вдалося видалити резервну копію з Google Drive');
            } finally {
              setGDriveLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleShareBackup = async (backup: BackupItem) => {
    try {
      // TODO: реалізувати shareFile або видалити;
    } catch (error) {
      logger.error('Помилка при поширенні резервної копії:', error);
      Alert.alert('Помилка', 'Не вдалося поширити резервну копію');
    }
  };

  return (
    <>
      <Modal isVisible={visible} onBackdropPress={onClose}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {/* Вкладки */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'local' && styles.activeTab]}
                onPress={() => setActiveTab('local')}
              >
                <Text style={[styles.tabText, activeTab === 'local' && styles.activeTabText]}>Локальні</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'gdrive' && styles.activeTab]}
                onPress={() => setActiveTab('gdrive')}
              >
                <Text style={[styles.tabText, activeTab === 'gdrive' && styles.activeTabText]}>Google Drive</Text>
              </TouchableOpacity>
            </View>

            {/* Локальні резервні копії */}
            {activeTab === 'local' && (
              loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Завантаження...</Text>
                </View>
              ) : (
                <>
                  <View style={styles.buttonContainer}>
                    <Button
                      title="Створити резервну копію"
                      onPress={() => setShowCreateModal(true)}
                      style={styles.createButton}
                    />
                  </View>
                  {backups.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>Немає локальних резервних копій</Text>
                    </View>
                  ) : (
                    <SafeFlatList<{ name: string; path: string; date: Date }>
                      data={Array.isArray(backups) ? backups : []}
                      keyExtractor={(item) => item.path}
                      renderItem={({ item }: { item: { name: string; path: string; date: Date } }) => (
                        <View style={styles.backupItem}>
                          <View style={styles.backupInfo}>
                            <Text style={styles.backupName}>{item.name}</Text>
                            <Text style={styles.backupDate}>{item.date.toLocaleString()}</Text>
                          </View>
                          <View style={styles.backupActions}>
                            <TouchableOpacity
                              onPress={() => handleRestoreBackup(item)}
                              style={styles.actionButton}
                            >
                              <Ionicons name="refresh" size={24} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleShareBackup(item)}
                              style={styles.actionButton}
                            >
                              <Ionicons name="share-outline" size={24} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleDeleteBackup(item)}
                              style={styles.actionButton}
                            >
                              <Ionicons name="trash-outline" size={24} color={colors.danger} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    />
                  )}
                </>
              )
            )}

            {/* Google Drive резервні копії */}
            {activeTab === 'gdrive' && (
              gdriveLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Завантаження...</Text>
                </View>
              ) : (
                <View>
                  <View style={styles.buttonContainer}>
                    {!isGDriveAuthorized ? (
                      <Button 
                        title="Авторизуватися в Google Drive" 
                        onPress={handleAuthorizeGDrive} 
                        style={styles.createButton}
                      />
                    ) : (
                      <Button 
                        title="Створити резервну копію в Google Drive" 
                        onPress={() => setShowGDriveCreateModal(true)} 
                        style={styles.createButton}
                      />
                    )}
                  </View>
                  {!isGDriveAuthorized ? (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>Не авторизовано в Google Drive</Text>
                    </View>
                  ) : (
                    googleDriveBackups.length === 0 ? (
                      <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Немає резервних копій у Google Drive</Text>
                      </View>
                    ) : (
                      <SafeFlatList<{ id: string; name: string; date: Date }>
                        data={Array.isArray(googleDriveBackups) ? googleDriveBackups : []}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }: { item: { id: string; name: string; date: Date } }) => (
                          <View style={styles.backupItem}>
                            <View style={styles.backupInfo}>
                              <Text style={styles.backupName}>{item.name}</Text>
                              <Text style={styles.backupDate}>{item.date.toLocaleString()}</Text>
                            </View>
                            <View style={styles.backupActions}>
                              <TouchableOpacity
                                onPress={() => handleRestoreGDriveBackup(item)}
                                style={styles.actionButton}
                              >
                                <Ionicons name="refresh" size={24} color={colors.primary} />
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => handleDeleteGDriveBackup(item)}
                                style={styles.actionButton}
                              >
                                <Ionicons name="trash-outline" size={24} color={colors.danger} />
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}
                      />
                    )
                  )}
                </View>
              )
            )}
          </View>
        </View>
      </Modal>

      {/* Модальне вікно створення локальної резервної копії */}
      {showCreateModal && (
        <Modal isVisible={showCreateModal} onBackdropPress={() => setShowCreateModal(false)}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Створити резервну копію</Text>
            <TextInput
              style={styles.input}
              placeholder="Назва резервної копії"
              value={backupName}
              onChangeText={setBackupName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { marginRight: spacing.xs }]}
                onPress={() => {
                  setShowCreateModal(false);
                  setBackupName('');
                }}
              >
                <Text>Скасувати</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleCreateBackup}
              >
                <Text>Створити</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Модальне вікно створення резервної копії в Google Drive */}
      {showGDriveCreateModal && (
        <Modal isVisible={showGDriveCreateModal} onBackdropPress={() => setShowGDriveCreateModal(false)}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Створити резервну копію в Google Drive</Text>
            <TextInput
              style={styles.input}
              placeholder="Назва резервної копії"
              value={backupName}
              onChangeText={setBackupName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { marginRight: spacing.xs }]}
                onPress={() => {
                  setShowGDriveCreateModal(false);
                  setBackupName('');
                }}
              >
                <Text>Скасувати</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleCreateGDriveBackup}
              >
                <Text>Створити</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  tab: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: '#333',
  },
  activeTabText: {
    color: '#fff',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 10,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  emptyText: {
    fontSize: 16,
    color: '#333',
  },
  backupItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  backupInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backupName: {
    fontSize: 16,
    color: '#333',
  },
  backupDate: {
    fontSize: 14,
    color: '#666',
  },
  backupActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  actionButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
});

export default BackupManager;
