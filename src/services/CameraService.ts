import { Camera, CameraType } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import { TextRecognitionService } from './TextRecognitionService';

export class CameraService {
  private static instance: CameraService;
  private camera: any = null;
  private isTextRecognizerAvailable: boolean = false;

  private constructor() {
    try {
      // Використовуємо TextRecognitionService замість TextRecognizer
      this.isTextRecognizerAvailable = true;
      console.log('CameraService ініціалізовано успішно');
    } catch (error) {
      console.warn('Помилка ініціалізації CameraService:', error);
      this.isTextRecognizerAvailable = false;
    }
  }

  public static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  public setCamera(camera: any): void {
    this.camera = camera;
  }

  public async requestPermissions(): Promise<boolean> {
    try {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      
      return cameraStatus === 'granted' && mediaStatus === 'granted';
    } catch (error) {
      console.error('Помилка при запиті дозволів:', error);
      return false;
    }
  }

  public async takePictureAndRecognizeText(): Promise<string | null> {
    if (!this.camera) {
      throw new Error('Помилка: Камера не ініціалізована');
    }

    try {
      const photo = await this.camera.takePictureAsync();
      const processedImage = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      if (!this.isTextRecognizerAvailable) {
        console.warn('Розпізнавання тексту недоступне');
        return 'Розпізнавання тексту недоступне';
      }

      const recognizedText = await this.processImage(processedImage.uri);
      return recognizedText;
    } catch (error) {
      console.error('Помилка при фотографуванні:', error);
      throw error;
    }
  }

  private async processImage(imagePath: string): Promise<string | null> {
    if (!this.isTextRecognizerAvailable) {
      return 'Розпізнавання тексту недоступне';
    }

    try {
      // Використовуємо TextRecognitionService для розпізнавання тексту
      const textRecognitionService = TextRecognitionService.getInstance();
      const recognizedText = await textRecognitionService.recognizeText(imagePath);
      return recognizedText;
    } catch (error) {
      console.error('Помилка при розпізнаванні тексту:', error);
      return null;
    }
  }

  public async saveImage(uri: string): Promise<string> {
    try {
      const asset = await MediaLibrary.createAssetAsync(uri);
      const album = await MediaLibrary.getAlbumAsync('SkladZP');
      
      if (album === null) {
        await MediaLibrary.createAlbumAsync('SkladZP', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      const fileName = `${Date.now()}.jpg`;
      const newPath = `${FileSystem.documentDirectory}photos/${fileName}`;

      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}photos`, {
        intermediates: true
      });

      await FileSystem.copyAsync({
        from: uri,
        to: newPath
      });

      return newPath;
    } catch (error) {
      console.error('Помилка при збереженні зображення:', error);
      throw error;
    }
  }

  public async cleanup(): Promise<void> {
    this.camera = null;
  }
}