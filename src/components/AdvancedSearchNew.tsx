import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Modal,
  Alert,
  SafeAreaView
} from 'react-native';
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

const AdvancedSearchNew: React.FC<AdvancedSearchProps> = ({ onSearchResults, onClose }) => {
  const [filters, setFilters] = useState({
    query: '',
    category: '',
    manufacturer: '',
    minPrice: 0,
    maxPrice: 10000,
    onlyAvailable: false,
    isNew: null as boolean | null,
    carModel: ''
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  const [carModels, setCarModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      setLoading(true);
      const storageService = FileStorageService.getInstance();
      
      if (!storageService) {
        throw new Error('Сховище не ініціалізовано');
      }
      
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
      
      setCategories(['', ...loadedCategories]);
      setManufacturers(['', ...loadedManufacturers]);
      setCarModels(['', ...Array.from(uniqueCarModels).sort()]);
      
      // Встановлюємо максимальну ціну на основі найдорожчої запчастини
      const maxPrice = Math.max(...loadedParts.map(part => part.price), 10000);
      setPriceRange({ min: 0, max: maxPrice });
      setFilters(prev => ({ ...prev, maxPrice }));
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

  const handleSearch = async () => {
    try {
      setLoading(true);
      const storageService = FileStorageService.getInstance();
      
      if (!storageService) {
        Alert.alert('Помилка', 'Сховище недоступне');
        return;
      }
      
      const allParts = await storageService.getAllParts();
      
      const filteredParts = allParts.filter(part => {
        // Фільтр за пошуковим запитом
        if (filters.query && !(
          part.name.toLowerCase().includes(filters.query.toLowerCase()) ||
          part.articleNumber.toLowerCase().includes(filters.query.toLowerCase()) ||
          (part.description && part.description.toLowerCase().includes(filters.query.toLowerCase()))
        )) {
          return false;
        }

        // Фільтр за категорією
        if (filters.category && part.category !== filters.category) {
          return false;
        }

        // Фільтр за виробником
        if (filters.manufacturer && part.manufacturer !== filters.manufacturer) {
          return false;
        }

        // Фільтр за ціною
        if (part.price < filters.minPrice || part.price > filters.maxPrice) {
          return false;
        }

        // Фільтр за наявністю
        if (filters.onlyAvailable && part.quantity <= 0) {
          return false;
        }

        // Фільтр за станом (нова/б.у.)
        if (filters.isNew !== null && part.isNew !== filters.isNew) {
          return false;
        }

        // Фільтр за моделлю автомобіля
        if (filters.carModel && (!part.compatibleCars || 
            !part.compatibleCars.some(car => 
              car.toLowerCase().includes(filters.carModel.toLowerCase())
            )
          )) {
          return false;
        }

        return true;
      });
      
      onSearchResults(filteredParts);
      onClose();
    } catch (error) {
      console.error('Помилка при пошуку запчастин:', error);
      Alert.alert('Помилка', 'Не вдалося виконати пошук');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      query: '',
      category: '',
      manufacturer: '',
      minPrice: 0,
      maxPrice: priceRange.max,
      onlyAvailable: false,
      isNew: null,
      carModel: ''
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.modalContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Розширений пошук</Text>
          
          <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
            {/* Пошуковий запит */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Пошуковий запит</Text>
              <TextInput
                style={styles.input}
                value={filters.query}
                onChangeText={(value) => setFilters(prev => ({ ...prev, query: value }))}
                placeholder="Введіть текст для пошуку"
              />
            </View>
            
            {/* Категорія */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Категорія</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.category}
                  style={styles.picker}
                  onValueChange={(itemValue) => setFilters(prev => ({ ...prev, category: itemValue }))}
                >
                  {categories.map((category, index) => (
                    <Picker.Item key={index} label={category || 'Всі категорії'} value={category} />
                  ))}
                </Picker>
              </View>
            </View>
            
            {/* Виробник */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Виробник</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.manufacturer}
                  style={styles.picker}
                  onValueChange={(itemValue) => setFilters(prev => ({ ...prev, manufacturer: itemValue }))}
                >
                  {manufacturers.map((manufacturer, index) => (
                    <Picker.Item key={index} label={manufacturer || 'Всі виробники'} value={manufacturer} />
                  ))}
                </Picker>
              </View>
            </View>
            
            {/* Ціновий діапазон */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Ціновий діапазон</Text>
              <View style={styles.priceRangeContainer}>
                <Text>{filters.minPrice} грн</Text>
                <Text>{filters.maxPrice} грн</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={priceRange.min}
                maximumValue={priceRange.max}
                value={filters.minPrice}
                onValueChange={(value) => setFilters(prev => ({ ...prev, minPrice: Math.round(value) }))}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
              />
              <Slider
                style={styles.slider}
                minimumValue={priceRange.min}
                maximumValue={priceRange.max}
                value={filters.maxPrice}
                onValueChange={(value) => setFilters(prev => ({ ...prev, maxPrice: Math.round(value) }))}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
              />
            </View>
            
            {/* Тільки в наявності */}
            <View style={styles.formGroup}>
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={[styles.checkbox, filters.onlyAvailable && styles.checkboxSelected]}
                  onPress={() => setFilters(prev => ({ ...prev, onlyAvailable: !prev.onlyAvailable }))}
                >
                  {filters.onlyAvailable && (
                    <Ionicons name="checkmark" size={16} color={colors.background} />
                  )}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Тільки в наявності</Text>
              </View>
            </View>
            
            {/* Стан запчастини (нова/б.у.) */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Стан</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity 
                  style={[styles.radioButton, filters.isNew === null && styles.radioButtonSelected]}
                  onPress={() => setFilters(prev => ({ ...prev, isNew: null }))}
                >
                  <Text style={[styles.radioText, filters.isNew === null && styles.radioTextSelected]}>Всі</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.radioButton, filters.isNew === true && styles.radioButtonSelected]}
                  onPress={() => setFilters(prev => ({ ...prev, isNew: true }))}
                >
                  <Text style={[styles.radioText, filters.isNew === true && styles.radioTextSelected]}>Нові</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.radioButton, filters.isNew === false && styles.radioButtonSelected]}
                  onPress={() => setFilters(prev => ({ ...prev, isNew: false }))}
                >
                  <Text style={[styles.radioText, filters.isNew === false && styles.radioTextSelected]}>Б/У</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Модель автомобіля */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Модель автомобіля</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.carModel}
                  style={styles.picker}
                  onValueChange={(itemValue) => setFilters(prev => ({ ...prev, carModel: itemValue }))}
                >
                  {carModels.map((model, index) => (
                    <Picker.Item key={index} label={model || 'Всі автомобілі'} value={model} />
                  ))}
                </Picker>
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
              title="Закрити"
              onPress={onClose}
              variant="danger"
              style={styles.cancelButton}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
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
    marginTop: spacing.md,
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

export default AdvancedSearchNew;
