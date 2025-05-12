import { DefaultTheme } from '@react-navigation/native';

export const colors = {
  primary: '#8B1F41', // вишневий
  secondary: '#C0C0C0', // сріблястий
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#333333',
  textLight: '#666666',
  border: '#DDDDDD',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500'
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
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

export const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border
  }
};

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