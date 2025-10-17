/**
 * Тести для навігації
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Dashboard from '../src/components/Dashboard';
import PartsList from '../src/components/PartsList';
import PartDetails from '../src/components/PartDetails';
import { RootStackParamList } from '../src/types/navigation';

// Jest globals are available without explicit import

// Мокуємо компоненти, які не потрібно тестувати повністю
jest.mock('../src/components/PartsList', () => {
  return jest.fn().mockImplementation(({ navigation }: { navigation: any }) => (
    <div data-testid="parts-list-screen">
      <button
        data-testid="view-part-details"
        onClick={() => navigation.navigate('PartDetails', { part: { id: 1, name: 'Тестова запчастина' } })}
      >
        Перейти до деталей запчастини
      </button>
    </div>
  ));
});

jest.mock('../src/components/PartDetails', () => {
  return jest.fn().mockImplementation(({ navigation }: { navigation: any }) => (
    <div data-testid="part-details-screen">
      <button
        data-testid="go-back"
        onClick={() => navigation.goBack()}
      >
        Повернутися назад
      </button>
    </div>
  ));
});

// Створюємо навігаційний стек для тестування
const Stack = createNativeStackNavigator();

const TestNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="PartsList" component={PartsList} />
        <Stack.Screen name="PartDetails" component={PartDetails} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

describe('Навігація', () => {
  test('Можна перейти з Dashboard до PartsList', () => {
    const { getByTestId } = render(<TestNavigator />);
    
    // Знаходимо кнопку для переходу до списку запчастин
    const goToPartsListButton = getByTestId('go-to-parts-list');
    
    // Симулюємо натискання на кнопку
    fireEvent.press(goToPartsListButton);
    
    // Перевіряємо, що ми перейшли до екрану списку запчастин
    expect(getByTestId('parts-list-screen')).toBeTruthy();
  });
  
  test('Можна перейти з PartsList до PartDetails', () => {
    const { getByTestId } = render(<TestNavigator />);
    
    // Спочатку переходимо до списку запчастин
    const goToPartsListButton = getByTestId('go-to-parts-list');
    fireEvent.press(goToPartsListButton);
    
    // Знаходимо кнопку для переходу до деталей запчастини
    const viewPartDetailsButton = getByTestId('view-part-details');
    
    // Симулюємо натискання на кнопку
    fireEvent.press(viewPartDetailsButton);
    
    // Перевіряємо, що ми перейшли до екрану деталей запчастини
    expect(getByTestId('part-details-screen')).toBeTruthy();
  });
  
  test('Можна повернутися з PartDetails до PartsList', () => {
    const { getByTestId } = render(<TestNavigator />);
    
    // Спочатку переходимо до списку запчастин
    const goToPartsListButton = getByTestId('go-to-parts-list');
    fireEvent.press(goToPartsListButton);
    
    // Потім переходимо до деталей запчастини
    const viewPartDetailsButton = getByTestId('view-part-details');
    fireEvent.press(viewPartDetailsButton);
    
    // Знаходимо кнопку для повернення назад
    const goBackButton = getByTestId('go-back');
    
    // Симулюємо натискання на кнопку
    fireEvent.press(goBackButton);
    
    // Перевіряємо, що ми повернулися до екрану списку запчастин
    expect(getByTestId('parts-list-screen')).toBeTruthy();
  });
});
