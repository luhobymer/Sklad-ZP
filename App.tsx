import React, { useEffect, useState, ErrorInfo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator, StyleSheet, LogBox } from 'react-native';
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

// Ігноруємо деякі попередження, які можуть призводити до проблем
LogBox.ignoreLogs([
  'Require cycle:',
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

// Встановлюємо обробник помилок для необроблених помилок
const handleError = (error: Error, errorInfo: any) => {
  console.log('Помилка в додатку:', error);
  console.log('Додаткова інформація:', errorInfo);
};

// Використовуємо try-catch для всіх критичних операцій
// Це допоможе запобігти неочікуваному закриттю додатку

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        console.log('Початок ініціалізації сховища');
        const storageService = FileStorageService.getInstance();
        await storageService.initialize();
        console.log('Сховище ініціалізовано успішно');
        setIsLoading(false);
      } catch (error) {
        console.error('Помилка при ініціалізації сховища:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Невідома помилка');
        setHasError(true);
        setIsLoading(false);
      }
    };

    // Обгортаємо в try-catch для додаткової безпеки
    try {
      initializeStorage();
    } catch (error) {
      console.error('Критична помилка при ініціалізації:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Критична помилка');
      setHasError(true);
      setIsLoading(false);
    }
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
        {errorMessage ? <Text style={styles.errorDetails}>{errorMessage}</Text> : null}
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