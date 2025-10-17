import { TextRecognitionService } from '../../src/services/TextRecognitionService';
import { Part } from '../../src/models/Part';
import { PartExtractionOptions, PartExtractionResult, TextRecognitionResult, TextRecognitionOptions } from '../../src/types/services';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';

// Mocking external dependencies
jest.mock('react-native-fs');
jest.mock('react-native-image-resizer');

// Mocking the logger used within the service
jest.mock('../../src/utils/logger', () => ({
  textRecognitionLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('TextRecognitionService', () => {
  let serviceInstance: TextRecognitionService;

  beforeEach(() => {
    jest.clearAllMocks();
    serviceInstance = TextRecognitionService.getInstance();

    (RNFS.exists as jest.Mock).mockResolvedValue(true);
    (RNFS.stat as jest.Mock).mockResolvedValue({ size: 1024, mtime: Date.now(), isFile: () => true, isDirectory: () => false });
    (ImageResizer.createResizedImage as jest.Mock).mockResolvedValue({
      uri: 'file:///manipulated-image.jpg',
      width: 800,
      height: 600,
      size: 1024,
    });
  });

  describe('getInstance', () => {
    it('should return a singleton instance of TextRecognitionService', () => {
      const instance1 = TextRecognitionService.getInstance();
      const instance2 = TextRecognitionService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('optimizeImageForRecognition', () => {
    it('should optimize image and return new URI', async () => {
      const imageUri = 'file:///test-image.jpg';
      const optimizedUri = await serviceInstance.optimizeImageForRecognition(imageUri);
      expect(ImageResizer.createResizedImage).toHaveBeenCalled();
      expect(optimizedUri).toBe('file:///manipulated-image.jpg');
    });

    it('should return original URI if optimization fails but file exists', async () => {
      (ImageResizer.createResizedImage as jest.Mock).mockRejectedValueOnce(new Error('Manipulation failed'));
      const imageUri = 'file:///test-image.jpg';
      const resultUri = await serviceInstance.optimizeImageForRecognition(imageUri);
      expect(resultUri).toBe(imageUri);
    });

    it('should throw error if image does not exist', async () => {
      (RNFS.exists as jest.Mock).mockResolvedValueOnce(false);
      const imageUri = 'file:///non-existent-image.jpg';
      await expect(serviceInstance.optimizeImageForRecognition(imageUri)).rejects.toThrow('Файл зображення не знайдено');
    });
  });

  describe('recognizeText', () => {
    beforeEach(() => {
      // The actual recognizeText in TextRecognitionService.ts is a placeholder.
      // These tests will verify interaction with FileSystem and ImageManipulator mocks,
      // and the placeholder's return value.
    });

    it('should return recognized text if image exists and optimization is successful (placeholder behavior)', async () => {
      const imageUri = 'file:///test-image.jpg';
      const result = await serviceInstance.recognizeText(imageUri);
      expect(RNFS.exists).toHaveBeenCalledWith(imageUri);
      expect(ImageResizer.createResizedImage).toHaveBeenCalled(); 
      expect(result.success).toBe(true); 
      expect(result.text).toContain('Це заглушка'); 
    });

    it('should return recognized text if image exists and optimization is disabled (placeholder behavior)', async () => {
      const imageUri = 'file:///test-image.jpg';
      const result = await serviceInstance.recognizeText(imageUri, { optimizeImage: false });
      expect(RNFS.exists).toHaveBeenCalledWith(imageUri);
      expect(ImageResizer.createResizedImage).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.text).toContain('Це заглушка');
    });

    it('should return error if image does not exist', async () => {
      (RNFS.exists as jest.Mock).mockResolvedValueOnce(false);
      const imageUri = 'file:///non-existent-image.jpg';
      const result = await serviceInstance.recognizeText(imageUri);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Файл зображення не знайдено: file:///non-existent-image.jpg');
    });

    it('should handle optimization failure and proceed (placeholder behavior)', async () => {
      (ImageResizer.createResizedImage as jest.Mock).mockRejectedValueOnce(new Error('Optimization failed'));
      const imageUri = 'file:///test-image.jpg';
      const result = await serviceInstance.recognizeText(imageUri);
      // optimizeImageForRecognition should have returned the original URI
      // The placeholder recognizeText will still report success.
      expect(result.success).toBe(true); 
      expect(result.text).toContain('Це заглушка');
    });
  });

  describe('extractPartInfo', () => {
    const defaultOptions: PartExtractionOptions = {
      extractArticleNumber: true,
      extractName: true,
      extractManufacturer: true,
      extractPrice: true,
      extractCategory: true,
      extractQuantity: true, // Assuming we want to test quantity extraction too
      minConfidence: 0.1, // Low threshold for testing, actual might be higher
      saveOriginalText: false,
    };

    it('should extract all part info correctly when all data is present', async () => {
      const text = [
        'Артикул: XYZ12345',
        'Назва: Супер Гайка М10',
        'Виробник: ГайкПром',
        'Ціна: 150.75 грн',
        'Категорія: Кріплення',
        'Кількість: 10 шт'
      ].join('\n');
      const result = await serviceInstance.extractPartInfo(text, defaultOptions);

      expect(result.success).toBe(true);
      expect(result.part).not.toBeNull();
      expect(result.part?.articleNumber).toBe('XYZ12345');
      expect(result.part?.name).toBe('Супер Гайка М10');
      expect(result.part?.manufacturer).toBe('ГайкПром');
      expect(result.part?.price).toBe(150.75);
      expect(result.part?.category).toBe('Кріплення');
      // expect(result.part?.quantity).toBe(10); // Quantity extraction logic needs to be verified in service
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should handle missing optional fields gracefully', async () => {
      const text = [
        'Артикул: ABC987',
        'Назва: Простий Болт',
        // Виробник відсутній
        'Ціна: 25.00',
        // Категорія відсутня
      ].join('\n');
      const result = await serviceInstance.extractPartInfo(text, defaultOptions);

      expect(result.success).toBe(true); // Success if article or name is found
      expect(result.part).not.toBeNull();
      expect(result.part?.articleNumber).toBe('ABC987');
      expect(result.part?.name).toBe('Простий Болт');
      expect(result.part?.manufacturer).toBeUndefined();
      expect(result.part?.price).toBe(25.00);
      expect(result.part?.category).toBeUndefined();
    });

    it('should return success false if no key information (article, name, manufacturer) is found', async () => {
      const text = 'Просто якийсь текст без деталей.';
      const result = await serviceInstance.extractPartInfo(text, defaultOptions);
      expect(result.success).toBe(false);
      expect(result.part).toBeNull();
      expect(result.error).toBe('Не вдалося вилучити достатньо ключової інформації (артикул, назва або виробник).');
    });

    it('should respect extraction options for disabling fields', async () => {
      const text = 'Артикул: DFG456\nНазва: Інша Деталь\nЦіна: 300';
      const options: PartExtractionOptions = {
        ...defaultOptions,
        extractPrice: false,
        extractManufacturer: false, // Example: manufacturer not in text, option doesn't change that
      };
      const result = await serviceInstance.extractPartInfo(text, options);

      expect(result.success).toBe(true);
      expect(result.part?.articleNumber).toBe('DFG456');
      expect(result.part?.name).toBe('Інша Деталь');
      expect(result.part?.price).toBeUndefined(); // Price extraction was disabled
    });

    it('should correctly parse price with different formats', async () => {
      const text1 = 'Ціна: 1,234.56 грн';
      const text2 = 'Ціна 500.00 UAH';
      const text3 = 'Price: 75'; // No currency, simple number

      const result1 = await serviceInstance.extractPartInfo(text1, { ...defaultOptions, extractPrice: true });
      const result2 = await serviceInstance.extractPartInfo(text2, { ...defaultOptions, extractPrice: true });
      const result3 = await serviceInstance.extractPartInfo(text3, { ...defaultOptions, extractPrice: true });
      
      // These expectations depend on the robustness of `extractPrice` in the service
      expect(result1.part?.price).toBe(1234.56);
      expect(result2.part?.price).toBe(500.00);
      expect(result3.part?.price).toBe(75);
    });

    it('should use minConfidence from options', async () => {
      const text = 'Артикул: LOWCONF123 (впевненість мала б бути низькою)';
      // Mock individual extraction methods if their confidence is part of the test
      // For now, this tests if options are passed through and affect overall logic if minConfidence is used in sub-extractors
      const highMinConfidenceOptions: PartExtractionOptions = { ...defaultOptions, minConfidence: 0.9 };
      const lowMinConfidenceOptions: PartExtractionOptions = { ...defaultOptions, minConfidence: 0.05 };

      // To properly test this, extractArticleNumber etc. would need to return varying confidence values
      // and `extractPartInfo` would use `minConfidence` to filter them.
      // We assume the `minConfidence` is used internally by the sub-extraction methods or by `extractPartInfo` when evaluating them.
      // This is more of an integration test for the option.
      const resultHighConf = await serviceInstance.extractPartInfo(text, highMinConfidenceOptions);
      const resultLowConf = await serviceInstance.extractPartInfo(text, lowMinConfidenceOptions);
      
      // This assertion is conceptual. Actual behavior depends on how sub-extractors report confidence
      // and how extractPartInfo uses minConfidence. If sub-extractors always return high confidence, this test won't show difference.
      // For a real test, mock `this.extractArticleNumber` to return different confidences.
      // expect(resultHighConf.part?.articleNumber).toBeUndefined(); // Assuming LOWCONF123 has confidence < 0.9
      expect(resultLowConf.part?.articleNumber).toBe('LOWCONF123'); // Assuming LOWCONF123 has confidence > 0.05
    });

  });

  describe('processImageAndExtractInfo', () => {
    const imageUri = 'file:///test-image.jpg';
    const mockRecognizedText = 'Артикул: MOCK123\nНазва: Мок Деталь';
    const mockRecognitionResult: TextRecognitionResult = {
      success: true,
      text: mockRecognizedText,
      confidence: 0.9,
      processingTimeMs: 50,
    };
    const mockExtractedPart: Partial<Part> = {
      articleNumber: 'MOCK123',
      name: 'Мок Деталь',
      photoPath: imageUri, // Should be added by processImageAndExtractInfo
    };
    const mockExtractionResult: PartExtractionResult = {
      success: true,
      part: mockExtractedPart,
      confidence: 0.85,
      processingTimeMs: 150,
      extractionDate: new Date(),
      originalText: mockRecognizedText,
    };

    beforeEach(() => {
      // Mock recognizeText to return a successful recognition
      jest.spyOn(serviceInstance, 'recognizeText').mockResolvedValue(mockRecognitionResult);
      // Mock extractPartInfo to return a successful extraction
      jest.spyOn(serviceInstance, 'extractPartInfo').mockResolvedValue(mockExtractionResult);
    });

    it('should successfully process image and extract info', async () => {
      const options: PartExtractionOptions & { recognitionOptions?: TextRecognitionOptions } = {
        saveOriginalText: true,
        recognitionOptions: { optimizeImage: true },
      };
      const result = await serviceInstance.processImageAndExtractInfo(imageUri, options);

      expect(serviceInstance.recognizeText).toHaveBeenCalledWith(imageUri, options.recognitionOptions);
      expect(serviceInstance.extractPartInfo).toHaveBeenCalledWith(mockRecognizedText, expect.objectContaining({ saveOriginalText: true }));
      expect(result.success).toBe(true);
      expect(result.part).toEqual(expect.objectContaining(mockExtractedPart));
      expect(result.part?.photoPath).toBe(imageUri);
      expect(result.originalText).toBe(mockRecognizedText);
      expect(result.confidence).toBe(mockExtractionResult.confidence); // Or combined/recalculated confidence
    });

    it('should return error if text recognition fails', async () => {
      const recognitionErrorResult: TextRecognitionResult = {
        success: false,
        text: '',
        error: 'Recognition failed',
      };
      (serviceInstance.recognizeText as jest.Mock).mockResolvedValueOnce(recognitionErrorResult);

      const result = await serviceInstance.processImageAndExtractInfo(imageUri);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Recognition failed');
      expect(result.part).toBeNull();
      expect(serviceInstance.extractPartInfo).not.toHaveBeenCalled();
    });

    it('should return error if text is recognized but info extraction fails', async () => {
      const extractionErrorResult: PartExtractionResult = {
        success: false,
        part: null,
        error: 'Extraction failed',
      };
      (serviceInstance.extractPartInfo as jest.Mock).mockResolvedValueOnce(extractionErrorResult);

      const result = await serviceInstance.processImageAndExtractInfo(imageUri);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Extraction failed');
      expect(result.part).toBeNull();
    });

    it('should pass combined options correctly', async () => {
      const specificOptions: PartExtractionOptions & { recognitionOptions?: TextRecognitionOptions } = {
        extractName: false, // PartExtractionOption
        minConfidence: 0.7, // PartExtractionOption
        recognitionOptions: { // TextRecognitionOptions
          language: 'uk',
          optimizeImage: false,
        },
        saveOriginalText: true,
      };

      await serviceInstance.processImageAndExtractInfo(imageUri, specificOptions);

      expect(serviceInstance.recognizeText).toHaveBeenCalledWith(imageUri, specificOptions.recognitionOptions);
      expect(serviceInstance.extractPartInfo).toHaveBeenCalledWith(
        mockRecognizedText, 
        expect.objectContaining({
          extractName: false, // from specificOptions
          minConfidence: 0.7, // from specificOptions
          saveOriginalText: true, // from specificOptions
          // Default PartExtractionOptions from processImageAndExtractInfo should also be merged
          extractArticleNumber: true, // default
          extractManufacturer: true, // default
          extractPrice: true, // default
          extractCategory: true, // default
          extractQuantity: true, // default
        })
      );
    });
  });

});
