import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Part } from '../models/Part';
import { colors, spacing } from '../theme/theme';
import Button from './Button';
import PartCard from './PartCard';
import FileStorageService from '../services/FileStorageService';
import { Logger } from '../utils/logger';

const logger = new Logger({ name: 'CarSearchView' });

interface CarSearchViewProps {
  isVisible: boolean;
  onClose: () => void;
  onPartSelect: (part: Part) => void;
}

interface CarModel {
  name: string;
  partsCount: number;
}

const CarSearchView: React.FC<CarSearchViewProps> = ({
  isVisible,
  onClose,
  onPartSelect
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [availableCars, setAvailableCars] = useState<CarModel[]>([]);
  const [selectedCar, setSelectedCar] = useState<string | null>(null);
  const [carParts, setCarParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCarList, setShowCarList] = useState(true);

  useEffect(() => {
    if (isVisible) {
      loadAvailableCars();
      setSelectedCar(null);
      setShowCarList(true);
      setSearchQuery('');
      logger.info('CarSearchView opened: resetting state');
    }
  }, [isVisible]);

  const loadAvailableCars = async () => {
    try {
      setLoading(true);
      const storageService = FileStorageService.getInstance();
      
      if (!storageService) {
        throw new Error('Сховище не ініціалізовано');
      }

      const allParts = await storageService.getAllParts();
      logger.info('loadAvailableCars: parts loaded', allParts?.length ?? 0);
      const carModelsMap = new Map<string, number>();

      // Збираємо всі унікальні моделі автомобілів та підраховуємо кількість запчастин
      allParts.forEach(part => {
        if (part.compatibleCars && part.quantity > 0) {
          part.compatibleCars.forEach(car => {
            const carName = car.trim();
            carModelsMap.set(carName, (carModelsMap.get(carName) || 0) + 1);
          });
        }
      });

      // Конвертуємо в масив та сортуємо за кількістю запчастин
      const carsArray: CarModel[] = Array.from(carModelsMap.entries())
        .map(([name, partsCount]) => ({ name, partsCount }))
        .sort((a, b) => b.partsCount - a.partsCount);

      setAvailableCars(carsArray);
      logger.info('loadAvailableCars: cars computed', carsArray.length);
    } catch (error) {
      logger.error('Помилка при завантаженні списку автомобілів:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити список автомобілів');
    } finally {
      setLoading(false);
    }
  };

  const loadPartsForCar = async (carModel: string) => {
    try {
      setLoading(true);
      const storageService = FileStorageService.getInstance();
      
      if (!storageService) {
        throw new Error('Сховище не ініціалізовано');
      }

      const allParts = await storageService.getAllParts();
      logger.info('loadPartsForCar: parts loaded', allParts?.length ?? 0, 'car=', carModel);
      
      // Фільтруємо запчастини для вибраного автомобіля
      const filteredParts = allParts.filter(part => 
        part.compatibleCars && 
        part.compatibleCars.some(car => 
          car.toLowerCase().includes(carModel.toLowerCase())
        ) &&
        part.quantity > 0 // Тільки наявні запчастини
      );

      // Сортуємо за назвою
      filteredParts.sort((a, b) => a.name.localeCompare(b.name));
      
      setCarParts(filteredParts);
      setSelectedCar(carModel);
      setShowCarList(false);
      logger.info('loadPartsForCar: filteredParts', filteredParts.length);
    } catch (error) {
      logger.error('Помилка при завантаженні запчастин для автомобіля:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити запчастини для автомобіля');
    } finally {
      setLoading(false);
    }
  };

  const handleCarSelect = (carModel: string) => {
    loadPartsForCar(carModel);
  };

  const handlePartPress = (part: Part) => {
    onPartSelect(part);
    onClose();
  };

  const handleBackToCars = () => {
    setShowCarList(true);
    setSelectedCar(null);
    setCarParts([]);
  };

  const filteredCars = availableCars.filter(car =>
    car.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    logger.info('state changed', {
      loading,
      showCarList,
      availableCars: availableCars.length,
      filteredCars: filteredCars.length,
      selectedCar,
    });
  }, [loading, showCarList, availableCars.length, filteredCars.length, selectedCar]);

  const renderCarItem = ({ item }: { item: CarModel }) => (
    <TouchableOpacity
      style={styles.carItem}
      onPress={() => handleCarSelect(item.name)}
    >
      <View style={styles.carInfo}>
        <Text style={styles.carName}>{item.name}</Text>
        <Text style={styles.partsCount}>
          {item.partsCount} запчастин на складі
        </Text>
      </View>
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={colors.textLight} 
      />
    </TouchableOpacity>
  );

  const renderPartItem = ({ item }: { item: Part }) => (
    <TouchableOpacity
      style={styles.partItem}
      onPress={() => handlePartPress(item)}
    >
      <PartCard
        part={item}
        onPress={() => handlePartPress(item)}
        showImage={false}
      />
    </TouchableOpacity>
  );

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          {!showCarList && (
            <TouchableOpacity onPress={handleBackToCars} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
          <Text style={styles.title}>
            {showCarList ? 'Пошук по автомобілях' : `Запчастини для ${selectedCar}`}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {showCarList && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Пошук автомобіля..."
              placeholderTextColor={colors.textLight}
            />
            <Ionicons 
                name="search" 
                size={20} 
                color={colors.textLight}
              />
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Завантаження...</Text>
          </View>
        ) : showCarList ? (
          filteredCars.length > 0 ? (
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {(Array.isArray(filteredCars) ? filteredCars : []).map((item) => (
                <View key={item.name}>
                  {renderCarItem({ item })}
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Автомобілі не знайдені' : 'Немає доступних автомобілів'}
              </Text>
            </View>
          )
        ) : (
          carParts.length > 0 ? (
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {(Array.isArray(carParts) ? carParts : []).map((item) => (
                <View key={item.id.toString()}>
                  {renderPartItem({ item })}
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Немає доступних запчастин для цього автомобіля
              </Text>
            </View>
          )
        )}

        <View style={styles.footer}>
          <Button
            title="Закрити"
            onPress={onClose}
            variant="secondary"
            size="medium"
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: colors.text,
  },
  searchIcon: {
    marginLeft: spacing.sm,
  },
  list: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  carItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  carInfo: {
    flex: 1,
  },
  carName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  partsCount: {
    fontSize: 14,
    color: colors.textLight,
  },
  partItem: {
    marginBottom: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  footer: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
});

export default CarSearchView;