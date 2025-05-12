import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, Alert, Modal, ScrollView } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { Part } from '../models/Part';
import FileStorageService from '../services/FileStorageService';
import { CameraService } from '../services/CameraService';
import { TextRecognitionService } from '../services/TextRecognitionService';
import { colors, spacing } from '../theme/theme';
import Button from './Button';

interface QuickActionsProps {
  onPartFound: (part: Part) => void;
  onPartAdded: () => void;
  onOpenScanner?: () => void;
  onOpenHistory?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onPartFound, onPartAdded, onOpenScanner, onOpenHistory }) => {
  const [searchArticle, setSearchArticle] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quickAddData, setQuickAddData] = useState({
    articleNumber: '',
    name: '',
    price: '',
    quantity: '1',
    manufacturer: '',
    category: ''
  });

  const storageService = FileStorageService.getInstance();
  const cameraService = CameraService.getInstance();
  const textRecognitionService = TextRecognitionService.getInstance();

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
      console.error('Помилка при швидкому пошуку:', error);
      Alert.alert('Помилка', 'Не вдалося виконати пошук');
    } finally {
      setLoading(false);
    }
  };

  // Сканування артикула через камеру
  const handleScanArticle = async () => {
    // Якщо передано функцію для відкриття сканера, використовуємо її
    if (onOpenScanner) {
      onOpenScanner();
      return;
    }
    
    // Інакше використовуємо вбудований функціонал
    const hasPermission = await cameraService.requestPermissions();
    if (hasPermission) {
      setShowCamera(true);
    } else {
      Alert.alert('Помилка', 'Немає дозволу на використання камери');
    }
  };

  // Обробка фото та розпізнавання тексту
  const handleCameraCapture = async () => {
    try {
      setLoading(true);
      const recognizedText = await cameraService.takePictureAndRecognizeText();
      setShowCamera(false);
      
      if (recognizedText) {
        // Спроба знайти артикул у розпізнаному тексті
        const partInfo = await textRecognitionService.extractPartInfo(recognizedText);
        
        if (partInfo.articleNumber) {
          setSearchArticle(partInfo.articleNumber);
          // Автоматичний пошук після сканування
          const part = await storageService.findByArticle(partInfo.articleNumber);
          
          if (part) {
            onPartFound(part);
          } else {
            // Заповнюємо форму швидкого додавання даними з розпізнаного тексту
            setQuickAddData({
              articleNumber: partInfo.articleNumber || '',
              name: partInfo.name || '',
              price: partInfo.price ? partInfo.price.toString() : '',
              quantity: '1',
              manufacturer: partInfo.manufacturer || '',
              category: partInfo.category || ''
            });
            setShowQuickAdd(true);
          }
        } else {
          Alert.alert('Увага', 'Не вдалося розпізнати артикул. Спробуйте ще раз або введіть вручну.');
        }
      }
    } catch (error) {
      console.error('Помилка при скануванні:', error);
      Alert.alert('Помилка', 'Не вдалося обробити зображення');
    } finally {
      setLoading(false);
    }
  };

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
      
      const quantity = parseInt(quickAddData.quantity);
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
      setShowQuickAdd(false);
      setQuickAddData({
        articleNumber: '',
        name: '',
        price: '',
        quantity: '1',
        manufacturer: '',
        category: ''
      });
      onPartAdded();
    } catch (error) {
      console.error('Помилка при швидкому додаванні:', error);
      Alert.alert('Помилка', 'Не вдалося додати запчастину');
    } finally {
      setLoading(false);
    }
  };

  // Обробка зміни полів форми швидкого додавання
  const handleQuickAddChange = (field: string, value: string) => {
    setQuickAddData(prev => ({ ...prev, [field]: value }));
  };

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
        <Button
          title="Сканувати"
          onPress={handleScanArticle}
          variant="secondary"
          style={styles.scanButton}
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

      {/* Модальне вікно камери */}
      <Modal
        visible={showCamera}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowCamera(false)}
      >
        <View style={styles.cameraContainer}>
          {/* Використовуємо Camera як компонент */}
          <View style={styles.camera}>
            {/* Камера буде ініціалізована через CameraService */}
            <View style={styles.cameraControls}>
              <Button
                title="Сканувати"
                onPress={handleCameraCapture}
                variant="primary"
                style={styles.captureButton}
                loading={loading}
              />
              <Button
                title="Скасувати"
                onPress={() => setShowCamera(false)}
                variant="danger"
                style={styles.cancelButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Модальне вікно швидкого додавання */}
      <Modal
        visible={showQuickAdd}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowQuickAdd(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Швидке додавання запчастини</Text>
            
            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>Артикул *</Text>
              <TextInput
                style={styles.input}
                value={quickAddData.articleNumber}
                onChangeText={(value) => handleQuickAddChange('articleNumber', value)}
                placeholder="Введіть артикул"
              />
              
              <Text style={styles.label}>Назва *</Text>
              <TextInput
                style={styles.input}
                value={quickAddData.name}
                onChangeText={(value) => handleQuickAddChange('name', value)}
                placeholder="Введіть назву"
              />
              
              <Text style={styles.label}>Ціна *</Text>
              <TextInput
                style={styles.input}
                value={quickAddData.price}
                onChangeText={(value) => handleQuickAddChange('price', value)}
                placeholder="Введіть ціну"
                keyboardType="numeric"
              />
              
              <Text style={styles.label}>Кількість *</Text>
              <TextInput
                style={styles.input}
                value={quickAddData.quantity}
                onChangeText={(value) => handleQuickAddChange('quantity', value)}
                placeholder="Введіть кількість"
                keyboardType="numeric"
              />
              
              <Text style={styles.label}>Виробник</Text>
              <TextInput
                style={styles.input}
                value={quickAddData.manufacturer}
                onChangeText={(value) => handleQuickAddChange('manufacturer', value)}
                placeholder="Введіть виробника"
              />
              
              <Text style={styles.label}>Категорія</Text>
              <TextInput
                style={styles.input}
                value={quickAddData.category}
                onChangeText={(value) => handleQuickAddChange('category', value)}
                placeholder="Введіть категорію"
              />
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <Button
                title="Додати"
                onPress={handleQuickAdd}
                variant="primary"
                style={styles.addButton}
                loading={loading}
              />
              <Button
                title="Скасувати"
                onPress={() => setShowQuickAdd(false)}
                variant="danger"
                style={styles.cancelButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background,
  },
  searchButton: {
    marginLeft: spacing.sm,
    height: 40,
  },
  scanButton: {
    marginLeft: spacing.sm,
    height: 40,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: spacing.sm,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  captureButton: {
    marginRight: spacing.sm,
  },
  cancelCameraButton: {
    marginLeft: spacing.sm,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.md,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textAlign: 'center',
    color: colors.text,
  },
  formContainer: {
    maxHeight: 400,
  },
  label: {
    fontSize: 14,
    marginBottom: spacing.sm / 2,
    color: colors.text,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  addButton: {
    flex: 1,
    marginRight: spacing.sm / 2,
  },
  cancelButton: {
    flex: 1,
    marginLeft: spacing.sm / 2,
  },
});

export default QuickActions;