import React, { useState, useCallback } from 'react';
import { View, TextInput, StyleSheet, Text, Alert, ScrollView } from 'react-native';
import Modal from 'react-native-modal';

import { colors, spacing } from '../theme/theme';
import { Part } from '../models/Part';
import FileStorageService from '../services/FileStorageService';

import Button from './Button';
import { Logger } from '../utils/logger';

// Створюємо логер для QuickActions
const logger = new Logger({ context: 'QuickActions' } as any);

// Камерна функціональність видалена

type QuickAddField = 'articleNumber' | 'name' | 'price' | 'quantity' | 'manufacturer' | 'category';

interface QuickAddData {
  articleNumber: string;
  name: string;
  price: string;
  quantity: number;
  manufacturer: string;
  category: string;
  isNew: boolean;
  description: string;
  photoPath: string;
  compatibleCars: string[];
}

interface QuickActionsProps {
  onPartFound: (part: Part) => void;
  onPartAdded: () => void;
  onOpenHistory?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onPartFound, onPartAdded, onOpenHistory }) => {
  const [searchArticle, setSearchArticle] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quickAddData, setQuickAddData] = useState<QuickAddData>({
    articleNumber: '',
    name: '',
    price: '',
    quantity: 1,
    manufacturer: '',
    category: '',
    isNew: true,
    description: '',
    photoPath: '',
    compatibleCars: [],
  });
  
  const resetQuickAddForm = useCallback(() => {
    setQuickAddData({
      articleNumber: '',
      name: '',
      price: '',
      quantity: 1,
      manufacturer: '',
      category: '',
      isNew: true,
      description: '',
      photoPath: '',
      compatibleCars: [],
    });
  }, []);

  const storageService = FileStorageService.getInstance();
  // Видалено: текстове розпізнавання через камеру

  // Швидкий пошук за артикулом
  const handleQuickSearch = async () => {
    if (!searchArticle.trim()) {
      Alert.alert('Помилка', 'Введіть артикул для пошуку');
      return;
    }

    try {
      setLoading(true);
      const part = await storageService.findByArticle(searchArticle.trim());
      
      if (part) {
        onPartFound(part);
      } else {
        Alert.alert(
          'Запчастину не знайдено', 
          'Бажаєте додати нову запчастину з цим артикулом?',
          [
            { text: 'Ні', style: 'cancel' },
            { 
              text: 'Так', 
              onPress: () => {
                setQuickAddData(prev => ({ ...prev, articleNumber: searchArticle.trim() }));
                setShowQuickAdd(true);
              }
            }
          ]
        );
      }
    } catch (error) {
      logger.error('Помилка при швидкому пошуку:', error);
      Alert.alert('Помилка', 'Не вдалося виконати пошук');
    } finally {
      setLoading(false);
    }
  };

  // Видалено: обробка результатів з камери та встановлення полів із result.part

  // Швидке додавання запчастини
  const handleQuickAdd = async () => {
    try {
      setLoading(true);
      
      // Валідація обов'язкових полів
      if (!quickAddData.articleNumber.trim()) {
        Alert.alert('Помилка', 'Артикул є обов\'язковим');
        return;
      }
      
      if (!quickAddData.name.trim()) {
        Alert.alert('Помилка', 'Назва є обов\'язковою');
        return;
      }
      
      const price = parseFloat(quickAddData.price);
      if (isNaN(price) || price <= 0) {
        Alert.alert('Помилка', 'Ціна має бути додатним числом');
        return;
      }
      
      const quantity = Number(quickAddData.quantity) || 0;
      if (isNaN(quantity) || quantity < 0) {
        Alert.alert('Помилка', 'Кількість має бути невід\'ємним числом');
        return;
      }
      
      // Додавання запчастини
      const newPart = {
        articleNumber: quickAddData.articleNumber,
        name: quickAddData.name,
        price: Number(quickAddData.price),
        quantity: Number(quickAddData.quantity),
        manufacturer: quickAddData.manufacturer,
        category: quickAddData.category,
        isNew: true,
        description: null,
        photoPath: null,
        compatibleCars: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await storageService.addPart(newPart);
      
      Alert.alert('Успіх', 'Запчастину успішно додано');
      resetQuickAddForm();
      onPartAdded();
    } catch (error) {
      logger.error('Помилка при швидкому додаванні:', error);
      Alert.alert('Помилка', 'Не вдалося додати запчастину');
    } finally {
      setLoading(false);
    }
  };

  // Обробка зміни полів форми швидкого додавання
  const handleQuickAddChange = (field: keyof QuickAddData, value: string | number | boolean | string[]) => {
    setQuickAddData(prev => {
      // Обробляємо спеціальні випадки для кожного типу даних
      switch (field) {
        case 'quantity':
          return {
            ...prev,
            quantity: typeof value === 'number' ? value : parseInt(String(value), 10) || 0
          };
          
        case 'price':
          return {
            ...prev,
            price: typeof value === 'string' ? value.replace(/[^0-9.]/g, '') : String(value)
          };
          
        case 'isNew':
          return {
            ...prev,
            isNew: value === true
          };
          
        case 'compatibleCars':
          return {
            ...prev,
            compatibleCars: Array.isArray(value) ? value : []
          };
          
        case 'articleNumber':
        case 'name':
        case 'manufacturer':
        case 'category':
        case 'description':
        case 'photoPath':
          return {
            ...prev,
            [field]: String(value)
          };
          
        default:
          return prev;
      }
    });
  };

  
  const handleSavePart = async () => {
    try {
      if (!quickAddData.articleNumber || !quickAddData.name) {
        Alert.alert('Помилка', 'Будь ласка, заповніть обов\'язкові поля');
        return;
      }

      // Створюємо нову запчастину з правильно типізованими даними
      const newPart: Omit<Part, 'id'> = {
        // Обов'язкові поля
        articleNumber: quickAddData.articleNumber,
        name: quickAddData.name,
        price: typeof quickAddData.price === 'string' 
          ? parseFloat(quickAddData.price) || 0 
          : quickAddData.price,
        quantity: typeof quickAddData.quantity === 'string' 
          ? parseInt(quickAddData.quantity, 10) || 0 
          : quickAddData.quantity,
        manufacturer: quickAddData.manufacturer || '',
        category: quickAddData.category || '',
        // Додаткові поля зі значеннями за замовчуванням
        isNew: quickAddData.isNew ?? true,
        description: quickAddData.description || '',
        photoPath: quickAddData.photoPath || '',
        compatibleCars: Array.isArray(quickAddData.compatibleCars) 
          ? quickAddData.compatibleCars 
          : [],
        // Службові поля
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await storageService.addPart(newPart);
      setShowQuickAdd(false);
      onPartAdded();
      Alert.alert('Успішно', 'Запчастину успішно додано');
    } catch (error) {
      logger.error('Помилка при збереженні запчастини:', error);
      Alert.alert('Помилка', 'Не вдалося зберегти запчастину');
    }
  };
  
  // Видалено: модалка камери та пов'язана логіка
  
  const renderQuickAddModal = () => (
    <Modal
      isVisible={showQuickAdd}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      onBackdropPress={() => setShowQuickAdd(false)}
      style={styles.modal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Швидке додавання запчастини</Text>
          
          <ScrollView>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Артикул *</Text>
              <TextInput
                style={styles.input}
                value={quickAddData.articleNumber}
                onChangeText={(value: string) => handleQuickAddChange('articleNumber', value)}
                placeholder="Введіть артикул"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Назва *</Text>
              <TextInput
                style={styles.input}
                value={quickAddData.name}
                onChangeText={(value: string) => handleQuickAddChange('name', value)}
                placeholder="Введіть назву"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ціна</Text>
              <TextInput
                style={styles.input}
                value={quickAddData.price}
                onChangeText={(value: string) => handleQuickAddChange('price', value)}
                keyboardType="numeric"
                placeholder="Введіть ціну"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Кількість</Text>
              <TextInput
                style={styles.input}
                value={quickAddData.quantity.toString()}
                onChangeText={(value: string) => handleQuickAddChange('quantity', value)}
                keyboardType="numeric"
                placeholder="Введіть кількість"
                placeholderTextColor="#999"
              />
            </View>


            <View style={styles.inputGroup}>
              <Text style={styles.label}>Виробник</Text>
              <TextInput
                style={styles.input}
                value={quickAddData.manufacturer}
                onChangeText={(value: string) => handleQuickAddChange('manufacturer', value)}
                placeholder="Введіть виробника"
                placeholderTextColor="#999"
              />
            </View>


            <View style={styles.inputGroup}>
              <Text style={styles.label}>Категорія</Text>
              <TextInput
                style={styles.input}
                value={quickAddData.category}
                onChangeText={(value: string) => handleQuickAddChange('category', value)}
                placeholder="Введіть категорію"
                placeholderTextColor="#999"
              />
            </View>
          </ScrollView>

          <View style={styles.modalButtons}>
            <Button
              title="Скасувати"
              onPress={() => setShowQuickAdd(false)}
              variant="secondary"
              style={styles.cancelButton}
            />
            <Button
              title="Зберегти"
              onPress={handleSavePart}
              disabled={!quickAddData.articleNumber || !quickAddData.name}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Введіть артикул для швидкого пошуку"
          value={searchArticle}
          onChangeText={setSearchArticle}
        />
        <Button
          title="Пошук"
          onPress={handleQuickSearch}
          variant="primary"
          style={styles.searchButton}
          loading={loading}
        />
      </View>

      <View style={styles.actionsContainer}>
        <Button
          title="Історія"
          onPress={() => onOpenHistory && onOpenHistory()}
          variant="secondary"
          style={styles.actionButton}
        />
        <Button
          title="Швидке додавання"
          onPress={() => setShowQuickAdd(true)}
          variant="primary"
          style={styles.actionButton}
        />
      </View>

      {renderQuickAddModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.medium,
  },
  captureButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.small,
    alignItems: 'center',
    marginVertical: spacing.small,
  },
  searchButton: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    padding: spacing.small,
    alignItems: 'center',
    marginVertical: spacing.small,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.small,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: spacing.small,
  },
  searchInput: {
    flex: 1,
    marginRight: spacing.small,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.small,
    backgroundColor: colors.background,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.small,
  },
  button: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.medium,
    marginHorizontal: spacing.medium,
  },
  modalContent: {
    marginVertical: spacing.small,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.small,
    color: colors.text,
  },
  inputGroup: {
    marginBottom: spacing.small,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.small,
    marginBottom: spacing.small,
    backgroundColor: colors.background,
  },
  label: {
    marginBottom: 4,
    color: colors.text,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.small,
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: spacing.small,
    borderRadius: 8,
    flex: 1,
    marginRight: spacing.xs,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.error,
    padding: spacing.small,
    borderRadius: 8,
    flex: 1,
    marginLeft: spacing.xs,
    alignItems: 'center',
  },
});

export default QuickActions;