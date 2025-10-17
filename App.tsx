// @ts-nocheck
import * as React from 'react';
import { useEffect, useState, useMemo, useRef } from 'react';
import { ActivityIndicator, LogBox, Platform, StatusBar, StyleSheet, View, Text, ViewStyle } from 'react-native';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { MD3LightTheme, Provider as PaperProvider, Theme as PaperTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, Theme as NavigationTheme } from '@react-navigation/native';

// Theme and Navigation
import { ThemeProvider as AppThemeProvider, useTheme } from './src/theme/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

// Services and Utils
import FileStorageService from './src/services/FileStorageService';
import ErrorHandler from './src/utils/ErrorHandler';
import { initializeServices } from './src/services/initServices';
import { colors, navigationTheme } from './src/theme/theme';
import AppRoot from './src/components/AppRoot';

// Props types
interface AppContentProps {
  children: React.ReactNode;
}

interface AppContentWrapperProps {
  children: React.ReactNode;
}

interface MainAppProps {}

interface AppWithProvidersProps {}

type JSXComponent = React.JSXElementConstructor<any>;

// Extend the theme types to include our custom theme properties
declare global {
  namespace ReactNativePaper {
    interface ThemeColors {
      // Basic colors
      primary: string;
      onPrimary: string;
      primaryContainer: string;
      onPrimaryContainer: string;
      secondary: string;
      onSecondary: string;
      secondaryContainer: string;
      onSecondaryContainer: string;
      error: string;
      onError: string;
      errorContainer: string;
      onErrorContainer: string;
      background: string;
      onBackground: string;
      surface: string;
      onSurface: string;
      surfaceVariant: string;
      onSurfaceVariant: string;
      outline: string;
      outlineVariant: string;
      shadow: string;
      scrim: string;
      inverseSurface: string;
      inverseOnSurface: string;
      inversePrimary: string;
      elevation: {
        level0: string;
        level1: string;
        level2: string;
        level3: string;
        level4: string;
        level5: string;
      };
    }
    
    interface Theme extends PaperTheme {
      colors: ThemeColors;
    }
  }
}

// Ініціалізація сервісів буде виконана в useEffect

// Ignore specific logs
LogBox.ignoreLogs([
  'Require cycle:',
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
  'VirtualizedLists should never be nested',
]);

// Set up global error handling
ErrorHandler.setupGlobalErrorHandling();

// Error boundary handler
const handleError = (error: Error, errorInfo: any) => {
  console.error('App Error:', error, errorInfo);
  ErrorHandler.handleError(error, { 
    context: {
      componentStack: errorInfo?.componentStack,
      source: 'reactErrorBoundary'
    },
    showAlert: true
  });
};

// Камерні дозволи більше не потрібні — функцію видалено

const App: React.FC = () => {
  return <AppRoot />;
};

// Оригінальний компонент App, який буде використовуватися в AppRoot
const AppOriginal: React.FC<AppOriginalProps> = ({ children, onError }) => {
  useEffect(() => {
    // Error handling setup
    const errorHandler = (error: Error, errorInfo: any) => {
      console.error('App Error:', error, errorInfo);
      onError?.(error, errorInfo);
      
      // Use ErrorHandler to handle the error
      ErrorHandler.handleError(error, {
        context: { source: 'AppOriginal' },
        errorInfo
      });
    };
    
    // Set up global error handler if available (safe access via globalThis)
    const EU: any = (globalThis as any)?.ErrorUtils;
    if (typeof EU !== 'undefined') {
      const originalErrorHandler = EU?.getGlobalHandler?.();
      if (originalErrorHandler) {
        EU?.setGlobalHandler?.(errorHandler);

        return () => {
          // Restore original error handler
          EU?.setGlobalHandler?.(originalErrorHandler);
        };
      }
    }
    
    return () => {};
  }, [onError]);

  // Request necessary permissions on app start
  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        try {
          const permissions = [
            PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
            PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
          ];

          for (const permission of permissions) {
            try {
              const status = await check(permission);
              if (status === RESULTS.DENIED) {
                await request(permission);
              }
            } catch (error) {
              console.error(`Error handling permission ${permission}:`, error);
            }
          }
        } catch (error) {
          console.error('Error in requestPermissions:', error);
        }
      }
    };

    requestPermissions();
  }, []);

  return <>{children}</>;
};

const AppContent: React.FC<AppContentProps> = ({ children }) => {
  const { theme, isDark } = useTheme();
  
  const paperTheme = useMemo<PaperTheme>(() => {
    // Create a deep copy of MD3LightTheme to avoid mutating the original
    const themeCopy = JSON.parse(JSON.stringify(MD3LightTheme));
    
    // Merge the theme colors with our custom colors
    return {
      ...themeCopy,
      colors: {
        ...themeCopy.colors,
        ...theme.colors,
        // Ensure all required color properties are defined
        background: theme.colors.background || themeCopy.colors.background,
        surface: theme.colors.surface || themeCopy.colors.surface,
        text: theme.colors.text || themeCopy.colors.text,
        primary: theme.colors.primary || themeCopy.colors.primary,
        onPrimary: theme.colors.onPrimary || themeCopy.colors.onPrimary,
        primaryContainer: theme.colors.primaryContainer || themeCopy.colors.primaryContainer,
        onPrimaryContainer: theme.colors.onPrimaryContainer || themeCopy.colors.onPrimaryContainer,
        // Add other required color properties with fallbacks
      } as ReactNativePaper.ThemeColors,
    };
  }, [theme]);
  
  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      {children}
    </PaperProvider>
  );
};

const MainApp: React.FC<MainAppProps> = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize storage and handle errors
  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (FileStorageService && typeof FileStorageService.initialize === 'function') {
          await FileStorageService.initialize();
        } else {
          console.warn('FileStorageService.initialize is not available');
        }
      } catch (error) {
        console.error('Failed to initialize storage:', error);
        setHasError(true);
        setErrorMessage('Помилка ініціалізації сховища даних. Будь ласка, перезапустіть додаток.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Show loading indicator
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Завантаження додатку...</Text>
      </View>
    );
  }

  // Define AppContentWrapper component
  const AppContentWrapper: React.FC<AppContentWrapperProps> = ({ children }) => {
    const { theme, isDark } = useTheme();
    
    const paperTheme = useMemo<PaperTheme>(() => ({
      ...MD3LightTheme,
      colors: {
        ...MD3LightTheme.colors,
        ...theme.colors,
        background: theme.colors.background,
        surface: theme.colors.surface,
        text: theme.colors.text,
        primary: theme.colors.primary,
      } as ReactNativePaper.ThemeColors,
    }), [theme]);
    
    return (
      <PaperProvider theme={paperTheme}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        {children}
      </PaperProvider>
    );
  };

  // Show error message if initialization failed
  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    );
  }

  // Navigation theme
  const navigationTheme = {
    dark: false,
    colors: {
      primary: '#007AFF',
      background: '#FFFFFF',
      card: '#F8F8F8',
      text: '#1C1C1E',
    }
  };

  // Create a wrapper component that properly renders the app with all providers
  const AppWithProviders: React.FC<AppWithProvidersProps> = () => {
    // Create a ref for the navigation container
    const navigationRef = useRef(null);
    
    // Navigation theme configuration
    const navigationTheme = useMemo<NavigationTheme>(() => ({
      dark: false,
      colors: {
        primary: '#007AFF',
        background: '#FFFFFF',
        card: '#F8F8F8',
        text: '#1C1C1E',
        border: '#C5C5C7',
        notification: '#FF3B30',
      },
    }), []);

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AppThemeProvider>
            <AppContentWrapper>
              <NavigationContainer 
                ref={navigationRef}
                theme={navigationTheme}
              >
                <AppNavigator />
              </NavigationContainer>
            </AppContentWrapper>
          </AppThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  };

  return <AppWithProviders />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: '#FF3B30',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorSubText: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  errorDetails: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(255,0,0,0.05)',
    borderRadius: 5,
    width: '100%',
  },
});

export default App;
