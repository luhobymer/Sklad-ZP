import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import SafeFlatList from './common/SafeFlatList';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Part } from '../models/Part';
import { colors, spacing } from '../theme/theme';
import Button from './Button';
import FileStorageService from '../services/FileStorageService';
import { Logger } from '../utils/logger';

const logger = new Logger({ name: 'CarCompatibilityView' });

interface CarCompatibilityViewProps {
  part: Part;
  isVisible: boolean;
  onClose: () => void;
  onCarSelect: (carModel: string) => void;
}

interface CarWithParts {
  carModel: string;
  partsCount: number;
  availableParts: Part[];
}

const CarCompatibilityView: React.FC<CarCompatibilityViewProps> = ({
  part,
  isVisible,
  onClose,
  onCarSelect
}) => {
  const [compatibleCars, setCompatibleCars] = useState<CarWithParts[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible && part.compatibleCars) {
      loadCompatibleCarsData();
    }
  }, [isVisible, part]);

  const loadCompatibleCarsData = async () => {
    try {
      setLoading(true);
      const storageService = FileStorageService.getInstance();
      
      if (!storageService || !part.compatibleCars) {
        return;
      }

      const allParts = await storageService.getAllParts();
      const carsData: CarWithParts[] = [];

      // Для кожного автомобіля, сумісного з поточною запчастиною
      for (const carModel of part.compatibleCars) {
        // Знаходимо всі запчастини, сумісні з цим автомобілем
        const availableParts = allParts.filter(p => 
          p.compatibleCars && 
          p.compatibleCars.some(car => 
            car.toLowerCase().includes(carModel.toLowerCase())
          ) &&
          p.quantity > 0 // Тільки наявні запчастини
        );

        carsData.push({
          carModel,
          partsCount: availableParts.length,
          availableParts
        });
      }

      // Сортуємо за кількістю доступних запчастин
      carsData.sort((a, b) => b.partsCount - a.partsCount);
      setCompatibleCars(carsData);
    } catch (error) {
      logger.error('Помилка при завантаженні даних про сумісні автомобілі:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити дані про сумісні автомобілі');
    } finally {
      setLoading(false);
    }
  };

  const handleCarPress = (carModel: string) => {
    onCarSelect(carModel);
    onClose();
  };

  const renderCarItem = ({ item }: { item: CarWithParts }) => (
    <TouchableOpacity
      style={styles.carItem}
      onPress={() => handleCarPress(item.carModel)}
    >
      <View style={styles.carInfo}>
        <Text style={styles.carModel}>{item.carModel}</Text>
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

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Сумісні автомобілі</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Автомобілі, сумісні з запчастиною "{part.name}"
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Завантаження...</Text>
          </View>
        ) : compatibleCars.length > 0 ? (
          <SafeFlatList<{ carModel: string; partsCount: number; availableParts: Part[] }>
            data={(Array.isArray(compatibleCars) ? compatibleCars : []) as { carModel: string; partsCount: number; availableParts: Part[] }[]}
            renderItem={renderCarItem as unknown as (info: { item: { carModel: string; partsCount: number; availableParts: Part[] }; index: number }) => React.ReactElement | null}
            keyExtractor={(item) => item.carModel}
            style={styles.list}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Немає інформації про сумісні автомобілі
            </Text>
          </View>
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
    maxHeight: '80%',
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    padding: spacing.md,
    paddingTop: spacing.sm,
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
  carModel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  partsCount: {
    fontSize: 14,
    color: colors.textLight,
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

export default CarCompatibilityView;