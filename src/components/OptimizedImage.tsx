import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import FastImage, { FastImageProps } from 'react-native-fast-image';
import imageOptimizationService, { ImageOptimizationOptions, CacheSettings } from '../services/ImageOptimizationService';
import { colors } from '../theme/theme';
import { Logger } from '../utils/logger';

// Створюємо логер для компонента
const logger = new Logger({ prefix: 'OptimizedImage' });

// Типи для пропсів компонента
export interface OptimizedImageProps extends Omit<FastImageProps, 'source' | 'onError'> {
  uri: string | null | undefined;
  width?: number | string;
  height?: number | string;
  optimizationOptions?: ImageOptimizationOptions;
  cacheSettings?: CacheSettings;
  showPlaceholder?: boolean;
  placeholderText?: string;
  placeholderIcon?: React.ReactNode;
  resizeMode?: 'cover' | 'contain' | 'stretch';
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Компонент для відображення оптимізованих зображень з кешуванням
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  uri,
  width,
  height,
  style,
  optimizationOptions,
  cacheSettings,
  showPlaceholder = true,
  placeholderText = 'Немає зображення',
  placeholderIcon,
  resizeMode = 'cover',
  onLoad,
  onError,
  ...props
}) => {
  const [optimizedUri, setOptimizedUri] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Перетворюємо ResizeMode для FastImage
  const getFastImageResizeMode = () => {
    switch (resizeMode) {
      case 'cover':
        return FastImage.resizeMode.cover;
      case 'contain':
        return FastImage.resizeMode.contain;
      case 'stretch':
        return FastImage.resizeMode.stretch;
      default:
        return FastImage.resizeMode.cover;
    }
  };

  // Оптимізуємо зображення при зміні URI
  useEffect(() => {
    let isMounted = true;

    const optimizeImage = async () => {
      // Якщо URI не вказано, не робимо нічого
      if (!uri) {
        setOptimizedUri(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Оптимізуємо зображення через сервіс
        const result = await imageOptimizationService.optimizeImage(uri, optimizationOptions);
        
        if (isMounted) {
          setOptimizedUri(result.optimizedUri);
          setLoading(false);
          onLoad?.();
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error('Помилка при оптимізації зображення:', error);
        
        if (isMounted) {
          setOptimizedUri(uri); // Використовуємо оригінальний URI у випадку помилки
          setError(error);
          setLoading(false);
          onError?.(error);
        }
      }
    };

    optimizeImage();

    return () => {
      isMounted = false;
    };
  }, [uri]);

  // Якщо URI не вказано і потрібно показати плейсхолдер
  if ((!uri || error) && showPlaceholder) {
    return (
      <View 
        style={[
          styles.placeholder, 
          { width, height },
          style
        ]}
      >
        {placeholderIcon}
        <Text style={styles.placeholderText}>{error ? 'Помилка завантаження' : placeholderText}</Text>
      </View>
    );
  }

  // Якщо зображення завантажується
  if (loading) {
    return (
      <View 
        style={[
          styles.placeholder, 
          { width, height },
          style
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Якщо є оптимізований URI, відображаємо зображення
  return (
    <FastImage
      source={{
        uri: optimizedUri || uri || '',
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable
      }}
      style={[{ width, height }, style]}
      resizeMode={getFastImageResizeMode()}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden'
  },
  placeholderText: {
    color: colors.textLight,
    marginTop: 8,
    fontSize: 14
  }
});

export default OptimizedImage;