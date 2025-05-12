import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import PartsList from './src/components/PartsList';
import PartDetails from './src/components/PartDetails';
import PartForm from './src/components/PartForm';
import CameraScanner from './src/components/CameraScanner';
import ViewHistory from './src/components/ViewHistory';
import Dashboard from './src/components/Dashboard';
import { Part } from './src/models/Part';
import { colors } from './src/theme/theme';
import FileStorageService from './src/services/FileStorageService';

// Типи для параметрів навігації
export type RootStackParamList = {
  Dashboard: undefined;
  PartsList: { filter?: string };
  PartDetails: { part: Part; analogs?: Part[] };
  PartForm: { initialPart?: Partial<Part> };
  CameraScanner: { onTextRecognized: (text: string) => void };
  ViewHistory: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        const storageService = FileStorageService.getInstance();
        await storageService.initialize();
        setIsLoading(false);
      } catch (error) {
        console.error('Помилка при ініціалізації сховища:', error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    initializeStorage();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Завантаження...</Text>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Не вдалося ініціалізувати сховище даних.</Text>
        <Text style={styles.errorSubText}>Будь ласка, перезапустіть додаток.</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{ title: 'Домашній екран' }}
        />
        <Stack.Screen
          name="PartsList"
          component={PartsList}
          options={{ title: 'Список запчастин' }}
        />
        <Stack.Screen
          name="PartDetails"
          component={PartDetails}
          options={{ title: 'Деталі запчастини' }}
        />
        <Stack.Screen
          name="PartForm"
          component={PartForm}
          options={{ title: 'Додати/Редагувати запчастину' }}
        />
        <Stack.Screen
          name="CameraScanner"
          component={CameraScanner}
          options={{ title: 'Сканер' }}
        />
        <Stack.Screen
          name="ViewHistory"
          component={ViewHistory}
          options={{ title: 'Історія переглядів' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.text,
    marginTop: 20,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorSubText: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
  },
});