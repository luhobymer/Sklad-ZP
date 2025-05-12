import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Text, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
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
    sortOrder: 'DESC' as 'ASC' | 'DESC'
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [manufacturers, setManufacturers] = useState<string[]>([]);
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
      
      setCategories(loadedCategories);
      setManufacturers(loadedManufacturers);
    } catch (error) {
      console.error('Помилка при завантаженні фільтрів:', error);
      // Якщо виникла помилка, використовуємо тестові дані
      setCategories(['Двигун', 'Трансмісія', 'Гальма', 'Підвіска', 'Електрика', 'Кузов', 'Інше']);
      setManufacturers(['BOSCH', 'DENSO', 'VALEO', 'FEBI', 'SACHS', 'LEMFORDER', 'BREMBO', 'TRW', 'Інше']);
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
      
      const results = await storageService.searchParts(searchParams);
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
      sortOrder: 'DESC'
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Розширений пошук</Text>
      
      <ScrollView style={styles.scrollContainer}>
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
            >
              <Picker.Item label="Всі виробники" value="" />
              {manufacturers.map((manufacturer, index) => (
                <Picker.Item key={index} label={manufacturer} value={manufacturer} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Ціновий діапазон</Text>
          <View style={styles.priceRangeContainer}>
            <Text>{searchParams.priceRange.min} ₴</Text>
            <Text>{searchParams.priceRange.max} ₴</Text>
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
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Стан</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[styles.radioButton, searchParams.isNew === undefined && styles.radioButtonSelected]}
              onPress={() => handleParamChange('isNew', undefined)}
            >
              <Text style={styles.radioText}>Всі</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.radioButton, searchParams.isNew === true && styles.radioButtonSelected]}
              onPress={() => handleParamChange('isNew', true)}
            >
              <Text style={styles.radioText}>Нові</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.radioButton, searchParams.isNew === false && styles.radioButtonSelected]}
              onPress={() => handleParamChange('isNew', false)}
            >
              <Text style={styles.radioText}>Б/У</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[styles.checkbox, searchParams.inStock && styles.checkboxSelected]}
              onPress={() => handleParamChange('inStock', !searchParams.inStock)}
            />
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
              <Text style={styles.radioText}>За спаданням</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.radioButton, searchParams.sortOrder === 'ASC' && styles.radioButtonSelected]}
              onPress={() => handleParamChange('sortOrder', 'ASC')}
            >
              <Text style={styles.radioText}>За зростанням</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.medium,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.medium,
    textAlign: 'center',
    color: colors.text,
  },
  scrollContainer: {
    flex: 1,
  },
  formGroup: {
    marginBottom: spacing.medium,
  },
  label: {
    fontSize: 16,
    marginBottom: spacing.small / 2,
    color: colors.text,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.small,
    backgroundColor: colors.background,
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
    marginBottom: spacing.small / 2,
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
    padding: spacing.small,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    marginRight: spacing.small,
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
    marginTop: spacing.medium,
  },
  resetButton: {
    flex: 1,
    marginRight: spacing.small / 2,
  },
  searchButton: {
    flex: 1,
    marginHorizontal: spacing.small / 2,
  },
  cancelButton: {
    flex: 1,
    marginLeft: spacing.small / 2,
  },
});

export default AdvancedSearch;