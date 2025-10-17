import React, { useState, useEffect } from 'react';
import { StatusBar, ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
// Removed styled-components provider to avoid runtime dependency issues
import AppNavigator from '../navigation/AppNavigator';
import { ThemeProvider, useTheme } from '../theme/ThemeContext';

/**
 * Content component that is rendered after theme initialization
 */
const AppContent: React.FC = () => {
  const { theme, isDark } = useTheme();
  
  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <NavigationContainer theme={DefaultTheme}>
        <AppNavigator />
      </NavigationContainer>
    </>
  );
};

/**
 * Root component that handles app initialization, theming, and navigation setup.
 * This component should be the top-level component in your app.
 */
const AppRoot: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Simulate initialization delay to ensure theme is properly loaded
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 1000); // Збільшено час очікування для гарантованого завантаження теми

    return () => clearTimeout(timer);
  }, []);

  if (!isInitialized) {
    return (
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Завантаження...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333333'
  }
});



export default AppRoot;
