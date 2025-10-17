import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import FileStorageService from '../services/FileStorageService';
import { Part } from '../models/Part';
import { useTheme } from '../theme/ThemeContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Logger } from '../utils/logger';

const logger = new Logger({ prefix: 'PartDetailsScreen' });

type PartDetails = Part;

const PartDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  // Підтримуємо обидва варіанти: { partId } або (зворотна сумісність) { part }
  const params: any = route?.params ?? {};
  const initialPartId: string | null = params?.partId ?? (params?.part?.id ?? null);
  const [part, setPart] = useState<PartDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPartDetails = async () => {
    try {
      setLoading(true);
      if (initialPartId) {
        const service = FileStorageService.getInstance();
        const numericId = Number(initialPartId);
        const loaded = await service.getPartById(numericId);
        if (loaded) {
          setPart(loaded as PartDetails);
        } else {
          logger.warn('Запчастину не знайдено за id:', initialPartId);
          Alert.alert('Не знайдено', 'Запчастину не знайдено');
        }
      } else if (params?.part) {
        // Зворотна сумісність: якщо все ж передали цілий об'єкт
        setPart(params.part as PartDetails);
      } else {
        // Немає параметрів — повідомляємо користувача
        logger.warn('PartDetailsScreen відкрито без параметрів part або partId');
        Alert.alert('Помилка', 'Не передано запчастину для перегляду');
      }
    } catch (error) {
      logger.error('Помилка завантаження деталей запчастини:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити дані запчастини');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (part) {
      navigation.navigate('PartForm', { partId: part.id });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Видалити запчастину',
      'Ви впевнені, що хочете видалити цю запчастину?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement actual part deletion
              logger.info('Видалення запчастини:', part?.id ?? initialPartId);
              navigation.goBack();
              Alert.alert('Успіх', 'Запчастину видалено');
            } catch (error) {
              logger.error('Помилка видалення запчастини:', error);
              Alert.alert('Помилка', 'Не вдалося видалити запчастину');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadPartDetails();
  }, [initialPartId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
          Завантаження...
        </Text>
      </View>
    );
  }

  if (!part) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={64}
          color={theme.colors.error}
        />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Запчастину не знайдено
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.buttonText, { color: theme.colors.onPrimary }]}>
            Повернутися
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with image */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          {part.photoPath ? (
            <Image source={{ uri: part.photoPath }} style={styles.image} />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
              <MaterialCommunityIcons
                name="package-variant"
                size={64}
                color={theme.colors.onSurfaceVariant}
              />
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={[styles.partName, { color: theme.colors.onSurface }]}>
              {part.name}
            </Text>
            <Text style={[styles.partCategory, { color: theme.colors.onSurfaceVariant }]}>
              {part.category}
            </Text>
            <Text style={[styles.partPrice, { color: theme.colors.primary }]}>
              {part.price} ₴
            </Text>
          </View>
        </View>

        {/* Details */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Деталі
          </Text>
          
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="cube" size={20} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
              Кількість:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
              {part.quantity}
            </Text>
          </View>

          {/* Додаткові поля (barcode/supplier/location) не присутні в моделі Part за замовчуванням */}
        </View>

        {/* Description */}
        {part.description && (
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Опис
            </Text>
            <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
              {part.description}
            </Text>
          </View>
        )}

        {/* Timestamps */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Інформація
          </Text>
          <Text style={[styles.timestamp, { color: theme.colors.onSurfaceVariant }]}>
            Створено: {new Date(part.createdAt as any).toLocaleDateString('uk-UA')}
          </Text>
          <Text style={[styles.timestamp, { color: theme.colors.onSurfaceVariant }]}>
            Оновлено: {new Date(part.updatedAt as any).toLocaleDateString('uk-UA')}
          </Text>
        </View>
      </ScrollView>

      {/* Action buttons */}
      <View style={[styles.actionButtons, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleEdit}
        >
          <MaterialCommunityIcons name="pencil" size={20} color={theme.colors.onPrimary} />
          <Text style={[styles.actionButtonText, { color: theme.colors.onPrimary }]}>
            Редагувати
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
          onPress={handleDelete}
        >
          <MaterialCommunityIcons name="delete" size={20} color={theme.colors.onError} />
          <Text style={[styles.actionButtonText, { color: theme.colors.onError }]}>
            Видалити
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  partName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  partCategory: {
    fontSize: 14,
    marginBottom: 8,
  },
  partPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    marginLeft: 8,
    marginRight: 8,
    fontSize: 14,
    minWidth: 100,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    marginBottom: 4,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PartDetailsScreen;