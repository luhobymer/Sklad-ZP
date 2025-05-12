import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TextInput, Text, TouchableOpacity, Alert, Switch, Modal, ScrollView } from 'react-native';
import { Part } from '../models/Part';
import FileStorageService from '../services/FileStorageService';
import { colors, spacing } from '../theme/theme';
import Card from './Card';
import Button from './Button';
import QuickActions from './QuickActions';
import AdvancedSearchNew from './AdvancedSearchNew';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';

type PartsListScreenProps = NativeStackScreenProps<RootStackParamList, 'PartsList'>;

const PartsList: React.FC<PartsListScreenProps> = ({ navigation, route }) => {
  const [parts, setParts] = useState<Part[]>([]);
  const [filteredParts, setFilteredParts] = useState<Part[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [storageError, setStorageError] = useState<boolean>(false);
  const [simpleMode, setSimpleMode] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(route.params?.filter || null);

  useEffect(() => {
    // Перевіряємо можливість роботи з файловим сховищем
    const initializeStorage = async () => {
      try {
        setLoading(true);
        const storageService = FileStorageService.getInstance();
        await storageService.initialize();
        setStorageError(false);
        await loadParts();
      } catch (error) {
        console.error('Помилка при ініціалізації сховища:', error);
        setStorageError(true);
        Alert.alert(
          "Помилка сховища",
          "Не вдалося ініціалізувати сховище даних. Деякі функції будуть недоступні.",
          [{ text: "OK" }]
        );
      } finally {
        setLoading(false);
      }
    };
    
    initializeStorage();
  }, []);

  const loadParts = async () => {
    if (storageError) return;
    
    try {
      setLoading(true);
      const storageService = FileStorageService.getInstance();
      const loadedParts = await storageService.getAllParts();
      setParts(loadedParts);
      applyFilters(loadedParts, activeFilter);
    } catch (error) {
      console.error('Помилка при завантаженні запчастин:', error);
      Alert.alert("Помилка", "Не вдалося завантажити запчастини");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (partsToFilter: Part[], categoryFilter: string | null) => {
    let result = [...partsToFilter];
    
    // Застосовуємо фільтр за категорією, якщо він вказаний
    if (categoryFilter) {
      console.log('Застосовуємо фільтр за категорією:', categoryFilter);
      
      // Фільтруємо за точною категорією, а не за частиною тексту
      result = result.filter(part => {
        if (!part.category) return false;
        
        // Нормалізуємо категорію для порівняння
        const normalizedPartCategory = part.category.toLowerCase().trim();
        const normalizedFilterCategory = categoryFilter.toLowerCase().trim();
        
        return normalizedPartCategory === normalizedFilterCategory;
      });
      
      console.log('Знайдено запчастин за категорією:', result.length);
    }
    
    // Застосовуємо пошуковий запит, якщо він є
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(part => 
        part.name.toLowerCase().includes(query) ||
        part.articleNumber.toLowerCase().includes(query) ||
        part.manufacturer.toLowerCase().includes(query) ||
        (part.description && part.description.toLowerCase().includes(query))
      );
    }
    
    setFilteredParts(result);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(parts, activeFilter);
  };

  const handleCategoryFilter = (category: string | null) => {
    setActiveFilter(category);
    applyFilters(parts, category);
  };
  
  // Обробка результатів розширеного пошуку
  const handleAdvancedSearchResults = (results: Part[]) => {
    setParts(results);
    applyFilters(results, activeFilter);
  };
  
  // Обробка знайденої запчастини через швидкий пошук
  const handlePartSelect = (part: Part) => {
    navigation.navigate('PartDetails', { part });
  };
  
  // Оновлення списку після швидкого додавання
  const handlePartAdded = () => {
    loadParts();
  };

  const handleAddPart = () => {
    navigation.navigate('PartForm', {});
  };

  const handleOpenScanner = () => {
    navigation.navigate('CameraScanner', {
      onTextRecognized: (text: string, partInfo?: Partial<Part>) => {
        // Обробка розпізнаного тексту після повернення з CameraScanner
        console.log('Розпізнаний текст в PartsList:', text);
        console.log('Отримана інформація про запчастину:', partInfo);
        
        // Якщо отримано артикул, шукаємо за ним
        if (text) {
          handleSearch(text);
        }
        
        // Якщо отримано повну інформацію про запчастину, можна додати додаткову логіку
        if (partInfo && partInfo.manufacturer) {
          // Наприклад, можна шукати за виробником або категорією
          // handleSearch(partInfo.manufacturer);
        }
      }
    });
  };

  const handleOpenHistory = () => {
    navigation.navigate('ViewHistory');
  };

  const renderSimpleItem = ({ item }: { item: Part }) => (
    <TouchableOpacity
      style={styles.simpleCard}
      onPress={() => navigation.navigate('PartDetails', { part: item })}
    >
      <View style={styles.simpleCardContent}>
        <Text style={styles.simpleArticleNumber}>{item.articleNumber}</Text>
        <Text style={styles.simpleName} numberOfLines={1}>{item.name}</Text>
      </View>
      <View style={styles.simpleCardRight}>
        <Text style={styles.simpleQuantity}>{item.quantity} шт.</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      </View>
    </TouchableOpacity>
  );

  const renderDetailedItem = ({ item }: { item: Part }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('PartDetails', { part: item })}
    >
      <View style={styles.partInfo}>
        <View style={styles.header}>
          <Text style={styles.articleNumber}>{item.articleNumber}</Text>
          {item.isNew && <Text style={styles.newBadge}>Нова</Text>}
        </View>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.manufacturer}>{item.manufacturer}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>{item.price} ₴</Text>
          <Text style={styles.quantity}>Кількість: {item.quantity}</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Компонент швидких дій */}
      <QuickActions 
        onPartFound={handlePartSelect}
        onPartAdded={handlePartAdded}
        onOpenScanner={handleOpenScanner}
        onOpenHistory={handleOpenHistory}
      />
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Пошук запчастин..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <Button
          title="Фільтри"
          onPress={() => setShowAdvancedSearch(true)}
          variant="secondary"
          style={styles.filterButton}
        />
        <Button
          title="Додати"
          onPress={handleAddPart}
          variant="primary"
          style={styles.addButton}
        />
      </View>
      
      {/* Перемикач режиму відображення */}
      <View style={styles.viewModeContainer}>
        <Text style={styles.viewModeText}>Спрощений режим</Text>
        <Switch
          value={simpleMode}
          onValueChange={setSimpleMode}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.background}
        />
      </View>
      
      {/* Швидкі фільтри за категоріями */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[styles.categoryButton, activeFilter === null && styles.activeCategoryButton]}
            onPress={() => handleCategoryFilter(null)}
          >
            <Text style={[styles.categoryText, activeFilter === null && styles.activeCategoryText]}>Всі</Text>
          </TouchableOpacity>
          {/* Використовуємо список категорій з перекладів */}
          {['двигун', 'гальма', 'підвіска', 'електрика', 'кузов', 'трансмісія', 'інтер\'єр', 'інше'].map(category => {
            // Отримуємо назву категорії з правильним відмінком для відображення
            const displayName = (() => {
              switch(category) {
                case 'двигун': return 'Двигун';
                case 'гальма': return 'Гальма';
                case 'підвіска': return 'Підвіска';
                case 'електрика': return 'Електрика';
                case 'кузов': return 'Кузов';
                case 'трансмісія': return 'Трансмісія';
                case 'інтер\'єр': return 'Інтер\'єр';
                case 'інше': return 'Інше';
                default: return category;
              }
            })();
            
            return (
              <TouchableOpacity 
                key={category}
                style={[styles.categoryButton, activeFilter === category && styles.activeCategoryButton]}
                onPress={() => handleCategoryFilter(category)}
              >
                <Text style={[styles.categoryText, activeFilter === category && styles.activeCategoryText]}>{displayName}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      
      <FlatList
        data={filteredParts}
        renderItem={simpleMode ? renderSimpleItem : renderDetailedItem}
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={loadParts}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? "Завантаження..." : "Запчастини не знайдено"}
            </Text>
          </View>
        }
      />
      
      {/* Модальне вікно розширеного пошуку */}
      <Modal
        visible={showAdvancedSearch}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAdvancedSearch(false)}
      >
        <AdvancedSearchNew 
          onSearchResults={handleAdvancedSearchResults}
          onClose={() => setShowAdvancedSearch(false)}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  searchContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface
  },
  filterButton: {
    width: 80
  },
  addButton: {
    width: 80
  },
  viewModeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm
  },
  viewModeText: {
    marginRight: spacing.sm,
    fontSize: 14,
    color: colors.text
  },
  categoriesContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md
  },
  categoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border
  },
  activeCategoryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  categoryText: {
    color: colors.text,
    fontWeight: '500'
  },
  activeCategoryText: {
    color: colors.background,
    fontWeight: 'bold'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    marginTop: spacing.md * 2
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center'
  },
  list: {
    padding: spacing.md
  },
  // Стилі для детального режиму
  card: {
    marginBottom: spacing.md
  },
  partInfo: {
    gap: spacing.xs
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  articleNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary
  },
  newBadge: {
    backgroundColor: colors.success,
    color: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    fontSize: 12
  },
  name: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text
  },
  manufacturer: {
    fontSize: 14,
    color: colors.textLight
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary
  },
  quantity: {
    fontSize: 14,
    color: colors.textLight
  },
  // Стилі для спрощеного режиму
  simpleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary
  },
  simpleCardContent: {
    flex: 1
  },
  simpleArticleNumber: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 2
  },
  simpleName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text
  },
  simpleCardRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  simpleQuantity: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: spacing.sm
  }
});

export default PartsList;