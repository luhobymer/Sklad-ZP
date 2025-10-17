import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, TextInput, StyleSheet, Text, Alert, SafeAreaView, Platform, TouchableOpacity } from 'react-native';
import { Part, createPart, validatePart, isPartValid, PartValidation } from '../models/Part';
import FileStorageService from '../services/FileStorageService';
import { colors, spacing } from '../theme/theme';
import Button from './Button';
import { PartFormScreenProps } from '../types/navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Logger } from '../utils/logger';
import * as ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import OptimizedImage from './OptimizedImage';
import imageOptimizationService from '../services/ImageOptimizationService';

// Створюємо логер для PartForm
const logger = new Logger({ prefix: 'PartForm' });


// Використовуємо тип з файлу navigation.ts

const PartForm: React.FC<PartFormScreenProps> = ({ route, navigation }) => {
  const params: any = route?.params ?? {};
  const initialPartId: number | null = params?.partId ? Number(params.partId) : (params?.part?.id ?? null);
  const [formData, setFormData] = useState<Partial<Part>>({
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
  const [newCompatibleCar, setNewCompatibleCar] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState<boolean>(Boolean(initialPartId));

  /**
   * Обробник зміни значення поля форми
   * @param field Ключ поля запчастини
   * @param value Нове значення поля
   */
  const handleChange = <K extends keyof Part>(field: K, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Завантаження існуючої запчастини за partId (якщо редагування)
   */
  useEffect(() => {
    const loadPart = async () => {
      if (!initialPartId) return;
      try {
        setLoading(true);
        const storage = FileStorageService;
        const existing = await storage.getPartById(initialPartId);
        if (existing) {
          setFormData(existing);
          setIsEditing(true);
        } else {
          Alert.alert('Не знайдено', 'Запчастину не знайдено');
          setIsEditing(false);
        }
      } catch (e) {
        logger.error('Помилка завантаження запчастини для редагування:', e);
        Alert.alert('Помилка', 'Не вдалося завантажити запчастину');
      } finally {
        setLoading(false);
      }
    };
    loadPart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPartId]);

  /**
   * Рендерить поле форми з валідацією
   * @param label Назва поля
   * @param field Ключ поля в об'єкті запчастини
   * @param placeholder Текст підказки
   * @param keyboardType Тип клавіатури
   * @param multiline Чи є поле багаторядковим
   */
  const renderField = (
    label: string, 
    field: keyof Part, 
    placeholder: string, 
    keyboardType: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad' = 'default', 
    multiline = false
  ) => {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={[
            styles.input, 
            multiline && styles.multilineInput, 
            validation && 
            validation[field as keyof PartValidation] && 
            !validation[field as keyof PartValidation]?.isValid && 
            styles.inputError
          ]}
          value={formData[field]?.toString() || ''}
          onChangeText={(value: string) => {
            let parsedValue: string | number = value;
            if (keyboardType === 'number-pad' || keyboardType === 'numeric' || keyboardType === 'decimal-pad') {
              parsedValue = value === '' ? 0 : parseFloat(value);
            }
            handleChange(field, parsedValue as any);
          }}
          placeholder={placeholder}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
        />
        {validation && field in (validation as any) && (validation as any)[field]?.message && (
          <Text style={styles.error}>{(validation as any)[field]?.message}</Text> // TODO: типізувати validation відповідно до полів Part
        )}
      </View>
    );
  };

  /**
   * Рендерить поле для введення сумісних автомобілів
   */
  const renderCompatibleCars = () => {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>Сумісність з автомобілями</Text>
        <TextInput
          style={styles.input}
          value={newCompatibleCar}
          onChangeText={(text: string) => setNewCompatibleCar(text)}
          placeholder="Введіть модель автомобіля"
        />
        <Button
          title="Додати"
          onPress={() => {
            const cars = formData.compatibleCars || [];
            cars.push(newCompatibleCar);
            handleChange('compatibleCars', cars);
            setNewCompatibleCar('');
          }}
        />
        {formData.compatibleCars && (
          <View style={styles.compatibleCarsList}>
            {formData.compatibleCars.map((car, index) => (
              <Text key={index} style={styles.compatibleCar}>{car}</Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  /**
   * Обробник відправки форми: валідація + збереження через FileStorageService
   */
  const handleSubmit = async (): Promise<void> => {
    const validationResult = validatePart(formData);
    setValidation(validationResult);
    if (!isPartValid(validationResult)) {
      Alert.alert('Помилка', 'Перевірте обов\'язкові поля та виправте помилки форми');
      logger.warn('Валідація не пройдена', validationResult as any);
      return;
    }

    try {
      setLoading(true);
      const storageService = FileStorageService;

      logger.info('Надіслано форму', { isEditing, initialPartId });

      if (isEditing && initialPartId) {
        const updatedPart: Part = {
          ...(formData as Part),
          id: initialPartId,
          createdAt: (formData.createdAt as Date) ?? new Date(),
          updatedAt: new Date(),
        };
        await storageService.updatePart(updatedPart);
        Alert.alert('Успіх', 'Запчастину успішно оновлено');
      } else {
        // Побудувати коректний payload без id
        const now = new Date();
        const payload: Omit<Part, 'id'> = {
          articleNumber: String(formData.articleNumber || '').trim(),
          name: String(formData.name || '').trim(),
          manufacturer: String(formData.manufacturer || '').trim(),
          category: String(formData.category || '').trim(),
          isNew: Boolean(formData.isNew),
          quantity: Number(formData.quantity ?? 0),
          price: Number(formData.price ?? 0),
          description: formData.description ?? null,
          photoPath: formData.photoPath ?? null,
          compatibleCars: formData.compatibleCars ?? null,
          createdAt: now,
          updatedAt: now,
        };
        const newId = await storageService.addPart(payload);
        logger.info('Створено нову запчастину', { id: newId });
        Alert.alert('Успіх', 'Запчастину успішно додано');
      }
      navigation.goBack();
    } catch (error) {
      logger.error('Помилка при збереженні запчастини:', error);
      Alert.alert('Помилка', 'Не вдалося зберегти запчастину');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Обробник скасування форми
   */
  const handleCancel = (): void => {
    navigation.goBack();
  };

  // Видалено: функціонал фотографування/сканування та CameraService

  /**
   * Обробник вибору фото з галереї
   */
  const handlePickImage = async (): Promise<void> => {
    try {
      const result = await ImagePicker.launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 });
      if (result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        
        // Оптимізуємо зображення перед збереженням через сервіс оптимізації
        try {
          if (!uri) return;
          const optimizedResult = await imageOptimizationService.optimizeImage(uri, {
            width: 1200,
            height: 1200,
            quality: 85,
            format: 'JPEG',
            resizeMode: 'contain',
            onlyScaleDown: true
          });
          
          logger.info('Зображення оптимізовано:', optimizedResult.optimizedUri);
          handleChange('photoPath', optimizedResult.optimizedUri);
        } catch (optimizeError) {
          logger.error('Помилка при оптимізації зображення:', optimizeError);
          // Якщо оптимізація не вдалася, використовуємо оригінальне зображення
          handleChange('photoPath', uri);
        }
      }
    } catch (error) {
      logger.error('Помилка при виборі зображення:', error);
      Alert.alert('Помилка', 'Не вдалося вибрати зображення');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.form}>
            <Text style={styles.requiredNote}>Поля, позначені * — обов'язкові</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Артикул *</Text>
              <View style={styles.articleNumberContainer}>
                <TextInput
                  style={[styles.input, styles.articleNumberInput, validation?.articleNumber && !validation.articleNumber.isValid && styles.inputError]}
                  value={formData.articleNumber || ''}
                  onChangeText={(value: string) => handleChange('articleNumber', value)}
                  placeholder="Введіть артикул"
                />
                {/* Кнопку сканування видалено */}
              </View>
              {validation?.articleNumber?.message && (
                <Text style={styles.error}>{validation.articleNumber.message}</Text>
              )}
            </View>
            
            {renderField('Назва *', 'name', 'Введіть назву', 'default')}
            {renderField('Виробник *', 'manufacturer', 'Введіть виробника', 'default')}
            {renderField('Категорія *', 'category', 'Введіть категорію', 'default')}
            {renderField('Кількість *', 'quantity', 'Введіть кількість', 'numeric')}
            {renderField('Ціна *', 'price', 'Введіть ціну', 'decimal-pad')}
            {renderCompatibleCars()}
            {renderField('Опис', 'description', 'Введіть опис', 'default', true)}

            <View style={styles.field}>
              <Text style={styles.label}>Фото запчастини</Text>
              <View style={styles.photoContainer}>
                {formData.photoPath ? (
                  <OptimizedImage
                    uri={formData.photoPath}
                    style={styles.photo}
                    resizeMode="cover"
                    optimizationOptions={{
                      width: 1200,
                      height: 1200,
                      quality: 85
                    }}
                    cacheSettings={{
                      priority: 'normal',
                      cacheControl: 'immutable'
                    }}
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="image-outline" size={50} color={colors.textLight} />
                    <Text style={styles.photoPlaceholderText}>Немає фото</Text>
                  </View>
                )}
                <TouchableOpacity onPress={handlePickImage} style={styles.pickImageButton}>
                  <Ionicons name="images-outline" size={24} color={colors.primary} />
                  <Text style={styles.pickImageText}>Вибрати з галереї</Text>
                </TouchableOpacity>
              </View>
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
      </View>
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
  },
  photoContainer: {
    marginTop: spacing.sm,
    alignItems: 'center',
    gap: spacing.md
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: spacing.sm
  },
  photoPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  photoPlaceholderText: {
    color: colors.textLight,
    marginTop: spacing.sm
  },
  pickImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    gap: spacing.xs
  },
  pickImageText: {
    color: colors.primary,
    fontWeight: '500'
  }
});

export default PartForm;
