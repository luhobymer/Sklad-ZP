import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Part } from '../models/Part';
import { colors } from '../theme/theme';
import FileStorageService from '../services/FileStorageService';
import PartCard from './PartCard';
import { Ionicons } from '@expo/vector-icons';
import BackupManager from './BackupManager';

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Dashboard: React.FC = () => {
  const navigation = useNavigation<DashboardNavigationProp>();
  const [lowStockParts, setLowStockParts] = useState<Part[]>([]);
  const [recentParts, setRecentParts] = useState<Part[]>([]);
  const [showBackupManager, setShowBackupManager] = useState(false);
  const storageService = FileStorageService.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Отримуємо всі запчастини
      const allParts = await storageService.getAllParts();
      
      // Запчастини, які закінчуються (менше 3 штук)
      const lowStock = allParts.filter(part => part.quantity < 3);
      setLowStockParts(lowStock);
      
      // Останні додані запчастини (до 5 штук)
      const recent = [...allParts]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setRecentParts(recent);
    } catch (error) {
      console.error('Помилка при завантаженні даних для дашборду:', error);
    }
  };

  const renderQuickAccessButton = (
    icon: string, 
    label: string, 
    onPress: () => void,
    color: string = colors.primary
  ) => (
    <TouchableOpacity style={styles.quickAccessButton} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={24} color="white" />
      </View>
      <Text style={styles.quickAccessLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const handleBackupCreated = () => {
    Alert.alert('Успіх', 'Резервну копію успішно створено');
  };

  const handleBackupRestored = () => {
    Alert.alert('Успіх', 'Дані успішно відновлено');
    loadData(); // Оновлюємо дані після відновлення
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Склад Автозапчастин</Text>
        <Text style={styles.subtitle}>Домашній облік</Text>
      </View>

      {/* Швидкий доступ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Швидкий доступ</Text>
        <View style={styles.quickAccessContainer}>
          {renderQuickAccessButton('add-circle-outline', 'Додати запчастину', 
            () => navigation.navigate('PartForm' as any))}
          {renderQuickAccessButton('search-outline', 'Пошук', 
            () => navigation.navigate('PartsList' as any))}
          {renderQuickAccessButton('camera-outline', 'Сканувати', 
            () => navigation.navigate('CameraScanner' as any, { 
              onTextRecognized: (text: string, partInfo?: Partial<Part>) => {
                console.log('Отримано дані з розпізнавання в Dashboard:', text, partInfo);
                
                // Якщо отримано всю інформацію про запчастину
                if (partInfo) {
                  navigation.navigate('PartForm', { 
                    initialPart: partInfo 
                  });
                } else {
                  // Якщо отримано тільки артикул
                  navigation.navigate('PartForm', { 
                    initialPart: { articleNumber: text } as any 
                  });
                }
              }
            }), 
            colors.secondary)}
          {renderQuickAccessButton('list-outline', 'Всі запчастини', 
            () => navigation.navigate('PartsList' as any))}
          {renderQuickAccessButton('save-outline', 'Резервне копіювання', 
            () => setShowBackupManager(true),
            colors.success)}
        </View>
      </View>

      {/* Запчастини, які закінчуються */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Запчастини, які закінчуються</Text>
        {lowStockParts.length > 0 ? (
          <FlatList
            data={lowStockParts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => navigation.navigate('PartDetails', { part: item })}
              >
                <View style={styles.lowStockItem}>
                  <View style={styles.lowStockInfo}>
                    <Text style={styles.lowStockName}>{item.name}</Text>
                    <Text style={styles.lowStockArticle}>{item.articleNumber}</Text>
                  </View>
                  <View style={styles.quantityContainer}>
                    <Text style={styles.quantityText}>{item.quantity} шт.</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.lowStockList}
          />
        ) : (
          <Text style={styles.emptyText}>Всі запчастини в достатній кількості</Text>
        )}
      </View>

      {/* Останні додані */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Останні додані</Text>
        {recentParts.length > 0 ? (
          <FlatList
            data={recentParts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.recentPartCard}
                onPress={() => navigation.navigate('PartDetails', { part: item })}
              >
                <PartCard 
                  part={item} 
                  onPress={() => navigation.navigate('PartDetails', { part: item })}
                />
              </TouchableOpacity>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentPartsList}
          />
        ) : (
          <Text style={styles.emptyText}>Немає доданих запчастин</Text>
        )}
      </View>

      {/* Швидкі фільтри */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Швидкі фільтри</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {['Двигун', 'Гальма', 'Підвіска', 'Електрика', 'Кузов', 'Трансмісія', 'Охолодження'].map((category) => (
            <TouchableOpacity 
              key={category} 
              style={styles.filterButton}
              onPress={() => navigation.navigate('PartsList', { filter: category } as any)}
            >
              <Text style={styles.filterText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Менеджер резервних копій */}
      <BackupManager
        visible={showBackupManager}
        onClose={() => setShowBackupManager(false)}
        onBackupCreated={handleBackupCreated}
        onBackupRestored={handleBackupRestored}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    marginBottom: 20,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.text,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAccessButton: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickAccessLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: colors.text,
  },
  lowStockList: {
    paddingRight: 15,
  },
  lowStockItem: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    width: 180,
    height: 100,
    justifyContent: 'space-between',
  },
  lowStockInfo: {
    flex: 1,
  },
  lowStockName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  lowStockArticle: {
    fontSize: 12,
    color: colors.textLight,
  },
  quantityContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  quantityText: {
    color: 'red',
    fontWeight: 'bold',
  },
  recentPartsList: {
    paddingRight: 15,
  },
  recentPartCard: {
    marginRight: 10,
    width: 200,
  },
  emptyText: {
    color: colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 15,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  filterButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterText: {
    color: colors.text,
    fontWeight: '500',
  },
});

export default Dashboard;
