import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Logger } from '../utils/logger';
import SafeFlatList from '../components/common/SafeFlatList';

const logger = new Logger({ prefix: 'ViewHistoryScreen' });

interface HistoryItem {
  id: string;
  type: 'add' | 'edit' | 'delete' | 'scan' | 'backup' | 'restore';
  title: string;
  description: string;
  timestamp: string;
  partId?: string;
  partName?: string;
}

const getIconForType = (type: HistoryItem['type']) => {
  switch (type) {
    case 'add':
      return 'plus-circle';
    case 'edit':
      return 'pencil';
    case 'delete':
      return 'delete';
    case 'scan':
      return 'barcode-scan';
    case 'backup':
      return 'cloud-upload';
    case 'restore':
      return 'cloud-download';
    default:
      return 'information';
  }
};

const getColorForType = (type: HistoryItem['type'], theme: any) => {
  switch (type) {
    case 'add':
      return theme.colors.primary;
    case 'edit':
      return theme.colors.tertiary;
    case 'delete':
      return theme.colors.error;
    case 'scan':
      return theme.colors.secondary;
    case 'backup':
    case 'restore':
      return theme.colors.primary;
    default:
      return theme.colors.onSurfaceVariant;
  }
};

const ViewHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  type FilterKey = 'all' | HistoryItem['type'];
  const [filter, setFilter] = useState<FilterKey>('all');

  const loadHistory = async () => {
    try {
      setLoading(true);
      // TODO: Implement actual history loading from storage
      const mockHistory: HistoryItem[] = [
        {
          id: '1',
          type: 'add',
          title: 'Додано запчастину',
          description: 'Гальмівні колодки',
          timestamp: '2024-01-20T14:30:00Z',
          partId: '1',
          partName: 'Гальмівні колодки',
        },
        {
          id: '2',
          type: 'scan',
          title: 'Відскановано штрих-код',
          description: 'Код: 1234567890123',
          timestamp: '2024-01-20T13:15:00Z',
        },
        {
          id: '3',
          type: 'edit',
          title: 'Оновлено запчастину',
          description: 'Масляний фільтр - змінено кількість',
          timestamp: '2024-01-20T12:00:00Z',
          partId: '2',
          partName: 'Масляний фільтр',
        },
        {
          id: '4',
          type: 'backup',
          title: 'Створено резервну копію',
          description: 'Резервна копія даних у Google Drive',
          timestamp: '2024-01-20T10:45:00Z',
        },
        {
          id: '5',
          type: 'delete',
          title: 'Видалено запчастину',
          description: 'Старі гальмівні диски',
          timestamp: '2024-01-19T16:20:00Z',
        },
      ];
      setHistory(mockHistory);
    } catch (error) {
      logger.error('Помилка завантаження історії:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити історію операцій');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const clearHistory = () => {
    Alert.alert(
      'Очистити історію',
      'Ви впевнені, що хочете видалити всю історію операцій?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Очистити',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement actual history clearing
              setHistory([]);
              logger.info('Історію очищено');
            } catch (error) {
              logger.error('Помилка очищення історії:', error);
              Alert.alert('Помилка', 'Не вдалося очистити історію');
            }
          },
        },
      ]
    );
  };

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(item => item.type === filter);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Щойно';
    } else if (diffHours < 24) {
      return `${diffHours} год тому`;
    } else if (diffDays < 7) {
      return `${diffDays} дн тому`;
    } else {
      return date.toLocaleDateString('uk-UA');
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity
      style={[styles.historyItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => {
        if (item.partId) {
          navigation.navigate('PartDetails', { partId: item.partId });
        }
      }}
      disabled={!item.partId}
    >
      <View style={styles.itemHeader}>
        <View style={[styles.iconContainer, { backgroundColor: getColorForType(item.type, theme) + '20' }]}>
          <MaterialCommunityIcons
            name={getIconForType(item.type)}
            size={20}
            color={getColorForType(item.type, theme)}
          />
        </View>
        <View style={styles.itemContent}>
          <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]}>
            {item.title}
          </Text>
          <Text style={[styles.itemDescription, { color: theme.colors.onSurfaceVariant }]}>
            {item.description}
          </Text>
        </View>
        <Text style={[styles.itemTime, { color: theme.colors.onSurfaceVariant }]}>
          {formatTimestamp(item.timestamp)}
        </Text>
      </View>
      {item.partId && (
        <View style={styles.itemFooter}>
          <MaterialCommunityIcons
            name="chevron-right"
            size={16}
            color={theme.colors.onSurfaceVariant}
          />
        </View>
      )}
    </TouchableOpacity>
  );

  const filterOptions: Array<{ key: 'all' | HistoryItem['type']; label: string }> = [
    { key: 'all', label: 'Всі' },
    { key: 'add', label: 'Додавання' },
    { key: 'edit', label: 'Редагування' },
    { key: 'delete', label: 'Видалення' },
    { key: 'scan', label: 'Сканування' },
    { key: 'backup', label: 'Резервні копії' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Історія операцій
        </Text>
        <TouchableOpacity
          style={[styles.clearButton, { borderColor: theme.colors.error }]}
          onPress={clearHistory}
        >
          <MaterialCommunityIcons
            name="delete-sweep"
            size={20}
            color={theme.colors.error}
          />
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <View style={[styles.filterContainer, { backgroundColor: theme.colors.surface }]}>
        <SafeFlatList<{ key: FilterKey; label: string }>
          horizontal
          showsHorizontalScrollIndicator={false}
          data={(Array.isArray(filterOptions) ? filterOptions : []) as { key: FilterKey; label: string }[]}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterTab, {
                backgroundColor: filter === item.key 
                  ? theme.colors.primaryContainer 
                  : 'transparent'
              }]}
              onPress={() => setFilter(item.key)}
            >
              <Text style={[styles.filterTabText, {
                color: filter === item.key 
                  ? theme.colors.onPrimaryContainer 
                  : theme.colors.onSurfaceVariant
              }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* History list */}
      <SafeFlatList<HistoryItem>
        data={(Array.isArray(filteredHistory) ? filteredHistory : []) as HistoryItem[]}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="history"
              size={64}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              {filter === 'all' ? 'Історія операцій порожня' : `Немає операцій типу "${filterOptions.find(f => f.key === filter)?.label}"`}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  historyItem: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 14,
  },
  itemTime: {
    fontSize: 12,
    marginLeft: 8,
  },
  itemFooter: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default ViewHistoryScreen;