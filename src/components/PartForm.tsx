import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, TextInput, StyleSheet, Text, Alert, SafeAreaView, KeyboardAvoidingView, Platform, TouchableOpacity, Switch } from 'react-native';
import { Part, createPart, validatePart, isPartValid, PartValidation } from '../models/Part';
import { CameraService } from '../services/CameraService';
import FileStorageService from '../services/FileStorageService';
import { colors, spacing } from '../theme/theme';
import Button from './Button';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';

type PartFormScreenProps = NativeStackScreenProps<RootStackParamList, 'PartForm'>;

const PartForm: React.FC<PartFormScreenProps> = ({ route, navigation }) => {
  const { initialPart } = route.params || { initialPart: null };
  const [formData, setFormData] = useState<Partial<Part>>(initialPart || {
    articleNumber: '',
    name: '',
    manufacturer: '',
    category: '',
    isNew: true,
    quantity: 0,
    price: 0,
    description: null,
    photoPath: null,
    compatibleCars: null
  });

  const [validation, setValidation] = useState<PartValidation | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const cameraService = CameraService.getInstance();

  const handleChange = (field: keyof Part, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    const validationResult = validatePart(formData);
    setValidation(validationResult);

    if (isPartValid(validationResult)) {
      try {
        setLoading(true);
        const storageService = FileStorageService.getInstance();
        
        if (!storageService) {
          Alert.alert('Помилка', 'Сховище недоступне');
          return;
        }
        
        // Якщо це редагування існуючої запчастини
        if (initialPart?.id) {
          const updatedPart = {
            ...formData,
            id: initialPart.id,
            createdAt: initialPart.createdAt,
            updatedAt: new Date()
          } as Part;
          
          await storageService.updatePart(updatedPart);
          Alert.alert('Успіх', 'Запчастину успішно оновлено');
        } else {
          // Якщо це створення нової запчастини
          const partData = createPart(formData as Omit<Part, 'id' | 'createdAt' | 'updatedAt'>);
          await storageService.addPart(partData as Part);
          Alert.alert('Успіх', 'Запчастину успішно додано');
        }
        
        navigation.goBack();
      } catch (error) {
        console.error('Помилка при збереженні запчастини:', error);
        Alert.alert('Помилка', 'Не вдалося зберегти запчастину');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleTakePicture = async () => {
    try {
      const hasPermission = await cameraService.requestPermissions();
      if (hasPermission) {
        // Замість відображення камери в цьому компоненті, переходимо на екран CameraScanner
        navigation.navigate('CameraScanner', {
          onTextRecognized: (text: string, partInfo?: Partial<Part>) => {
            console.log('Отримано дані з розпізнавання:', text, partInfo);
            
            // Якщо отримано всю інформацію про запчастину
            if (partInfo) {
              // Заповнюємо всі поля форми
              if (partInfo.articleNumber) handleChange('articleNumber', partInfo.articleNumber);
              if (partInfo.name) handleChange('name', partInfo.name);
              if (partInfo.manufacturer) handleChange('manufacturer', partInfo.manufacturer);
              if (partInfo.price) handleChange('price', partInfo.price.toString());
              if (partInfo.category) handleChange('category', partInfo.category);
              
              // Автоматично встановлюємо сумісність з автомобілями на основі розпізнаного тексту
              if (partInfo.name) {
                // Спробуємо визначити сумісні автомобілі з назви запчастини
                const carBrands = ['Volkswagen', 'VW', 'Audi', 'Skoda', 'BMW', 'Mercedes', 'Toyota', 'Honda', 'Mazda', 'Ford', 'Opel', 'Renault', 'Peugeot', 'Citroen', 'Fiat', 'Hyundai', 'Kia'];
                const carModels = {
                  'Volkswagen': ['Golf', 'Passat', 'Polo', 'Tiguan', 'Touareg', 'Jetta'],
                  'VW': ['Golf', 'Passat', 'Polo', 'Tiguan', 'Touareg', 'Jetta'],
                  'Audi': ['A3', 'A4', 'A6', 'Q5', 'Q7', 'TT'],
                  'Skoda': ['Octavia', 'Fabia', 'Superb', 'Kodiaq', 'Karoq'],
                  'BMW': ['3', '5', '7', 'X3', 'X5', 'X6'],
                  'Mercedes': ['C', 'E', 'S', 'GLC', 'GLE', 'GLS'],
                  'Toyota': ['Corolla', 'Camry', 'RAV4', 'Land Cruiser', 'Yaris'],
                  'Honda': ['Civic', 'Accord', 'CR-V', 'HR-V', 'Jazz'],
                  'Mazda': ['3', '6', 'CX-5', 'CX-30', 'MX-5'],
                  'Ford': ['Focus', 'Fiesta', 'Mondeo', 'Kuga', 'Mustang'],
                  'Opel': ['Astra', 'Corsa', 'Insignia', 'Mokka', 'Grandland'],
                  'Renault': ['Clio', 'Megane', 'Captur', 'Kadjar', 'Scenic'],
                  'Peugeot': ['208', '308', '3008', '5008', '508'],
                  'Citroen': ['C3', 'C4', 'C5', 'Berlingo', 'Picasso'],
                  'Fiat': ['500', 'Panda', 'Tipo', 'Punto', 'Doblo'],
                  'Hyundai': ['i30', 'Tucson', 'Santa Fe', 'Kona', 'i20'],
                  'Kia': ['Ceed', 'Sportage', 'Sorento', 'Rio', 'Stonic']
                };
                
                const compatibleCars: string[] = [];
                const nameText = partInfo.name.toLowerCase() + ' ' + (partInfo.description || '').toLowerCase();
                
                // Шукаємо марки автомобілів в тексті
                carBrands.forEach(brand => {
                  if (nameText.includes(brand.toLowerCase())) {
                    // Якщо знайдено марку, шукаємо моделі
                    const models = carModels[brand] || [];
                    let modelFound = false;
                    
                    models.forEach(model => {
                      if (nameText.includes(model.toLowerCase())) {
                        compatibleCars.push(`${brand} ${model}`);
                        modelFound = true;
                      }
                    });
                    
                    // Якщо модель не знайдено, додаємо просто марку
                    if (!modelFound) {
                      compatibleCars.push(brand);
                    }
                  }
                });
                
                // Якщо знайдено сумісні автомобілі, встановлюємо їх
                if (compatibleCars.length > 0) {
                  handleChange('compatibleCars', compatibleCars);
                }
              }
            } else {
              // Якщо отримано тільки артикул
              handleChange('articleNumber', text);
            }
          }
        });
      } else {
        Alert.alert('Помилка', 'Немає дозволу на використання камери');
      }
    } catch (error) {
      console.error('Помилка при отриманні дозволів камери:', error);
      Alert.alert('Помилка', 'Не вдалося отримати доступ до камери');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Артикул</Text>
              <View style={styles.articleNumberContainer}>
                <TextInput
                  style={[styles.input, styles.articleNumberInput]}
                  value={formData.articleNumber}
                  onChangeText={(value) => handleChange('articleNumber', value)}
                  placeholder="Введіть артикул"
                />
                <TouchableOpacity onPress={handleTakePicture} style={styles.scanButton}>
                  <Ionicons name="camera-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
              {validation?.articleNumber.message && (
                <Text style={styles.error}>{validation.articleNumber.message}</Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Назва</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) => handleChange('name', value)}
                placeholder="Введіть назву"
              />
              {validation?.name.message && (
                <Text style={styles.error}>{validation.name.message}</Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Виробник</Text>
              <TextInput
                style={styles.input}
                value={formData.manufacturer}
                onChangeText={(value) => handleChange('manufacturer', value)}
                placeholder="Введіть виробника"
              />
              {validation?.manufacturer.message && (
                <Text style={styles.error}>{validation.manufacturer.message}</Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Категорія</Text>
              <TextInput
                style={styles.input}
                value={formData.category}
                onChangeText={(value) => handleChange('category', value)}
                placeholder="Введіть категорію"
              />
              {validation?.category.message && (
                <Text style={styles.error}>{validation.category.message}</Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Кількість</Text>
              <TextInput
                style={styles.input}
                value={formData.quantity?.toString()}
                onChangeText={(value) => handleChange('quantity', parseInt(value) || 0)}
                keyboardType="numeric"
                placeholder="Введіть кількість"
              />
              {validation?.quantity.message && (
                <Text style={styles.error}>{validation.quantity.message}</Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Ціна</Text>
              <TextInput
                style={styles.input}
                value={formData.price?.toString()}
                onChangeText={(value) => handleChange('price', parseFloat(value) || 0)}
                keyboardType="numeric"
                placeholder="Введіть ціну"
              />
              {validation?.price.message && (
                <Text style={styles.error}>{validation.price.message}</Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Стан запчастини</Text>
              <View style={styles.radioContainer}>
                <TouchableOpacity 
                  style={[styles.radioButton, formData.isNew ? styles.radioButtonSelected : {}]}
                  onPress={() => handleChange('isNew', true)}
                >
                  <Text style={formData.isNew ? styles.radioTextSelected : styles.radioText}>Нова</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.radioButton, !formData.isNew ? styles.radioButtonSelected : {}]}
                  onPress={() => handleChange('isNew', false)}
                >
                  <Text style={!formData.isNew ? styles.radioTextSelected : styles.radioText}>Б/У</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Сумісність з автомобілями</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={(formData.compatibleCars || []).join(', ')}
                onChangeText={(value) => {
                  const cars = value.split(',').map(car => car.trim()).filter(car => car !== '');
                  handleChange('compatibleCars', cars.length > 0 ? cars : null);
                }}
                placeholder="Введіть марки та моделі автомобілів через кому (наприклад: Volkswagen Golf, Audi A3)"
                multiline
                numberOfLines={3}
              />
              <Text style={styles.hint}>Введіть марки та моделі автомобілів через кому</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Опис</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description || ''}
                onChangeText={(value) => handleChange('description', value)}
                placeholder="Введіть опис"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.buttons}>
              <Button
                title="Зберегти"
                onPress={handleSubmit}
                variant="primary"
                loading={loading}
              />
              <Button
                title="Скасувати"
                onPress={handleCancel}
                variant="secondary"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100 // Додатковий відступ знизу
  },
  form: {
    padding: spacing.md,
    gap: spacing.md
  },
  field: {
    gap: spacing.xs,
    marginBottom: spacing.sm
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.sm
  },
  articleNumberContainer: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  articleNumberInput: {
    flex: 1
  },
  scanButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8
  },
  error: {
    color: colors.error,
    fontSize: 12
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.xl
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.xs
  },
  radioButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center'
  },
  radioButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  radioText: {
    color: colors.text
  },
  radioTextSelected: {
    color: colors.background,
    fontWeight: 'bold'
  },
  hint: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: spacing.xs
  }
});

export default PartForm;
