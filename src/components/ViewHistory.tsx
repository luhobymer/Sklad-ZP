import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import SafeFlatList from './common/SafeFlatList';
import { Part } from '../models/Part';
import FileStorageService from '../services/FileStorageService';
import { colors, spacing, typography } from '../theme/theme';
import PartCard from './PartCard';
import Button from './Button';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Logger } from '../utils/logger';

// Створюємо логер для ViewHistory
const logger = new Logger({ prefix: 'ViewHistory' });


type ViewHistoryScreenProps = NativeStackScreenProps<RootStackParamList, 'ViewHistory'>;

const ViewHistory: React.FC<ViewHistoryScreenProps> = ({ navigation }) => {
  const [historyItems, setHistoryItems] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Завантажуємо історію при першому рендері
    loadViewHistory();
  }, []);

  const loadViewHistory = async () => {
    try {
      setLoading(true);
      const storageService = FileStorageService;
      
      if (!storageService) {
        Alert.alert('Помилка', 'Сховище недоступне');
        return;
      }
      
      const history = await storageService.getViewHistory();
      setHistoryItems(history);
    } catch (error) {
      logger.error('Помилка при завантаженні історії переглядів:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити історію переглядів');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      setLoading(true);
      const storageService = FileStorageService;
      
      if (!storageService) {
        Alert.alert('Помилка', 'Сховище недоступне');
        return;
      }
      
      await storageService.clearViewHistory();
      setHistoryItems([]);
    } catch (error) {
      logger.error('Помилка при очищенні історії переглядів:', error);
      Alert.alert('Помилка', 'Не вдалося очистити історію переглядів');
    } finally {
      setLoading(false);
    }
  };

  const handlePartSelect = (part: Part) => {
    navigation.navigate('PartDetails', { partId: part.id });
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Історія переглядів</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      {historyItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Історія переглядів порожня</Text>
        </View>
      ) : (
        <SafeFlatList<Part>
          data={Array.isArray(historyItems) ? historyItems : []}
          keyExtractor={(item) => item.id?.toString() || ''}
          renderItem={({ item }) => (
            <PartCard
              part={item}
              onPress={() => handlePartSelect(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
      
      <View style={styles.footer}>
        <Button
          title="Очистити історію"
          onPress={handleClearHistory}
          variant="danger"
          loading={loading}
          style={styles.clearButton}
        />
        <Button
          title="Закрити"
          onPress={handleClose}
          variant="secondary"
          style={styles.closeBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    fontFamily: 'System',
    fontWeight: '600' as const,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: 'bold' as const,
    lineHeight: 16,
    fontFamily: 'System',
  },
  listContent: {
    padding: spacing.small as number
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    ...typography.body,
    color: colors.textLight,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 'normal' as const,
    fontFamily: 'System',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.medium as number
  },
  clearButton: {
    flex: 1,
    marginRight: (spacing.small as number) / 2
  },
  closeBtn: {
    flex: 1,
    marginLeft: (spacing.small as number) / 2
  }
});

export default ViewHistory;