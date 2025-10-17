import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../theme/ThemeContext';
import { Logger } from '../utils/logger';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const logger = new Logger({ prefix: 'PartFormScreen' });

interface PartFormData {
  name: string;
  category: string;
  quantity: string;
  price: string;
  location: string;
  description: string;
  supplier: string;
  barcode: string;
}

const categories = [
  'Двигун',
  'Гальмівна система',
  'Підвіска',
  'Електрика',
  'Фільтри',
  'Масла та рідини',
  'Кузов',
  'Інше',
];

const PartFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const partId = route.params?.partId;
  const isEditing = !!partId;

  const [formData, setFormData] = useState<PartFormData>({
    name: '',
    category: categories[0],
    quantity: '',
    price: '',
    location: '',
    description: '',
    supplier: '',
    barcode: '',
  });

  const [loading, setLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const loadPartData = async () => {
    if (!partId) return;

    try {
      setLoading(true);
      // TODO: Implement actual part loading from storage
      const mockPart = {
        name: 'Гальмівні колодки',
        category: 'Гальмівна система',
        quantity: '5',
        price: '250',
        location: 'A1-B2',
        description: 'Високоякісні гальмівні колодки для легкових автомобілів.',
        supplier: 'AutoParts Ltd.',
        barcode: '1234567890123',
      };
      setFormData(mockPart);
    } catch (error) {
      logger.error('Помилка завантаження даних запчастини:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити дані запчастини');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Помилка', 'Введіть назву запчастини');
      return false;
    }
    if (!formData.quantity.trim() || isNaN(Number(formData.quantity))) {
      Alert.alert('Помилка', 'Введіть правильну кількість');
      return false;
    }
    if (!formData.price.trim() || isNaN(Number(formData.price))) {
      Alert.alert('Помилка', 'Введіть правильну ціну');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      // TODO: Implement actual part saving to storage
      const partData = {
        ...formData,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
        id: partId || Date.now().toString(),
        createdAt: isEditing ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      logger.info(isEditing ? 'Оновлення запчастини:' : 'Створення запчастини:', partData);
      
      Alert.alert(
        'Успіх',
        isEditing ? 'Запчастину оновлено' : 'Запчастину додано',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      logger.error('Помилка збереження запчастини:', error);
      Alert.alert('Помилка', 'Не вдалося зберегти запчастину');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof PartFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (isEditing) {
      loadPartData();
    }
  }, [partId]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {isEditing ? 'Редагувати запчастину' : 'Додати запчастину'}
          </Text>
        </View>

        <View style={[styles.form, { backgroundColor: theme.colors.surface }]}>
          {/* Name */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>Назва *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.onSurface,
                borderColor: theme.colors.outline,
              }]}
              value={formData.name}
              onChangeText={(value: string) => updateField('name', value)}
              placeholder="Введіть назву запчастини"
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />
          </View>

          {/* Category */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>Категорія</Text>
            <TouchableOpacity
              style={[styles.picker, { 
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.outline,
              }]}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <Text style={[styles.pickerText, { color: theme.colors.onSurface }]}>
                {formData.category}
              </Text>
              <MaterialCommunityIcons
                name={showCategoryPicker ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>
            
            {showCategoryPicker && (
              <View style={[styles.categoryList, { backgroundColor: theme.colors.background }]}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[styles.categoryItem, {
                      backgroundColor: formData.category === category 
                        ? theme.colors.primaryContainer 
                        : 'transparent'
                    }]}
                    onPress={() => {
                      updateField('category', category);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text style={[styles.categoryText, { 
                      color: formData.category === category 
                        ? theme.colors.onPrimaryContainer 
                        : theme.colors.onSurface
                    }]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Quantity and Price */}
          <View style={styles.row}>
            <View style={[styles.fieldContainer, styles.halfWidth]}>
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>Кількість *</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.onSurface,
                  borderColor: theme.colors.outline,
                }]}
                value={formData.quantity}
                onChangeText={(value: string) => updateField('quantity', value)}
                placeholder="0"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                keyboardType="numeric"
              />
            </View>
            
            <View style={[styles.fieldContainer, styles.halfWidth]}>
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>Ціна (₴) *</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.onSurface,
                  borderColor: theme.colors.outline,
                }]}
                value={formData.price}
                onChangeText={(value: string) => updateField('price', value)}
                placeholder="0.00"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Location */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>Розташування</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.onSurface,
                borderColor: theme.colors.outline,
              }]}
              value={formData.location}
              onChangeText={(value: string) => updateField('location', value)}
              placeholder="Наприклад: A1-B2"
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />
          </View>

          {/* Supplier */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>Постачальник</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.onSurface,
                borderColor: theme.colors.outline,
              }]}
              value={formData.supplier}
              onChangeText={(value: string) => updateField('supplier', value)}
              placeholder="Назва постачальника"
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />
          </View>

          {/* Barcode (без сканування) */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>Штрих-код</Text>
            <View style={styles.barcodeContainer}>
              <TextInput
                style={[styles.input, styles.barcodeInput, { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.onSurface,
                  borderColor: theme.colors.outline,
                }]}
                value={formData.barcode}
                onChangeText={(value: string) => updateField('barcode', value)}
                placeholder="Штрих-код або артикул"
                placeholderTextColor={theme.colors.onSurfaceVariant}
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>Опис</Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.onSurface,
                borderColor: theme.colors.outline,
              }]}
              value={formData.description}
              onChangeText={(value: string) => updateField('description', value)}
              placeholder="Додатковий опис запчастини"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      {/* Action buttons */}
      <View style={[styles.actionButtons, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: theme.colors.outline }]}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={[styles.cancelButtonText, { color: theme.colors.onSurface }]}>
            Скасувати
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.saveButton, { 
            backgroundColor: loading ? theme.colors.surfaceVariant : theme.colors.primary 
          }]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={[styles.saveButtonText, { 
            color: loading ? theme.colors.onSurfaceVariant : theme.colors.onPrimary 
          }]}>
            {loading ? 'Збереження...' : (isEditing ? 'Оновити' : 'Зберегти')}
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
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  form: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  pickerText: {
    fontSize: 16,
  },
  categoryList: {
    marginTop: 8,
    borderRadius: 8,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  categoryText: {
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  barcodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barcodeInput: {
    flex: 1,
    marginRight: 8,
  },
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PartFormScreen;