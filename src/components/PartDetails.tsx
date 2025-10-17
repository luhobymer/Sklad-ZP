import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Modal from 'react-native-modal';
import { Part } from '../models/Part';
import { colors, spacing } from '../theme/theme';
import Button from './Button';
import { useTranslation } from '../hooks/useTranslation';
import { formatPrice, formatQuantity, formatDate } from '../utils/formatters';
import FileStorageService from '../services/FileStorageService';
import AnalogFinder from './AnalogFinder';
import AnalogService from '../services/AnalogService';
import type { PartDetailsScreenProps } from '../types/navigation';
import { Logger } from '../utils/logger';
import OptimizedImage from './OptimizedImage';
import CarCompatibilityView from './CarCompatibilityView';
import AnalogSearchView from './AnalogSearchView';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Створюємо логер для PartDetails
const logger = new Logger({ name: 'PartDetails' });


/**
 * Компонент для відображення детальної інформації про запчастину
 * @param route Параметри маршруту з навігації
 * @param navigation Об'єкт навігації
 */

const PartDetails: React.FC<PartDetailsScreenProps> = ({ route, navigation }) => {
  const { partId } = route.params;
  const [part, setPart] = useState<Part | undefined>(undefined);
  const [analogs, setAnalogs] = useState<Part[] | undefined>(undefined);
  const [showAnalogFinder, setShowAnalogFinder] = useState(false);
  const [showCarCompatibility, setShowCarCompatibility] = useState(false);
  const [showAnalogSearch, setShowAnalogSearch] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    const loadPart = async () => {
      try {
        const storage = FileStorageService.getInstance();
        const loaded = await storage.getPartById(partId);
        if (!loaded) {
          Alert.alert('Не знайдено', 'Запчастину не знайдено', [{ text: 'OK', onPress: () => navigation.goBack() }]);
          return;
        }
        setPart(loaded);
      } catch (e) {
        logger.error('Помилка завантаження запчастини:', e);
        Alert.alert('Помилка', 'Не вдалося завантажити запчастину', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    };
    loadPart();
  }, [partId, navigation]);

  if (!part) return null;

  useEffect(() => {
    // Додаємо запчастину до історії переглядів
    const addToHistory = async () => {
      try {
        const storageService = FileStorageService.getInstance();
        if (storageService) {
          await storageService.addToViewHistory(part.id);
        }
      } catch (error) {
        logger.error('Помилка при додаванні до історії:', error);
      }
    };

    addToHistory();

    // Якщо аналоги не передані, завантажуємо їх
    if (!analogs) {
      loadAnalogs();
    }
  }, [part.id]);

  /**
   * Завантажує аналоги запчастини за артикулом
   */
  const loadAnalogs = async (): Promise<void> => {
    try {
      // Використовуємо AnalogService для пошуку аналогів за артикулом
      const analogService = AnalogService.getInstance();
      const loadedAnalogs = await analogService.findAnalogsByArticle(part.articleNumber);
      setAnalogs(loadedAnalogs);
    } catch (error) {
      logger.error('Помилка при завантаженні аналогів:', error);
    }
  };

  const getCategoryName = (category: string): string => {
    // Перетворюємо назви категорій з української на англійську для правильного відображення
    const categoryMap: Record<string, string> = {
      "двигун": "engine",
      "трансмісія": "transmission",
      "підвіска": "suspension",
      "гальма": "brakes",
      "електрика": "electrical",
      "кузов": "body",
      "салон": "interior",
      "інше": "other",
      "інтер'єр": "interior",
      "освітлення": "electrical"
    };

    // Перевіряємо, чи потрібно перетворити категорію
    const normalizedCategory = category.toLowerCase();
    const mappedCategory = categoryMap[normalizedCategory] || "other";

    // Отримуємо переклад з використанням правильного ключа
    const categoryKey = `categories.${mappedCategory}`;
    const translatedCategory = t(categoryKey);

    // Якщо переклад не знайдено, повертаємо оригінальну категорію
    return translatedCategory || category;
  };

  /**
   * Відкриває форму редагування запчастини
   */
  const handleEdit = (): void => {
    navigation.navigate('PartForm', { partId: part.id });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  /**
   * Видаляє запчастину після підтвердження
   */
  const handleDelete = (): void => {
    Alert.alert(
      'Підтвердження',
      'Ви впевнені, що хочете видалити цю запчастину?',
      [
        { text: 'Скасувати', style: 'cancel' },
        { text: 'Видалити', style: 'destructive', onPress: confirmDelete }
      ]
    );
  };

  /**
   * Підтверджує видалення запчастини та виконує видалення
   */
  const confirmDelete = async (): Promise<void> => {
    try {
      const storageService = FileStorageService.getInstance();
      if (storageService) {
        await storageService.deletePart(part.id);
        navigation.goBack();
      }
    } catch (error) {
      logger.error('Помилка при видаленні запчастини:', error);
    }
  };

  /**
   * Відкриває деталі аналога
   * @param analog Аналог запчастини
   */
  const handleViewAnalog = (analog: Part): void => {
    navigation.navigate('PartDetails', { partId: analog.id });
  };

  /**
   * Відкриває модальне вікно пошуку аналогів
   */
  const handleFindAnalogs = (): void => {
    setShowAnalogFinder(true);
  };

  /**
   * Обробляє знайдені аналоги
   * @param foundAnalogs Знайдені аналоги
   */
  // const handleAnalogFound = (_foundAnalogs: Part[]): void => {
  //   // TODO: обробити знайдені аналоги
  // };

  /**
   * Обробляє вибір аналога запчастини
   * @param analog Вибраний аналог
   */

  
  /**
   * Обробляє вибір аналога запчастини
   * @param analog Вибраний аналог
   */
  const handleAnalogSelect = (analog: Part): void => {
    handleViewAnalog(analog);
    setShowAnalogFinder(false);
  };

  /**
   * Відкриває модальне вікно сумісних автомобілів
   */
  const handleShowCarCompatibility = (): void => {
    setShowCarCompatibility(true);
  };

  /**
   * Відкриває модальне вікно пошуку аналогів на складі
   */
  const handleShowAnalogSearch = (): void => {
    setShowAnalogSearch(true);
  };

  /**
   * Обробляє вибір автомобіля
   * @param carModel Модель автомобіля
   */
  const handleCarSelect = (carModel: string): void => {
    // Переходимо до списку запчастин з фільтром по автомобілю
    navigation.navigate('PartsList', { 
      filterType: 'car',
      carModel: carModel
    });
  };

  /**
   * Обробляє вибір аналога з пошуку
   * @param analog Вибраний аналог
   */
  const handleAnalogFromSearch = (analog: Part): void => {
    navigation.navigate('PartDetails', { partId: analog.id });
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Button
            title={t('common.back')}
            onPress={handleBack}
            variant="secondary"
            size="small"
          />
          <View style={styles.headerButtons}>
            <Button
              title={t('common.edit')}
              onPress={handleEdit}
              variant="primary"
              size="small"
            />
            <Button
              title={t('common.delete')}
              onPress={handleDelete}
              variant="danger"
              size="small"
            />
          </View>
        </View>

        {part.photoPath && (
          <OptimizedImage
            uri={part.photoPath}
            style={styles.photo}
            resizeMode="cover"
            optimizationOptions={{
              width: 1200,
              height: 1200,
              quality: 90,
              thumbnailWidth: 600,
              thumbnailHeight: 600
            }}
            cacheSettings={{
              priority: 'normal',
              cacheControl: 'immutable'
            }}
          />
        )}

        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={styles.label}>{t('part.articleNumber')}:</Text>
            <Text style={styles.value}>{part.articleNumber}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t('part.name')}:</Text>
            <Text style={styles.value}>{part.name}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t('part.manufacturer')}:</Text>
            <Text style={styles.value}>{part.manufacturer}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t('part.category')}:</Text>
            <Text style={styles.value}>{getCategoryName(part.category)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t('part.isNew')}:</Text>
            <Text style={[styles.value, styles.badge, part.isNew ? styles.newBadge : styles.usedBadge]}>
              {part.isNew ? t('part.isNew') : t('part.used')}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t('part.quantity')}:</Text>
            <Text style={styles.value}>{formatQuantity(part.quantity)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t('part.price')}:</Text>
            <Text style={styles.price}>{formatPrice(part.price)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Дата додавання:</Text>
            <Text style={styles.value}>{formatDate(part.createdAt)}</Text>
          </View>

          {part.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('part.description')}</Text>
              <Text style={styles.description}>{part.description}</Text>
            </View>
          )}

          {part.compatibleCars && part.compatibleCars.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('part.compatibleCars')}</Text>
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={handleShowCarCompatibility}
                >
                  <Text style={styles.viewAllText}>Переглянути всі</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
              {part.compatibleCars.slice(0, 3).map((car, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.compatibleCarItem}
                  onPress={() => handleCarSelect(car)}
                >
                  <Text style={styles.compatibleCar}>{car}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
                </TouchableOpacity>
              ))}
              {part.compatibleCars.length > 3 && (
                <Text style={styles.moreItemsText}>
                  +{part.compatibleCars.length - 3} ще...
                </Text>
              )}
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('part.analogs')}</Text>
              <View style={styles.analogButtons}>
                <TouchableOpacity
                  style={styles.findAnalogsButton}
                  onPress={handleShowAnalogSearch}
                >
                  <Text style={styles.findAnalogsText}>На складі</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.findAnalogsButton, styles.secondaryButton]}
                  onPress={handleFindAnalogs}
                >
                  <Text style={[styles.findAnalogsText, styles.secondaryButtonText]}>Всі аналоги</Text>
                </TouchableOpacity>
              </View>
            </View>

            {analogs && analogs.length > 0 ? (
              analogs.map((analog) => (
                <TouchableOpacity
                  key={analog.articleNumber}
                  style={styles.analogItem}
                  onPress={() => handleViewAnalog(analog)}
                >
                  <View style={styles.analogContent}>
                    <View style={styles.analogInfo}>
                      <Text style={styles.analogName}>{analog.name}</Text>
                      <Text style={styles.analogArticle}>Артикул: {analog.articleNumber}</Text>
                      <Text style={styles.analogManufacturer}>Виробник: {analog.manufacturer}</Text>
                    </View>
                    <Text style={styles.analogPrice}>{formatPrice(analog.price)}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noAnalogsText}>Аналогів не знайдено. Натисніть "Знайти аналоги" для пошуку.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        isVisible={showAnalogFinder}
        onBackdropPress={() => setShowAnalogFinder(false)}
      >
        <AnalogFinder
          visible={showAnalogFinder}
          onClose={() => setShowAnalogFinder(false)}
          initialPart={part}
          onSelectAnalog={handleAnalogSelect}
        />
      </Modal>

      {/* Модальне вікно сумісних автомобілів */}
      <CarCompatibilityView
        part={part}
        isVisible={showCarCompatibility}
        onClose={() => setShowCarCompatibility(false)}
        onCarSelect={handleCarSelect}
      />

      {/* Модальне вікно пошуку аналогів на складі */}
      <AnalogSearchView
        part={part}
        isVisible={showAnalogSearch}
        onClose={() => setShowAnalogSearch(false)}
        onAnalogSelect={handleAnalogFromSearch}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  photo: {
    width: '100%',
    height: 300,
    backgroundColor: colors.surface
  },
  content: {
    padding: spacing.md,
    gap: spacing.md
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    fontSize: 16,
    color: colors.textLight,
    flex: 1
  },
  value: {
    fontSize: 16,
    color: colors.text,
    flex: 2,
    textAlign: 'right'
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    flex: 2,
    textAlign: 'right'
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    overflow: 'hidden',
    textAlign: 'center',
    flex: 0
  },
  newBadge: {
    backgroundColor: colors.success,
    color: colors.background
  },
  usedBadge: {
    backgroundColor: colors.secondary,
    color: colors.background
  },
  section: {
    gap: spacing.sm
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
    marginTop: spacing.sm
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24
  },
  compatibleCar: {
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.xs
  },
  analogItem: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: spacing.xs,
    padding: spacing.sm
  },
  analogContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  analogInfo: {
    flex: 1
  },
  analogName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500'
  },
  analogArticle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: spacing.xs
  },
  analogManufacturer: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: spacing.xs
  },
  analogPrice: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: spacing.sm
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  findAnalogsButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 4
  },
  findAnalogsText: {
    color: colors.background,
    fontWeight: '500',
    fontSize: 14
  },
  noAnalogsText: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: spacing.md
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    marginRight: spacing.xs,
  },
  compatibleCarItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  moreItemsText: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  analogButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
  }
});

export default PartDetails;