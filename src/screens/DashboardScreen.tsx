import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../theme/ThemeContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Швидкі дії дашборду
const quickActions: Array<{
  id: string;
  title: string;
  icon: string;
  screen: keyof RootStackParamList;
  params?: Record<string, unknown>;
}> = [
  { id: '0', title: 'Всі запчастини', icon: 'format-list-bulleted', screen: 'PartsList' },
  { id: '0b', title: 'Пошук по авто', icon: 'car', screen: 'PartsList', params: { focusCar: true } },
  { id: '1', title: 'Додати запчастину', icon: 'plus-circle', screen: 'PartForm' },
  { id: '3', title: 'Резервні копії', icon: 'cloud-upload', screen: 'GoogleDrive' },
  { id: '4', title: 'Налаштування', icon: 'cog', screen: 'Settings' },
];

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalParts: 0,
    lowStock: 0,
    recentAdditions: 0,
    categories: 0,
  });

  // Load dashboard data
  useEffect(() => {
    const loadData = async () => {
      try {
        // TODO: Replace with actual data fetching
        setTimeout(() => {
          setStats({
            totalParts: 124,
            lowStock: 8,
            recentAdditions: 5,
            categories: 12,
          });
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        Alert.alert('Помилка', 'Не вдалося завантажити дані');
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleQuickAction = (action: typeof quickActions[number]) => {
    navigation.navigate(action.screen as any, action.params as any);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text>Завантаження...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Склад Автозапчастин
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Вітаємо! Сьогодні {new Date().toLocaleDateString('uk-UA')}
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stats.totalParts}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Всього запчастин</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.statValue, { color: theme.colors.error }]}>{stats.lowStock}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Малий залишок</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>{stats.recentAdditions}+</Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Новинки</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.statValue, { color: theme.colors.secondary }]}>{stats.categories}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Категорії</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Швидкі дії
        </Text>
        <View style={styles.quickActions}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
              onPress={() => handleQuickAction(action)}
            >
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                <MaterialCommunityIcons 
                  name={action.icon as any} 
                  size={24} 
                  color={theme.colors.primary} 
                />
              </View>
              <Text style={[styles.actionText, { color: theme.colors.text }]}>
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Нещодавня активність
        </Text>
        <View style={[styles.activityCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.activityText, { color: theme.colors.onSurfaceVariant }]}>
            Останні дії будуть відображатися тут
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  activityCard: {
    padding: 16,
    borderRadius: 12,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default DashboardScreen;
