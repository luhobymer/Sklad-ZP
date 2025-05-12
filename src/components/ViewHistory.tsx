import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Part } from '../models/Part';
import FileStorageService from '../services/FileStorageService';
import { colors, spacing, typography } from '../theme/theme';
import PartCard from './PartCard';
import Button from './Button';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

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
      const storageService = FileStorageService.getInstance();
      
      if (!storageService) {
        Alert.alert('Помилка', 'Сховище недоступне');
        return;
      }
      
      const history = await storageService.getViewHistory();
      setHistoryItems(history);
    } catch (error) {
      console.error('Помилка при завантаженні історії переглядів:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити історію переглядів');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      setLoading(true);
      const storageService = FileStorageService.getInstance();
      
      if (!storageService) {
        Alert.alert('Помилка', 'Сховище недоступне');
        return;
      }
      
      await storageService.clearViewHistory();
      setHistoryItems([]);
    } catch (error) {
      console.error('Помилка при очищенні історії переглядів:', error);
      Alert.alert('Помилка', 'Не вдалося очистити історію переглядів');
    } finally {
      setLoading(false);
    }
  };

  const handlePartSelect = (part: Part) => {
    navigation.navigate('PartDetails', { part });
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
        <FlatList
          data={historyItems}
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
    marginBottom: spacing.medium
  },
  title: {
    ...typography.h2,
    color: colors.text
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
    fontWeight: 'bold'
  },
  listContent: {
    padding: spacing.small
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    ...typography.body,
    color: colors.textLight
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.medium
  },
  clearButton: {
    flex: 1,
    marginRight: spacing.small / 2
  },
  closeBtn: {
    flex: 1,
    marginLeft: spacing.small / 2
  }
});

export default ViewHistory;