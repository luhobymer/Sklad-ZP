import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, TextInput, StyleSheet, Text, Alert, SafeAreaView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
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
          onTextRecognized: (text: string) => {
            handleChange('articleNumber', text);
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
  }
});

export default PartForm;
