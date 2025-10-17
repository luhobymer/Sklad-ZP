import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';

// Screens
import Dashboard from '../components/Dashboard';
import PartsList from '../components/PartsList';
import PartDetailsScreen from '../screens/PartDetailsScreen';
import PartFormScreen from '../components/PartForm';

import ViewHistoryScreen from '../screens/ViewHistoryScreen';
import GoogleDriveScreen from '../screens/GoogleDriveScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Types
export type RootStackParamList = {
  Dashboard: undefined;
  PartsList: { category?: string; car?: string; focusCar?: boolean } | undefined;
  PartDetails: { partId: string };
  PartForm: { partId?: string; onSave?: () => void };

  ViewHistory: undefined;
  GoogleDrive: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator();

/**
 * Main application navigator that defines the navigation structure
 */
const AppNavigator: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.onPrimary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
          animation: 'slide_from_right',
        }}
      >
          <Stack.Screen
            name="Dashboard"
            component={Dashboard}
            options={{ title: 'Головна', headerShown: false }}
          />
          <Stack.Screen
            name="PartsList"
            component={PartsList}
            options={({ route }: { route: any }) => ({
              title: route?.params?.category || 'Всі запчастини',
            })}
          />
          <Stack.Screen
            name="PartDetails"
            component={PartDetailsScreen}
            options={{ title: 'Деталі запчастини' }}
          />
          <Stack.Screen
            name="PartForm"
            component={PartFormScreen}
            options={({ route }: { route: any }) => ({
              title: route?.params?.partId ? 'Редагувати' : 'Нова запчастина',
            })}
          />
          <Stack.Screen
            name="ViewHistory"
            component={ViewHistoryScreen}
            options={{ title: 'Історія переглядів' }}
          />
          <Stack.Screen
            name="GoogleDrive"
            component={GoogleDriveScreen}
            options={{ title: 'Google Диск' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Налаштування', presentation: 'modal' }}
          />
      </Stack.Navigator>
  );
};

export default AppNavigator;
