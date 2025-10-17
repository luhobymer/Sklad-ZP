import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import SafeFlatList from '../components/common/SafeFlatList';
import { useNavigation, useRoute } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../theme/ThemeContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Logger } from '../utils/logger';

const logger = new Logger({ prefix: 'PartsListScreen' });

interface Part {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  location?: string;
  compatibleCars?: string[];
}

const PartsListScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [carQuery, setCarQuery] = useState('');
  const initialCategory = (route?.params as any)?.category as string | undefined;
  const initialCar = (route?.params as any)?.car as string | undefined;
  const focusCar = Boolean((route?.params as any)?.focusCar);

  const loadParts = async () => {
    try {
      setLoading(true);
      // TODO: Implement actual parts loading from storage
      const mockParts: Part[] = [
        {
          id: '1',
          name: 'Гальмівні колодки',
          category: 'Гальмівна система',
          quantity: 5,
          price: 250,
          location: 'A1-B2',
          compatibleCars: ['VW Golf 6', 'Skoda Octavia A5'],
        },
        {
          id: '2',
          name: 'Масляний фільтр',
          category: 'Фільтри',
          quantity: 12,
          price: 85,
          location: 'C3-D1',
          compatibleCars: ['BMW E46', 'VW Golf 6'],
        },
      ];
      setParts(mockParts);
    } catch (error) {
      logger.error('Помилка завантаження запчастин:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити список запчастин');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadParts();
    setRefreshing(false);
  };

  useEffect(() => {
    loadParts();
  }, []);

  // Ініціалізуємо фільтри з route params (якщо передані)
  useEffect(() => {
    if (initialCategory) {
      // лише для заголовка, фільтрація нижче
    }
    if (initialCar) setCarQuery(initialCar);
  }, [initialCategory, initialCar]);

  const filteredParts = parts.filter((p) => {
    const matchesSearch = searchQuery
      ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesCategory = initialCategory ? p.category === initialCategory : true;
    const matchesCar = carQuery
      ? (p.compatibleCars || []).some((c) => c.toLowerCase().includes(carQuery.toLowerCase()))
      : true;
    return matchesSearch && matchesCategory && matchesCar;
  });

  const renderPartItem = ({ item }: { item: Part }) => (
    <TouchableOpacity
      style={[styles.partItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => navigation.navigate('PartDetails', { partId: item.id })}
    >
      <View style={styles.partHeader}>
        <Text style={[styles.partName, { color: theme.colors.onSurface }]}>
          {item.name}
        </Text>
        <Text style={[styles.partPrice, { color: theme.colors.primary }]}>
          {item.price} ₴
        </Text>
      </View>
      <Text style={[styles.partCategory, { color: theme.colors.onSurfaceVariant }]}>
        {item.category}
      </Text>
      <View style={styles.partFooter}>
        <Text style={[styles.partQuantity, { color: theme.colors.onSurfaceVariant }]}>
          Кількість: {item.quantity}
        </Text>
        {item.location && (
          <Text style={[styles.partLocation, { color: theme.colors.onSurfaceVariant }]}>
            📍 {item.location}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Список запчастин{initialCategory ? ` — ${initialCategory}` : ''}
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('PartForm')}
        >
          <MaterialCommunityIcons
            name="plus"
            size={24}
            color={theme.colors.onPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Поля пошуку */}
      <View style={styles.filtersRow}>
        <TextInput
          style={[styles.input, { borderColor: theme.colors.outline, color: theme.colors.onSurface }]}
          placeholder="Пошук (назва або категорія)"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TextInput
          style={[styles.input, { borderColor: theme.colors.outline, color: theme.colors.onSurface }]}
          placeholder="Авто (наприклад, VW Golf 6)"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={carQuery}
          onChangeText={setCarQuery}
          autoFocus={focusCar}
        />
      </View>

      <SafeFlatList
        data={Array.isArray(filteredParts) ? filteredParts : []}
        renderItem={renderPartItem}
        keyExtractor={(item: Part) => String(item.id)}
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
              name="package-variant"
              size={64}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              Список запчастин порожній
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('PartForm')}
            >
              <Text style={[styles.emptyButtonText, { color: theme.colors.onPrimary }]}>
                Додати першу запчастину
              </Text>
            </TouchableOpacity>
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
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
  },
  partItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  partHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  partName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  partPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  partCategory: {
    fontSize: 14,
    marginBottom: 8,
  },
  partFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partQuantity: {
    fontSize: 14,
  },
  partLocation: {
    fontSize: 14,
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
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PartsListScreen;