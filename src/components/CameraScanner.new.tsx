import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, ActivityIndicator, BackHandler, Platform, SafeAreaView, Alert } from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import { CameraService } from '../services/CameraService';
import { TextRecognitionService } from '../services/TextRecognitionService';
import { colors, spacing, typography } from '../theme/theme';
import Button from './Button';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

type CameraScannerScreenProps = NativeStackScreenProps<RootStackParamList, 'CameraScanner'>;

const CameraScanner: React.FC<CameraScannerScreenProps> = ({ route, navigation }) => {
  const { onTextRecognized } = route.params;
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [flashMode, setFlashMode] = useState<FlashMode>(FlashMode.off);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [cameraVisible, setCameraVisible] = useState(true);
  const cameraRef = useRef<Camera | null>(null);
  const cameraService = CameraService.getInstance();
  const textRecognitionService = TextRecognitionService.getInstance();

  useEffect(() => {
    (async () => {
      const permissionGranted = await cameraService.requestPermissions();
      setHasPermission(permissionGranted);
    })();
    
    // Обробка кнопки "назад" для закриття сканера
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  const toggleFlash = () => {
    setFlashMode(flashMode === FlashMode.off ? FlashMode.torch : FlashMode.off);
  };

  const processImage = async (imageUri: string) => {
    try {
      setScanning(true);
      
      // Розпізнавання тексту з фото
      const text = await textRecognitionService.recognizeText(imageUri);
      
      if (!text || text.trim() === '') {
        setRecognizedText('Не вдалося розпізнати текст з зображення');
        return;
      }
      
      setRecognizedText(text);
      
      // Витягуємо інформацію про запчастину з розпізнаного тексту
      const partInfo = await textRecognitionService.extractPartInfo(text);
      
      console.log('Отримана інформація про запчастину:', partInfo);
      
      if (partInfo.articleNumber) {
        // Передаємо всю інформацію про запчастину назад у додаток
        onTextRecognized(partInfo.articleNumber, partInfo);
        navigation.goBack();
      }
    } catch (error) {
      console.error('Помилка при обробці зображення:', error);
      const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
      setRecognizedText(`Помилка при розпізнаванні тексту: ${errorMessage}`);
    } finally {
      setScanning(false);
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    
    try {
      setScanning(true);
      cameraService.setCamera(cameraRef.current);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      await processImage(photo.uri);
    } catch (error) {
      console.error('Помилка при скануванні:', error);
      setScanning(false);
    }
  };
  
  const handlePickImage = async () => {
    try {
      console.log('Початок вибору фото з галереї');
      setScanning(true);
      
      // Запитуємо дозвіл на доступ до галереї
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Статус дозволу на доступ до галереї:', status);
      
      if (status !== 'granted') {
        Alert.alert('Помилка', 'Для вибору фото необхідно надати доступ до галереї');
        setScanning(false);
        return;
      }
      
      console.log('Відкриваємо галерею для вибору фото');
      // Відкриваємо галерею для вибору фото
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });
      
      console.log('Результат вибору фото:', result.canceled ? 'Скасовано' : 'Вибрано');
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Вибрано фото:', result.assets[0].uri);
        await processImage(result.assets[0].uri);
      } else {
        setScanning(false);
      }
    } catch (error) {
      console.error('Помилка при виборі фото з галереї:', error);
      Alert.alert('Помилка', 'Не вдалося вибрати фото: ' + (error instanceof Error ? error.message : 'Невідома помилка'));
      setScanning(false);
    }
  };

  const handleRetry = () => {
    setRecognizedText('');
  };

  const handleUseText = async () => {
    try {
      if (recognizedText) {
        const partInfo = await textRecognitionService.extractPartInfo(recognizedText);
        if (partInfo.articleNumber) {
          onTextRecognized(partInfo.articleNumber, partInfo);
          navigation.goBack();
        }
      }
    } catch (error) {
      console.error('Помилка при обробці тексту:', error);
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const renderCameraContent = () => {
    // Показуємо індикатор завантаження під час сканування
    if (scanning) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            Розпізнавання тексту...
          </Text>
        </View>
      );
    }
    
    // Якщо є розпізнаний текст, показуємо його
    if (recognizedText && !recognizedText.includes('Помилка')) {
      return (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Розпізнаний текст:</Text>
          <View style={styles.textContainer}>
            <Text style={styles.recognizedText}>{recognizedText}</Text>
          </View>
          <View style={styles.resultControls}>
            <Button
              title="Спробувати ще раз"
              onPress={handleRetry}
              style={styles.resultButton}
              variant="secondary"
            />
            <Button
              title="Використати цей текст"
              onPress={handleUseText}
              style={styles.resultButton}
              variant="primary"
            />
          </View>
        </View>
      );
    }
    
    // Якщо немає дозволу на використання камери
    if (hasPermission === false) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Немає доступу до камери</Text>
          <Text style={styles.errorSubtext}>
            Для використання сканера необхідно надати доступ до камери в налаштуваннях пристрою.
          </Text>
          <Button
            title="Вибрати фото з галереї"
            onPress={handlePickImage}
            variant="primary"
          />
          <Button
            title="Закрити"
            onPress={handleClose}
            variant="secondary"
            style={{ marginTop: spacing.sm }}
          />
        </View>
      );
    }
    
    // Якщо дозвіл ще не отримано
    if (hasPermission === null) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            Запит дозволу на використання камери...
          </Text>
        </View>
      );
    }
    
    // Відображаємо камеру, якщо cameraVisible = true
    if (cameraVisible) {
      return (
        <SafeAreaView style={styles.cameraContainer}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={CameraType.back}
            flashMode={flashMode}
          >
            <View style={styles.overlay}>
              <View style={styles.scanFrame} />
              <Text style={styles.instructionText}>
                Наведіть камеру на етикетку запчастини
              </Text>
            </View>
            <View style={styles.controls}>
              <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
                <Ionicons
                  name={flashMode === FlashMode.off ? "flash-off" : "flash"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
              
              <Button
                title="Сканувати"
                onPress={handleCapture}
                style={styles.captureButton}
                variant="primary"
              />
              
              <TouchableOpacity style={styles.galleryButton} onPress={handlePickImage}>
                <Ionicons name="images" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </Camera>
        </SafeAreaView>
      );
    } else {
      // Якщо камера не відображається, показуємо кнопки для вибору дії
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Виберіть джерело зображення</Text>
          <Button
            title="Відкрити камеру"
            onPress={() => setCameraVisible(true)}
            variant="primary"
            style={{ marginBottom: spacing.md }}
          />
          <Button
            title="Вибрати фото з галереї"
            onPress={handlePickImage}
            variant="secondary"
          />
          <Button
            title="Закрити"
            onPress={handleClose}
            variant="secondary"
            style={{ marginTop: spacing.md }}
          />
        </View>
      );
    }
  };

  // Відображаємо повідомлення про помилку, якщо воно є
  const renderErrorMessage = () => {
    if (!recognizedText || !recognizedText.includes('Помилка')) return null;
    
    return (
      <View style={styles.errorMessageContainer}>
        <Ionicons name="alert-circle" size={24} color={colors.error} />
        <Text style={styles.errorMessageText}>{recognizedText}</Text>
        <TouchableOpacity onPress={() => setRecognizedText('')}>
          <Ionicons name="close-circle" size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderCameraContent()}
      {renderErrorMessage()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 280,
    height: 120,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
    borderRadius: 10,
  },
  instructionText: {
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: spacing.sm,
    borderRadius: 5,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 30, // Збільшуємо відступ для Android
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingBottom: Platform.OS === 'android' ? spacing.xl : spacing.md,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10, // Додаємо zIndex для перекриття інших елементів
  },
  captureButton: {
    flex: 2,
    marginHorizontal: spacing.sm,
  },
  cancelButton: {
    flex: 1,
  },
  flashButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  resultContainer: {
    flex: 1,
    padding: spacing.md,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  textContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  recognizedText: {
    fontSize: 16,
    color: colors.text,
  },
  resultControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultButton: {
    flex: 1,
    marginHorizontal: spacing.sm / 2,
  },
  errorMessageContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 90,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 8,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
  },
  errorMessageText: {
    color: colors.surface,
    flex: 1,
    marginHorizontal: spacing.sm,
    fontSize: 14,
  },
});

export default CameraScanner;
