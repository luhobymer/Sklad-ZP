import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, RefreshControl } from 'react-native';

import Modal from 'react-native-modal';
import { Part } from '../models/Part';
import FileStorageService from '../services/FileStorageService';
import { colors, spacing } from '../theme/theme';
import Card from './Card';
import Button from './Button';
import QuickActions from './QuickActions';
import AdvancedSearchNew from './AdvancedSearchNew';
import CarSearchView from './CarSearchView';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { PartsListScreenProps } from '../types/navigation';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Logger } from '../utils/logger';
import { Switch } from 'react-native-switch';
import OptimizedImage from './OptimizedImage';

// Створюємо логер для PartsList
const logger = new Logger({ name: 'PartsList' });

/**
 * Компонент списку запчастин з можливістю пошуку та фільтрації
 */

const PartsList: React.FC<PartsListScreenProps> = ({ navigation, route }) => {
  const [parts, setParts] = useState<Part[]>([]);
  const [filteredParts, setFilteredParts] = useState<Part[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showCarSearch, setShowCarSearch] = useState(false);
  const [storageError, setStorageError] = useState<boolean>(false);
  const [simpleMode, setSimpleMode] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(route.params?.filterType || null);

  /**
   * Ефект для ініціалізації сховища при монтуванні компонента
   */
  useEffect(() => {
    // Перевіряємо можливість роботи з файловим сховищем
    const initializeStorage = async (): Promise<void> => {
      try {
        setLoading(true);
        const storageService = FileStorageService.getInstance();
        await storageService.initialize();
        setStorageError(false);
        await loadParts();
      } catch (error) {
        logger.error('Помилка при ініціалізації сховища:', error);
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

  /**
   * Завантажує всі запчастини зі сховища
   */
  const loadParts = async (): Promise<void> => {
    if (storageError) return;
    
    try {
      setLoading(true);
      const storageService = FileStorageService.getInstance();
      const loadedParts = await storageService.getAllParts();
      setParts(loadedParts);
      // Оновлюємо унікальні категорії зі сховища
      if (typeof storageService.getUniqueCategories === 'function') {
        try {
          const uniq = await (storageService as unknown as { getUniqueCategories: () => Promise<string[]> }).getUniqueCategories();
          setCategories(uniq);
        } catch (e) {
          logger.warn('Не вдалося отримати унікальні категорії:', e);
        }
      } else {
        // Fallback: обчислити з поточного списку
        const uniq = Array.from(new Set(loadedParts.map(p => (p.category || '').trim()))).filter(Boolean);
        setCategories(uniq);
      }
      applyFilters(loadedParts, activeFilter, searchQuery);
    } catch (error) {
      logger.error('Помилка при завантаженні запчастин:', error);
      Alert.alert("Помилка", "Не вдалося завантажити запчастини");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Застосовує фільтри до списку запчастин
   * @param partsToFilter Список запчастин для фільтрації
   * @param categoryFilter Категорія для фільтрації
   */
  const applyFilters = (partsToFilter: Part[], categoryFilter: string | null, query: string): void => {
    let result = [...partsToFilter];
    
    // Застосовуємо фільтр за категорією, якщо він вказаний
    if (categoryFilter) {
      logger.info('Застосовуємо фільтр за категорією:', categoryFilter);
      
      // Фільтруємо за точною категорією, а не за частиною тексту
      result = result.filter(part => {
        if (!part.category) return false;
        
        // Нормалізуємо категорію для порівняння
        const normalizedPartCategory = part.category.toLowerCase().trim();
        const normalizedFilterCategory = categoryFilter.toLowerCase().trim();
        
        return normalizedPartCategory === normalizedFilterCategory;
      });
      
      logger.info('Знайдено запчастин за категорією:', result.length);
    }
    
    // Застосовуємо пошуковий запит, якщо він є
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(part => 
        part.name.toLowerCase().includes(q) ||
        part.articleNumber.toLowerCase().includes(q) ||
        part.manufacturer.toLowerCase().includes(q) ||
        (part.description && part.description.toLowerCase().includes(q))
      );
    }
    
    setFilteredParts(result);
  };

  /**
   * Обробник пошуку за текстом
   * @param text Текст для пошуку
   */
  const handleSearch = (text: string): void => {
    setSearchQuery(text);
  };

  /**
   * Фільтрує запчастини за категорією
   * @param category Категорія для фільтрації
   */
  /**
   * Фільтрує запчастини за категорією
   * @param category Категорія для фільтрації
   */
  const handleCategoryFilter = (category: string | null): void => {
    setActiveFilter(category);
  };
  
  /**
   * Обробник результатів розширеного пошуку
   * @param results Результати пошуку (масив запчастин)
   */
  const handleAdvancedSearch = (results: Part[]): void => {
    setParts(results);
  };
  
  /**
   * Обробник знайденої запчастини
   * @param part Знайдена запчастина
   */
  const handlePartFound = (part: Part): void => {
    navigation.navigate('PartDetails', { partId: part.id });
  };
  
  /**
   * Оновлення списку після швидкого додавання
   * @param part Додана запчастина
   */
  const handlePartAdded = (_part?: Part): void => {
    loadParts();
  };

  // Перераховуємо фільтри при будь-якій зміні залежностей
  useEffect(() => {
    applyFilters(parts, activeFilter, searchQuery);
  }, [parts, activeFilter, searchQuery]);

  // Перечитуємо список при фокусі екрана
  useFocusEffect(
    useCallback(() => {
      loadParts();
      // нічого не відписуємось
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return () => {};
    }, [])
  );

  const handleAddPart = (): void => {
    navigation.navigate('PartForm', {});
  };

  // Видалено: логіка відкриття сканера камери та пов'язані виклики навігації

  /**
   * Відкриває історію переглядів
   */
  const handleOpenHistory = (): void => {
    navigation.navigate('ViewHistory');
  };



  const renderSimpleItem = ({ item }: { item: Part }) => (
    <TouchableOpacity
      style={styles.simpleCard}
      onPress={() => navigation.navigate('PartDetails', { partId: item.id })}
    >
      {item.photoPath && (
        <OptimizedImage
          uri={item.photoPath}
          style={styles.simpleCardImage}
          width={50}
          height={50}
          resizeMode="cover"
          optimizationOptions={{
            thumbnailWidth: 100,
            thumbnailHeight: 100,
            quality: 70
          }}
          showPlaceholder={false}
        />
      )}
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
      onPress={() => navigation.navigate('PartDetails', { partId: item.id })}
    >
      <View style={styles.detailedCardContainer}>
        {item.photoPath && (
          <OptimizedImage
            uri={item.photoPath}
            style={styles.detailedCardImage}
            width={80}
            height={80}
            resizeMode="cover"
            optimizationOptions={{
              thumbnailWidth: 160,
              thumbnailHeight: 160,
              quality: 75
            }}
            showPlaceholder={false}
          />
        )}
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
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Компонент швидких дій */}
      <QuickActions 
        onPartFound={handlePartFound}
        onPartAdded={handlePartAdded}
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
          title="Авто"
          onPress={() => setShowCarSearch(true)}
          variant="secondary"
          style={styles.carButton}
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
          {/* Динамічні категорії з локальної БД */}
          {(Array.isArray(categories) ? categories : []).map(category => (
            <TouchableOpacity 
              key={category}
              style={[styles.categoryButton, activeFilter === category && styles.activeCategoryButton]}
              onPress={() => handleCategoryFilter(category)}
            >
              <Text style={[styles.categoryText, activeFilter === category && styles.activeCategoryText]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <ScrollView 
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadParts} />
        }
      >
        {(Array.isArray(filteredParts) ? filteredParts : []).length > 0 ? (
          (Array.isArray(filteredParts) ? filteredParts : []).map((item) => (
            <View key={String(item.id)}>
              {simpleMode ? renderSimpleItem({ item }) : renderDetailedItem({ item })}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? "Завантаження..." : "Запчастини не знайдено"}
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* Модальне вікно розширеного пошуку */}
      <Modal
        isVisible={showAdvancedSearch}
        
        
        onBackdropPress={() => setShowAdvancedSearch(false)}
      >
        <AdvancedSearchNew 
          onSearchResults={handleAdvancedSearch}
          onClose={() => setShowAdvancedSearch(false)}
        />
      </Modal>

      {/* Модальне вікно пошуку по автомобілях */}
      <Modal
        isVisible={showCarSearch}
        onBackdropPress={() => setShowCarSearch(false)}
      >
        <CarSearchView
          isVisible={showCarSearch}
          onPartSelect={(part: Part) => {
            setShowCarSearch(false);
            navigation.navigate('PartDetails', { partId: part.id });
          }}
          onClose={() => setShowCarSearch(false)}
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
  carButton: {
    width: 60
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
  detailedCardContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  detailedCardImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: spacing.md
  },
  partInfo: {
    flex: 1,
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
  simpleCardImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: spacing.sm
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