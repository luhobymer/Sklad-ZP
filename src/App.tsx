import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar, View, Text, StyleSheet } from 'react-native';
import { colors, navigationTheme, theme } from './theme/theme';
import AppNavigator from './navigation/AppNavigator';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider, useTheme } from './theme/ThemeContext';

// Типи для навігації
// Внутрішній компонент, що підтягує тему з ThemeContext і передає її в PaperProvider
const ThemedApp: React.FC = () => {
  // Ми використовуємо MD3-тему з theme.ts, сумісну з PaperProvider
  useTheme(); // зберігаємо підписку на контекст теми для подальшої інтеграції
  return (
    <PaperProvider theme={theme}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AppNavigator />
    </PaperProvider>
  );
};

// Використовуємо тему з theme.ts
const navTheme = {
  ...navigationTheme,
  colors: {
    ...navigationTheme.colors,
    background: colors.background,
  },
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer
          theme={navTheme}
          fallback={
            <View style={styles.loadingContainer}>
              <Text>Завантаження...</Text>
            </View>
          }
        >
          {/* Обгортаємо все у ErrorBoundary, щоб не мати "білого екрана" без повідомлень */}
          <ErrorBoundary>
            <ThemedApp />
          </ErrorBoundary>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
