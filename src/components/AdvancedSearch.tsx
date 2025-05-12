import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Text, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { Part } from '../models/Part';
import FileStorageService from '../services/FileStorageService';
import { colors, spacing } from '../theme/theme';
import Button from './Button';

interface AdvancedSearchProps {
  onSearchResults: (parts: Part[]) => void;
  onClose: () => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearchResults, onClose }) => {
  const [searchParams, setSearchParams] = useState({
    query: '',
    category: '',
    manufacturer: '',
    priceRange: { min: 0, max: 10000 },
    isNew: undefined as boolean | undefined,
    inStock: false,
    sortBy: 'updatedAt' as 'price' | 'name' | 'updatedAt' | 'quantity',
    sortOrder: 'DESC' as 'ASC' | 'DESC',
    carModel: ''
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  const [carModels, setCarModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFilters();
  }, []);

  // Завантаження списків категорій та виробників для фільтрів
  const loadFilters = async () => {
    try {
      setLoading(true);
      const storageService = FileStorageService.getInstance();
      
      // Перевіряємо чи ініціалізовано сховище
      if (!storageService) {
        throw new Error('Сховище не ініціалізовано');
      }
      
      // Використовуємо методи сховища для отримання унікальних категорій та виробників
      const loadedCategories = await storageService.getUniqueCategories();
      const loadedManufacturers = await storageService.getUniqueManufacturers();
      const loadedParts = await storageService.getAllParts();
      
      // Отримуємо унікальні моделі автомобілів
      const uniqueCarModels = new Set<string>();
      loadedParts.forEach(part => {
        if (part.compatibleCars && part.compatibleCars.length > 0) {
          part.compatibleCars.forEach(car => uniqueCarModels.add(car.trim()));
        }
      });
      
      // Переконуємося, що категорії відображаються правильно
      const formattedCategories = loadedCategories.map(category => {
        return category;
      });
      
      setCategories(['', ...formattedCategories]);
      setManufacturers(['', ...loadedManufacturers]);
      setCarModels(['', ...Array.from(uniqueCarModels).sort()]);
    } catch (error) {
      console.error('Помилка при завантаженні фільтрів:', error);
      // Тестові дані для розробки
      setCategories(['', 'Двигун', 'Трансмісія', 'Підвіска', 'Гальма', 'Електрика']);
      setManufacturers(['', 'Bosch', 'Valeo', 'Denso', 'Continental', 'ZF']);
      setCarModels(['', 'Volkswagen Golf', 'Audi A3', 'BMW 3', 'Mercedes C-Class']);
    } finally {
      setLoading(false);
    }
  };

  // Оновлення параметрів пошуку
  const handleParamChange = (param: string, value: any) => {
    setSearchParams(prev => ({
      ...prev,
      [param]: value
    }));
  };

  // Виконання пошуку з розширеними параметрами
  const handleSearch = async () => {
    try {
      setLoading(true);
      const storageService = FileStorageService.getInstance();
      
      if (!storageService) {
        Alert.alert('Помилка', 'Сховище недоступне');
        return;
      }
      
      // Підготовка параметрів пошуку
      const searchParamsToUse = {...searchParams};
      
      // Перетворюємо категорію на нижній регістр для пошуку
      if (searchParamsToUse.category) {
        searchParamsToUse.category = searchParamsToUse.category.toLowerCase();
        console.log('Категорія для пошуку:', searchParamsToUse.category);
      }
      
      const results = await storageService.searchParts(searchParamsToUse);
      console.log('Знайдено результатів:', results.length);
      onSearchResults(results);
      onClose();
    } catch (error) {
      console.error('Помилка при розширеному пошуку:', error);
      Alert.alert('Помилка пошуку', 'Не вдалося виконати пошук. Спробуйте пізніше.');
    } finally {
      setLoading(false);
    }
  };

  // Скидання всіх фільтрів
  const handleReset = () => {
    setSearchParams({
      query: '',
      category: '',
      manufacturer: '',
      priceRange: { min: 0, max: 10000 },
      isNew: undefined,
      inStock: false,
      sortBy: 'updatedAt',
      sortOrder: 'DESC',
      carModel: ''
    });
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Розширений пошук</Text>
        
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Пошуковий запит</Text>
            <TextInput
              style={styles.input}
              value={searchParams.query}
              onChangeText={(value) => handleParamChange('query', value)}
              placeholder="Введіть артикул, назву або інше"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Категорія</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={searchParams.category}
                onValueChange={(value) => handleParamChange('category', value)}
                style={styles.picker}
                mode="dropdown"
              >
                <Picker.Item label="Всі категорії" value="" />
                {categories.map((category, index) => (
                  <Picker.Item key={index} label={category} value={category} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Виробник</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={searchParams.manufacturer}
                onValueChange={(value) => handleParamChange('manufacturer', value)}
                style={styles.picker}
                mode="dropdown"
              >
                <Picker.Item label="Всі виробники" value="" />
                {manufacturers.map((manufacturer, index) => (
                  <Picker.Item key={index} label={manufacturer} value={manufacturer} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Ціновий діапазон: {searchParams.priceRange.min} - {searchParams.priceRange.max} ₴</Text>
            <View style={styles.priceRangeContainer}>
              <Text>0 ₴</Text>
              <Text>10000 ₴</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={10000}
              step={100}
              value={searchParams.priceRange.max}
              onValueChange={(value) => handleParamChange('priceRange', { ...searchParams.priceRange, max: value })}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Стан</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[styles.radioButton, searchParams.isNew === undefined && styles.radioButtonSelected]}
                onPress={() => handleParamChange('isNew', undefined)}
              >
                <Text style={[styles.radioText, searchParams.isNew === undefined && styles.radioTextSelected]}>Всі</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.radioButton, searchParams.isNew === true && styles.radioButtonSelected]}
                onPress={() => handleParamChange('isNew', true)}
              >
                <Text style={[styles.radioText, searchParams.isNew === true && styles.radioTextSelected]}>Нові</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.radioButton, searchParams.isNew === false && styles.radioButtonSelected]}
                onPress={() => handleParamChange('isNew', false)}
              >
                <Text style={[styles.radioText, searchParams.isNew === false && styles.radioTextSelected]}>Б/У</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[styles.checkbox, searchParams.inStock && styles.checkboxSelected]}
                onPress={() => handleParamChange('inStock', !searchParams.inStock)}
              >
                {searchParams.inStock && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>Тільки в наявності</Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Сортувати за</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={searchParams.sortBy}
                onValueChange={(value) => handleParamChange('sortBy', value)}
                style={styles.picker}
                mode="dropdown"
              >
                <Picker.Item label="Датою оновлення" value="updatedAt" />
                <Picker.Item label="Ціною" value="price" />
                <Picker.Item label="Назвою" value="name" />
                <Picker.Item label="Кількістю" value="quantity" />
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Порядок сортування</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[styles.radioButton, searchParams.sortOrder === 'DESC' && styles.radioButtonSelected]}
                onPress={() => handleParamChange('sortOrder', 'DESC')}
              >
                <Text style={[styles.radioText, searchParams.sortOrder === 'DESC' && styles.radioTextSelected]}>За спаданням</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.radioButton, searchParams.sortOrder === 'ASC' && styles.radioButtonSelected]}
                onPress={() => handleParamChange('sortOrder', 'ASC')}
              >
                <Text style={[styles.radioText, searchParams.sortOrder === 'ASC' && styles.radioTextSelected]}>За зростанням</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            title="Скинути"
            onPress={handleReset}
            variant="secondary"
            style={styles.resetButton}
          />
          <Button
            title="Пошук"
            onPress={handleSearch}
            variant="primary"
            style={styles.searchButton}
            loading={loading}
          />
          <Button
            title="Скасувати"
            onPress={onClose}
            variant="danger"
            style={styles.cancelButton}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: spacing.md,
  },
  container: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 10,
    width: '100%',
    maxHeight: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textAlign: 'center',
    color: colors.text,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 16,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background,
    width: '100%',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 40,
    width: '100%',
  },
  priceRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioButton: {
    flex: 1,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  radioButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  radioText: {
    color: colors.text,
  },
  radioTextSelected: {
    color: colors.background,
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  resetButton: {
    flex: 1,
    marginRight: spacing.xs,
  },
  searchButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  cancelButton: {
    flex: 1,
    marginLeft: spacing.xs,
  },
});

export default AdvancedSearch;