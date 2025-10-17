import { Platform, ViewStyle, TextStyle } from 'react-native';
import { MD3LightTheme as PaperMD3LightTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

// Create a custom MD3LightTheme based on react-native-paper's theme
const MD3LightTheme: MD3Theme = {
  ...PaperMD3LightTheme,
  colors: {
    ...PaperMD3LightTheme.colors,
    // Add any additional color overrides here if needed
  },
  roundness: 4,
  animation: {
    scale: 1.0,
  },
};

// Re-export for backward compatibility
export { MD3LightTheme };

// Використовуємо офіційний тип MD3Theme з react-native-paper

// Create our own theme types to avoid direct dependency on react-native-paper types
const createTheme = (colors: any) => ({
  colors,
  // Add other theme properties as needed
  roundness: 4,
  animation: {
    scale: 1.0,
  },
  // Add font configuration
  fonts: {
    regular: {
      fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    },
    medium: {
      fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
    },
    light: {
      fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-light' }),
    },
    thin: {
      fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-thin' }),
    },
  },
  // Add typography variants
  fontSizes: {
    h1: 32,
    h2: 24,
    h3: 20,
    body: 16,
    caption: 14,
  },
  fontWeights: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
  // Add spacing
  spacing: {
    xs: 4,
    sm: 8,
    small: 12,
    md: 16,
    medium: 20,
    lg: 24,
    xl: 32,
  },
  // Add other theme properties
  dark: false,
  mode: 'adaptive',
});

// Create light and dark themes
const createLightTheme = (colors: any) => ({
  ...createTheme(colors),
  dark: false,
  mode: 'adaptive',
});

const createDarkTheme = (colors: any) => ({
  ...createTheme(colors),
  dark: true,
  mode: 'adaptive',
});

// Type definitions
export interface AppColors {
  // Brand colors
  primary: string;
  primaryContainer: string;
  onPrimary: string;
  onPrimaryContainer: string;
  
  // Secondary colors
  secondary: string;
  secondaryContainer: string;
  onSecondary: string;
  onSecondaryContainer: string;
  
  // Background colors
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  
  // Error colors
  error: string;
  errorContainer: string;
  onError: string;
  onErrorContainer: string;
  errorBackground: string;
  
  // Status colors
  success: string;
  warning: string;
  info: string;
  danger: string;
  
  // Outline
  outline: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  textLight: string;
  
  // UI colors
  border: string;
  divider: string;
  backdrop: string;
  
  // Elevation colors
  elevation: {
    level0: string;
    level1: string;
    level2: string;
    level3: string;
    level4: string;
    level5: string;
  };
  
  // Additional colors
  overlay: string;
  shadow: string;
  
  // Custom colors
  card: string;
  notification: string;
  
  // Status bar
  statusBar: string;
  
  // Navigation
  navigation: string;
  onNavigation: string;
  
  // Input
  inputBackground: string;
  inputPlaceholder: string;
  inputText: string;
  inputBorder: string;
  
  // Buttons
  buttonPrimary: string;
  buttonPrimaryText: string;
  buttonSecondary: string;
  buttonSecondaryText: string;
  buttonDisabled: string;
  buttonDisabledText: string;
  
  // Icons
  icon: string;
  iconInactive: string;
  
  // Tabs
  tabBar: string;
  tabBarActive: string;
  tabBarInactive: string;
  tabBarBorder: string;
  
  // List items
  listItem: string;
  listItemPressed: string;
  listItemSelected: string;
  
  // Chips
  chip: string;
  chipText: string;
  chipOutline: string;
  
  // Badges
  badge: string;
  badgeText: string;
  
  // Loading indicators
  loadingIndicator: string;
  loadingBackground: string;
  
  // Transparent colors
  transparent: string;
  
  // Gradients
  gradientStart: string;
  gradientEnd: string;
  
  // Shadows
  shadowColor: string;
  
  // Opacity
  opacity: {
    disabled: number;
    medium: number;
    high: number;
  };
}

// Base colors
export const baseColors = {
  // Brand colors
  primary: '#8B1F41', // Cherry red
  secondary: '#C0C0C0', // Silver
  
  // Status colors
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  info: '#007AFF',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

// Light theme colors
export const lightColors: AppColors = {
  // Brand colors
  primary: baseColors.primary,
  primaryContainer: '#FFDAD6',
  onPrimary: baseColors.white,
  onPrimaryContainer: '#41000A',
  
  // Secondary colors
  secondary: baseColors.secondary,
  secondaryContainer: '#E8E8E8',
  onSecondary: baseColors.white,
  onSecondaryContainer: '#1E1B1B',
  
  // Background colors
  background: baseColors.white,
  onBackground: baseColors.gray[900],
  surface: baseColors.gray[50],
  onSurface: baseColors.gray[900],
  surfaceVariant: baseColors.gray[100],
  onSurfaceVariant: baseColors.gray[700],
  
  // Error colors
  error: baseColors.error,
  errorContainer: '#FFDAD6',
  onError: baseColors.white,
  onErrorContainer: '#410002',
  errorBackground: '#FFEBEE',
  
  // Status colors
  success: baseColors.success,
  warning: baseColors.warning,
  info: baseColors.info,
  danger: baseColors.error,
  
  // Outline
  outline: baseColors.gray[400],
  
  // Text colors
  text: baseColors.gray[900],
  textSecondary: baseColors.gray[700],
  textTertiary: baseColors.gray[500],
  textDisabled: baseColors.gray[400],
  textLight: baseColors.gray[600],
  
  // UI colors
  border: baseColors.gray[300],
  divider: baseColors.gray[200],
  backdrop: 'rgba(0, 0, 0, 0.5)',
  
  // Elevation colors
  elevation: {
    level0: 'transparent',
    level1: 'rgb(250, 242, 242)',
    level2: 'rgb(247, 237, 237)',
    level3: 'rgb(244, 232, 232)',
    level4: 'rgb(242, 230, 230)',
    level5: 'rgb(240, 226, 226)',
  },
  
  // Additional colors
  overlay: 'rgba(0, 0, 0, 0.12)',
  shadow: baseColors.black,
  
  // Custom colors
  card: baseColors.white,
  notification: baseColors.error,
  
  // Status bar
  statusBar: 'rgba(255, 255, 255, 0.7)',
  
  // Navigation
  navigation: baseColors.white,
  onNavigation: baseColors.gray[900],
  
  // Input
  inputBackground: baseColors.gray[100],
  inputPlaceholder: baseColors.gray[500],
  inputText: baseColors.gray[900],
  inputBorder: baseColors.gray[400],
  
  // Buttons
  buttonPrimary: baseColors.primary,
  buttonPrimaryText: baseColors.white,
  buttonSecondary: baseColors.gray[200],
  buttonSecondaryText: baseColors.gray[900],
  buttonDisabled: baseColors.gray[300],
  buttonDisabledText: baseColors.gray[500],
  
  // Icons
  icon: baseColors.gray[700],
  iconInactive: baseColors.gray[500],
  
  // Tabs
  tabBar: baseColors.white,
  tabBarActive: baseColors.primary,
  tabBarInactive: baseColors.gray[500],
  tabBarBorder: baseColors.gray[200],
  
  // List items
  listItem: baseColors.white,
  listItemPressed: baseColors.gray[100],
  listItemSelected: baseColors.gray[200],
  
  // Chips
  chip: baseColors.gray[200],
  chipText: baseColors.gray[900],
  chipOutline: baseColors.gray[400],
  
  // Badges
  badge: baseColors.error,
  badgeText: baseColors.white,
  
  // Loading indicators
  loadingIndicator: baseColors.primary,
  loadingBackground: 'rgba(255, 255, 255, 0.7)',
  
  // Transparent colors
  transparent: 'transparent',
  
  // Gradients
  gradientStart: baseColors.primary,
  gradientEnd: '#D81B60',
  
  // Shadows
  shadowColor: baseColors.black,
  
  // Opacity
  opacity: {
    disabled: 0.38,
    medium: 0.6,
    high: 0.87,
  },
};

// Dark theme colors
export const darkColors: AppColors = {
  // Brand colors
  primary: '#FFB3B3',
  primaryContainer: '#B2001F',
  onPrimary: '#670019',
  onPrimaryContainer: '#FFDAD6',
  
  // Secondary colors
  secondary: '#CBC5C5',
  secondaryContainer: '#4A4545',
  onSecondary: '#343030',
  onSecondaryContainer: '#E8E8E8',
  
  // Background colors
  background: baseColors.gray[900],
  onBackground: baseColors.gray[100],
  surface: baseColors.gray[800],
  onSurface: baseColors.gray[100],
  surfaceVariant: baseColors.gray[700],
  onSurfaceVariant: baseColors.gray[300],
  
  // Error colors
  error: '#FFB4AB',
  errorContainer: '#93000A',
  onError: '#690005',
  onErrorContainer: '#FFDAD6',
  errorBackground: '#FFCDD2',
  
  // Status colors
  success: '#6FCF97',
  warning: '#FFB74D',
  info: '#64B5F6',
  danger: '#FFB4AB',
  
  // Outline
  outline: baseColors.gray[600],
  
  // Text colors
  text: baseColors.gray[100],
  textSecondary: baseColors.gray[300],
  textTertiary: baseColors.gray[500],
  textDisabled: baseColors.gray[600],
  textLight: baseColors.gray[400],
  
  // UI colors
  border: baseColors.gray[700],
  divider: baseColors.gray[800],
  backdrop: 'rgba(0, 0, 0, 0.7)',
  
  // Elevation colors
  elevation: {
    level0: 'transparent',
    level1: 'rgb(42, 26, 28)',
    level2: 'rgb(49, 30, 32)',
    level3: 'rgb(56, 33, 36)',
    level4: 'rgb(58, 34, 37)',
    level5: 'rgb(62, 37, 40)',
  },
  
  // Additional colors
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: baseColors.black,
  
  // Custom colors
  card: baseColors.gray[800],
  notification: '#FF8A80',
  
  // Status bar
  statusBar: 'rgba(30, 30, 30, 0.7)',
  
  // Navigation
  navigation: baseColors.gray[800],
  onNavigation: baseColors.gray[100],
  
  // Input
  inputBackground: baseColors.gray[700],
  inputPlaceholder: baseColors.gray[500],
  inputText: baseColors.gray[100],
  inputBorder: baseColors.gray[600],
  
  // Buttons
  buttonPrimary: baseColors.primary,
  buttonPrimaryText: baseColors.gray[900],
  buttonSecondary: baseColors.gray[700],
  buttonSecondaryText: baseColors.gray[100],
  buttonDisabled: baseColors.gray[700],
  buttonDisabledText: baseColors.gray[500],
  
  // Icons
  icon: baseColors.gray[300],
  iconInactive: baseColors.gray[600],
  
  // Tabs
  tabBar: baseColors.gray[800],
  tabBarActive: baseColors.primary,
  tabBarInactive: baseColors.gray[500],
  tabBarBorder: baseColors.gray[700],
  
  // List items
  listItem: baseColors.gray[800],
  listItemPressed: baseColors.gray[700],
  listItemSelected: baseColors.gray[600],
  
  // Chips
  chip: baseColors.gray[700],
  chipText: baseColors.gray[100],
  chipOutline: baseColors.gray[500],
  
  // Badges
  badge: baseColors.error,
  badgeText: baseColors.white,
  
  // Loading indicators
  loadingIndicator: baseColors.primary,
  loadingBackground: 'rgba(0, 0, 0, 0.7)',
  
  // Transparent colors
  transparent: 'transparent',
  
  // Gradients
  gradientStart: baseColors.primary,
  gradientEnd: '#FF4081',
  
  // Shadows
  shadowColor: baseColors.black,
  
  // Opacity
  opacity: {
    disabled: 0.38,
    medium: 0.6,
    high: 0.87,
  },
};

// Create and export the themes
export const lightTheme = createLightTheme(lightColors);

export const darkTheme = createDarkTheme(darkColors);

export type AppTheme = typeof lightTheme;

export const spacing = {
  xs: 4,
  sm: 8,
  small: 12,
  md: 16,
  medium: 20,
  lg: 24,
  xl: 32
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold'
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  h3: {
    fontSize: 20,
    fontWeight: '600'
  },
  body: {
    fontSize: 16
  },
  caption: {
    fontSize: 14
  }
};

// Конфігурація шрифтів
const fontConfig = {
  labelSmall: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelMedium: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelLarge: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  bodyMedium: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodyLarge: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  titleSmall: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  titleMedium: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  titleLarge: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
    fontSize: 22,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 28,
  },
  headlineSmall: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    fontSize: 24,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 32,
  },
  headlineMedium: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    fontSize: 28,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineLarge: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    fontSize: 32,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 40,
  },
  displaySmall: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    fontSize: 36,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 44,
  },
  displayMedium: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    fontSize: 45,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 52,
  },
  displayLarge: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    fontSize: 57,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 64,
  },
};

// Конфігурація шрифтів для теми навігації
const navigationFontConfig = {
  displayLarge: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    fontSize: 57,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 64,
  },
  displayMedium: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    fontSize: 45,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 52,
  },
  displaySmall: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    fontSize: 36,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 44,
  },
  headlineLarge: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    fontSize: 32,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 40,
  },
  headlineMedium: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    fontSize: 28,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineSmall: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    fontSize: 24,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 32,
  },
  titleLarge: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
    fontSize: 22,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 28,
  },
  titleMedium: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  titleSmall: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelLarge: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelMedium: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelSmall: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  bodyLarge: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  default: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    fontWeight: '400',
    letterSpacing: 0,
  },
};

// Головна тема додатку
const theme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 4,
  colors: {
    ...MD3LightTheme.colors,
    primary: lightColors.primary,
    secondary: lightColors.secondary,
    background: lightColors.background,
    surface: lightColors.surface,
    onSurface: lightColors.text,
    error: lightColors.error,
    onError: '#FFFFFF',
    onBackground: lightColors.text,
    onSurfaceVariant: lightColors.textSecondary,
    outline: lightColors.border,
    elevation: {
      level0: 'transparent',
      level1: '#f8f9fa',
      level2: '#f1f3f5',
      level3: '#e9ecef',
      level4: '#dee2e6',
      level5: '#ced4da',
    },
  },
  // Видаляємо fonts з теми, оскільки воно викликає помилки
  // Шрифти будуть використовуватися через стилі компонентів
  animation: {
    scale: 1.0,
  },
};

// Тіні для використання у компонентах
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 4,
  }
};

// Тема для навігації
export const navigationTheme = {
  dark: false,
  colors: {
    primary: lightColors.primary,
    background: lightColors.background,
    card: lightColors.surface,
    text: lightColors.text,
    border: lightColors.border,
    notification: lightColors.error,
  },
  // Додаємо конфігурацію шрифтів для навігації
  ...navigationFontConfig,
};

// Export colors for backward compatibility
export const colors = lightColors;

export { theme };