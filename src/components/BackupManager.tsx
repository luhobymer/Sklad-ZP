import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { colors, spacing } from '../theme/theme';
import BackupService from '../services/BackupService';
import Button from './Button';
import { Ionicons } from '@expo/vector-icons';

interface BackupManagerProps {
  visible: boolean;
  onClose: () => void;
  onBackupCreated?: () => void;
  onBackupRestored?: () => void;
}

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
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [backupName, setBackupName] = useState('');
  const backupService = BackupService.getInstance();

  useEffect(() => {
    if (visible) {
      loadBackups();
    }
  }, [visible]);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const backupsList = await backupService.getBackupsList();
      setBackups(backupsList);
    } catch (error) {
      console.error('Помилка при завантаженні резервних копій:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити список резервних копій');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      const backupPath = await backupService.createBackup(backupName);
      Alert.alert('Успіх', 'Резервну копію успішно створено');
      setShowCreateModal(false);
      setBackupName('');
      await loadBackups();
      if (onBackupCreated) {
        onBackupCreated();
      }
    } catch (error) {
      console.error('Помилка при створенні резервної копії:', error);
      Alert.alert('Помилка', 'Не вдалося створити резервну копію');
    } finally {
      setLoading(false);
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
              await backupService.restoreFromBackup(backup.path);
              Alert.alert('Успіх', 'Дані успішно відновлено з резервної копії');
              if (onBackupRestored) {
                onBackupRestored();
              }
              onClose();
            } catch (error) {
              console.error('Помилка при відновленні з резервної копії:', error);
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
              await backupService.deleteBackup(backup.path);
              await loadBackups();
              Alert.alert('Успіх', 'Резервну копію успішно видалено');
            } catch (error) {
              console.error('Помилка при видаленні резервної копії:', error);
              Alert.alert('Помилка', 'Не вдалося видалити резервну копію');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleShareBackup = async (backup: BackupItem) => {
    try {
      await backupService.shareFile(backup.path);
    } catch (error) {
      console.error('Помилка при поділенні резервною копією:', error);
      Alert.alert('Помилка', 'Не вдалося поділитися резервною копією');
    }
  };

  const handleExportCSV = async () => {
    try {
      setLoading(true);
      const csvPath = await backupService.exportToCSV();
      Alert.alert(
        'Експорт завершено',
        'Дані успішно експортовано в CSV файл. Бажаєте поділитися файлом?',
        [
          { text: 'Ні', style: 'cancel' },
          {
            text: 'Так',
            onPress: async () => {
              try {
                await backupService.shareFile(csvPath);
              } catch (error) {
                console.error('Помилка при поділенні CSV файлом:', error);
                Alert.alert('Помилка', 'Не вдалося поділитися CSV файлом');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Помилка при експорті в CSV:', error);
      Alert.alert('Помилка', 'Не вдалося експортувати дані в CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleImportCSV = async () => {
    try {
      const filePath = await backupService.pickFileForImport();
      if (!filePath) return;

      Alert.alert(
        'Імпорт даних',
        'Як ви хочете імпортувати дані?',
        [
          { text: 'Скасувати', style: 'cancel' },
          {
            text: 'Додати до існуючих',
            onPress: async () => {
              try {
                setLoading(true);
                const count = await backupService.importFromCSV(filePath, false);
                Alert.alert('Успіх', `Імпортовано ${count} запчастин`);
                if (onBackupRestored) {
                  onBackupRestored();
                }
              } catch (error) {
                console.error('Помилка при імпорті з CSV:', error);
                Alert.alert('Помилка', 'Не вдалося імпортувати дані з CSV');
              } finally {
                setLoading(false);
              }
            }
          },
          {
            text: 'Замінити існуючі',
            style: 'destructive',
            onPress: async () => {
              try {
                setLoading(true);
                const count = await backupService.importFromCSV(filePath, true);
                Alert.alert('Успіх', `Імпортовано ${count} запчастин, існуючі дані замінено`);
                if (onBackupRestored) {
                  onBackupRestored();
                }
              } catch (error) {
                console.error('Помилка при імпорті з CSV:', error);
                Alert.alert('Помилка', 'Не вдалося імпортувати дані з CSV');
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Помилка при імпорті з CSV:', error);
      Alert.alert('Помилка', 'Не вдалося імпортувати дані з CSV');
    }
  };

  const renderBackupItem = ({ item }: { item: BackupItem }) => (
    <View style={styles.backupItem}>
      <View style={styles.backupInfo}>
        <Text style={styles.backupName}>{item.name}</Text>
        <Text style={styles.backupDate}>
          {item.date.toLocaleDateString()} {item.date.toLocaleTimeString()}
        </Text>
      </View>
      <View style={styles.backupActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleShareBackup(item)}
        >
          <Ionicons name="share-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleRestoreBackup(item)}
        >
          <Ionicons name="refresh-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteBackup(item)}
        >
          <Ionicons name="trash-outline" size={22} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Резервне копіювання</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.actionsContainer}>
            <Button
              title="Створити резервну копію"
              onPress={() => setShowCreateModal(true)}
              variant="primary"
              style={styles.actionButton}
            />
            <Button
              title="Експорт в CSV"
              onPress={handleExportCSV}
              variant="secondary"
              style={styles.actionButton}
            />
            <Button
              title="Імпорт з CSV/JSON"
              onPress={handleImportCSV}
              variant="secondary"
              style={styles.actionButton}
            />
          </View>

          <Text style={styles.sectionTitle}>Список резервних копій</Text>
          
          {backups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {loading ? "Завантаження..." : "Немає резервних копій"}
              </Text>
            </View>
          ) : (
            <FlatList
              data={backups}
              renderItem={renderBackupItem}
              keyExtractor={(item) => item.path}
              contentContainerStyle={styles.list}
            />
          )}
        </View>
      </View>

      {/* Модальне вікно для створення резервної копії */}
      <Modal
        visible={showCreateModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.createModalContainer}>
          <View style={styles.createModalContent}>
            <Text style={styles.createModalTitle}>Створити резервну копію</Text>
            <TextInput
              style={styles.input}
              placeholder="Назва резервної копії (необов'язково)"
              value={backupName}
              onChangeText={setBackupName}
            />
            <View style={styles.createModalButtons}>
              <Button
                title="Скасувати"
                onPress={() => {
                  setShowCreateModal(false);
                  setBackupName('');
                }}
                variant="secondary"
                style={styles.createModalButton}
              />
              <Button
                title="Створити"
                onPress={handleCreateBackup}
                variant="primary"
                style={styles.createModalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.md,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text
  },
  closeButton: {
    padding: spacing.xs
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    flexWrap: 'wrap'
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.sm
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm
  },
  list: {
    paddingBottom: spacing.md
  },
  backupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  backupInfo: {
    flex: 1
  },
  backupName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4
  },
  backupDate: {
    fontSize: 14,
    color: colors.textLight
  },
  backupActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionIcon: {
    marginLeft: spacing.sm
  },
  emptyContainer: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    fontStyle: 'italic'
  },
  createModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  createModalContent: {
    width: '80%',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.md,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  createModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface
  },
  createModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  createModalButton: {
    flex: 1,
    marginHorizontal: spacing.xs
  }
});

export default BackupManager;
