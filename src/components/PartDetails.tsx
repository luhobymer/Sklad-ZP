import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Part } from '../models/Part';
import { colors, spacing } from '../theme/theme';
import Button from './Button';
import { useTranslation } from '../hooks/useTranslation';
import { formatPrice, formatQuantity, formatDate } from '../utils/formatters';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import FileStorageService from '../services/FileStorageService';

type PartDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'PartDetails'>;

const PartDetails: React.FC<PartDetailsScreenProps> = ({ route, navigation }) => {
  const { part: initialPart, analogs: initialAnalogs } = route.params;
  const [part, setPart] = useState<Part>(initialPart);
  const [analogs, setAnalogs] = useState<Part[] | undefined>(initialAnalogs);
  const { t } = useTranslation();
  
  useEffect(() => {
    // Додаємо запчастину до історії переглядів
    const addToHistory = async () => {
      try {
        const storageService = FileStorageService.getInstance();
        if (storageService) {
          await storageService.addToViewHistory(part.id);
        }
      } catch (error) {
        console.error('Помилка при додаванні до історії:', error);
      }
    };
    
    addToHistory();
    
    // Якщо аналоги не передані, завантажуємо їх
    if (!analogs) {
      loadAnalogs();
    }
  }, [part.id]);
  
  const loadAnalogs = async () => {
    try {
      const storageService = FileStorageService.getInstance();
      if (storageService) {
        const loadedAnalogs = await storageService.getAnalogs(part);
        setAnalogs(loadedAnalogs);
      }
    } catch (error) {
      console.error('Помилка при завантаженні аналогів:', error);
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
  
  const handleEdit = () => {
    navigation.navigate('PartForm', { initialPart: part });
  };
  
  const handleBack = () => {
    navigation.goBack();
  };
  
  const handleDelete = async () => {
    try {
      const storageService = FileStorageService.getInstance();
      if (storageService) {
        await storageService.deletePart(part.id);
        navigation.goBack();
      } else {
        Alert.alert('Помилка', 'Сховище недоступне');
      }
    } catch (error) {
      console.error('Помилка при видаленні запчастини:', error);
      Alert.alert('Помилка', 'Не вдалося видалити запчастину');
    }
  };
  
  const handleViewAnalog = (analogId: number) => {
    const analog = analogs?.find(a => a.id === analogId);
    if (analog) {
      // Перенаправляємо на деталі цього аналога
      navigation.push('PartDetails', { part: analog });
    }
  };
  
  return (
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
        <Image
          source={{ uri: part.photoPath }}
          style={styles.photo}
          resizeMode="cover"
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
            <Text style={styles.sectionTitle}>{t('part.compatibleCars')}</Text>
            {part.compatibleCars.map((car, index) => (
              <Text key={index} style={styles.compatibleCar}>{car}</Text>
            ))}
          </View>
        )}

        {analogs && analogs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('part.analogs')}</Text>
            {analogs.map((analog) => (
              <TouchableOpacity
                key={analog.id}
                style={styles.analogItem}
                onPress={() => handleViewAnalog(analog.id)}
              >
                <View style={styles.analogContent}>
                  <View style={styles.analogInfo}>
                    <Text style={styles.analogName}>{analog.name}</Text>
                    <Text style={styles.analogManufacturer}>{analog.manufacturer}</Text>
                  </View>
                  <Text style={styles.analogPrice}>{formatPrice(analog.price)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
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
  }
});

export default PartDetails;