import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Part } from '../models/Part';
import { colors } from '../theme/theme';
import FileStorageService from '../services/FileStorageService';
import PartCard from './PartCard';
import SafeFlatList from './common/SafeFlatList';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BackupManager from './BackupManager';
import type { DashboardScreenProps } from '../types/navigation';
import { Logger } from '../utils/logger';
import { useFocusEffect } from '@react-navigation/native';

// Створюємо логер для Dashboard
const logger = new Logger({ name: 'Dashboard' });


/**
 * Головний екран додатка з доступом до основних функцій
 */
const Dashboard: React.FC<DashboardScreenProps> = ({ navigation }) => {
  
  const [lowStockParts, setLowStockParts] = useState<Part[]>([]);
  const [recentParts, setRecentParts] = useState<Part[]>([]);
  const [showBackupManager, setShowBackupManager] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const storageService = FileStorageService.getInstance();

  useEffect(() => {
    // Завантажуємо дані при першому рендері
    loadData();
  }, []);

  // Оновлюємо дані щоразу, коли екран отримує фокус (повернення з форм/деталей)
  useFocusEffect(
    React.useCallback(() => {
      logger.info('Dashboard отримав фокус, оновлюємо дані');
      loadData();
    }, [])
  );

  /**
   * Завантажує дані для відображення на дашборді
   */
  const [autoSeeded, setAutoSeeded] = useState(false);

  const loadData = async (): Promise<void> => {
    try {
      // Отримуємо всі запчастини
      const allParts = await storageService.getAllParts();
      
      // Запчастини, які закінчуються (менше 3 штук)
      const lowStock = allParts.filter(part => part.quantity < 3);
      setLowStockParts(lowStock);
      
      // Останні додані запчастини (до 5 штук)
      const recent = [...allParts]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setRecentParts(recent);

      // Динамічні категорії
      const uniqueCats = await storageService.getUniqueCategories();
      setCategories(uniqueCats);

      // DEBUG-блок вимкнено

      // Авто-сідинг (одноразово за сесію) якщо дуже мало даних
      if (!autoSeeded) {
        const hasSeed = allParts.some(p => String(p.articleNumber).startsWith('TEST-SEED-'));
        if (!hasSeed && allParts.length < 2) {
          await handleSeedTestData();
          setAutoSeeded(true);
        }
      }
    } catch (error) {
      logger.error('Помилка при завантаженні даних для дашборду:', error);
    }
  };

  const handleSeedTestData = async (): Promise<void> => {
    try {
      const all = await storageService.getAllParts();
      // Щоб уникнути дублікатів, перевіримо за articleNumber
      const existingArticles = new Set(all.map(p => p.articleNumber));
      const samples = [
        {
          articleNumber: 'TEST-SEED-01',
          name: 'Масляний фільтр',
          manufacturer: 'Bosch',
          category: 'Фільтри',
          isNew: true,
          quantity: 5,
          price: 250,
          description: 'Тестовий масляний фільтр',
          photoPath: null as string | null,
          compatibleCars: ['VW Golf', 'Skoda Octavia'],
        },
        {
          articleNumber: 'TEST-SEED-02',
          name: 'Гальмівні колодки',
          manufacturer: 'TRW',
          category: 'Гальма',
          isNew: true,
          quantity: 2,
          price: 980,
          description: 'Тестові колодки передні',
          photoPath: null as string | null,
          compatibleCars: ['Ford Focus'],
        },
        {
          articleNumber: 'TEST-SEED-03',
          name: 'Повітряний фільтр',
          manufacturer: 'MANN',
          category: 'Фільтри',
          isNew: true,
          quantity: 10,
          price: 320,
          description: 'Тестовий повітряний фільтр',
          photoPath: null as string | null,
          compatibleCars: ['Toyota Corolla'],
        },
      ];

      let added = 0;
      for (const s of samples) {
        if (!existingArticles.has(s.articleNumber)) {
          await storageService.addPart(s as any);
          added += 1;
        }
      }
      if (added > 0) {
        logger.info(`Seeded ${added} parts for dashboard testing.`);
        await loadData();
        Alert.alert('Готово', `Додано ${added} тестових запчастин.`);
      } else {
        Alert.alert('Інформація', 'Тестові запчастини вже існують.');
      }
    } catch (e) {
      logger.error('Помилка під час seed даних:', e);
      Alert.alert('Помилка', 'Не вдалося додати тестові запчастини.');
    }
  };

  // handleForceReload видалено (не використовується)

  /**
   * Рендерить кнопку швидкого доступу з іконкою та підписом
   * @param icon Назва іконки з бібліотеки Ionicons
   * @param label Текст підпису кнопки
   * @param onPress Функція обробки натискання
   * @param color Колір фону іконки (за замовчуванням - основний колір теми)
   */
  const renderQuickAccessButton = (
    icon: string, 
    label: string, 
    onPress: () => void,
    color: string = colors.primary
  ) => (
    <TouchableOpacity style={styles.quickAccessButton} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={24} color="white" />
      </View>
      <Text style={styles.quickAccessLabel}>{label}</Text>
    </TouchableOpacity>
  );

  /**
   * Обробник успішного створення резервної копії
   */
  const handleBackupCreated = (): void => {
    Alert.alert('Успіх', 'Резервну копію успішно створено');
  };

  /**
   * Обробник успішного відновлення даних з резервної копії
   */
  const handleBackupRestored = (): void => {
    Alert.alert('Успіх', 'Дані успішно відновлено');
    loadData(); // Оновлюємо дані після відновлення
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Склад Автозапчастин</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('GoogleDrive')}
            style={[styles.iconButton, { marginRight: 10 }]}
          >
            <Ionicons name="cloud-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setShowBackupManager(true)}
            style={styles.iconButton}
          >
            <Ionicons name="cloud-upload" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Швидкий доступ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Швидкий доступ</Text>
        <View style={styles.quickAccessContainer}>
          {renderQuickAccessButton('add-circle-outline', 'Додати запчастину', 
            () => navigation.navigate('PartForm'))}
          {renderQuickAccessButton('search-outline', 'Пошук', 
            () => navigation.navigate('PartsList'))}
          {/* Кнопку сканування видалено */}
          {renderQuickAccessButton('list-outline', 'Всі запчастини', 
            () => navigation.navigate('PartsList'))}
          {renderQuickAccessButton('save-outline', 'Резервне копіювання', 
            () => setShowBackupManager(true),
            colors.success)}
        </View>
      </View>

      {/* Запчастини з низьким залишком (реальні дані) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Малий залишок</Text>
        {lowStockParts.length > 0 ? (
          <SafeFlatList<Part>
            data={Array.isArray(lowStockParts) ? lowStockParts : []}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.lowStockItem}
                onPress={() => navigation.navigate('PartDetails', { partId: item.id })}
              >
                <View style={styles.lowStockInfo}>
                  <Text style={styles.lowStockName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.lowStockArticle}>{item.articleNumber} • {item.manufacturer}</Text>
                </View>
                <View style={styles.quantityContainer}>
                  <Text style={styles.quantityText}>×{item.quantity}</Text>
                </View>
              </TouchableOpacity>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.lowStockList}
          />
        ) : (
          <Text style={styles.emptyText}>Немає позицій з малим залишком</Text>
        )}
      </View>

      {/* Останні додані (реальні дані) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Останні додані</Text>
        {recentParts.length > 0 ? (
          <SafeFlatList<Part>
            data={Array.isArray(recentParts) ? recentParts : []}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.recentPartCard}
                onPress={() => navigation.navigate('PartDetails', { partId: item.id })}
              >
                <PartCard 
                  part={item} 
                  onPress={() => navigation.navigate('PartDetails', { partId: item.id })}
                />
              </TouchableOpacity>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentPartsList}
          />
        ) : (
          <Text style={styles.emptyText}>Немає доданих запчастин</Text>
        )}
      </View>

      {/* Швидкі фільтри (динамічні категорії) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Швидкі фільтри</Text>
        {categories.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
            {categories.map((category) => (
              <TouchableOpacity 
                key={category} 
                style={styles.filterButton}
                onPress={() => navigation.navigate('PartsList', { category })}
              >
                <Text style={styles.filterText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptyText}>Категорій поки немає</Text>
        )}
      </View>

      {/* DEBUG: приховано у продакшн/стабільній збірці */}

      {/* Менеджер резервних копій */}
      <BackupManager
        visible={showBackupManager}
        onClose={() => setShowBackupManager(false)}
        onBackupCreated={handleBackupCreated}
        onBackupRestored={handleBackupRestored}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  section: {
    marginBottom: 20,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.text,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAccessButton: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickAccessLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: colors.text,
  },
  lowStockList: {
    paddingRight: 15,
  },
  lowStockItem: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    width: 180,
    height: 100,
    justifyContent: 'space-between',
  },
  lowStockInfo: {
    flex: 1,
  },
  lowStockName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  lowStockArticle: {
    fontSize: 12,
    color: colors.textLight,
  },
  quantityContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  quantityText: {
    color: 'red',
    fontWeight: 'bold',
  },
  recentPartsList: {
    paddingRight: 15,
  },
  recentPartCard: {
    marginRight: 10,
    width: 200,
  },
  emptyText: {
    color: colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 15,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  filterButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterText: {
    color: colors.text,
    fontWeight: '500',
  },
});

export default Dashboard;
