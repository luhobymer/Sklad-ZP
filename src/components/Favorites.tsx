import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SafeFlatList from './common/SafeFlatList';
import { Part } from '../models/Part';
import FileStorageService from '../services/FileStorageService';
import { colors, spacing, typography } from '../theme/theme';
import PartCard from './PartCard';
import Button from './Button';
import { Logger } from '../utils/logger';

// Створюємо логер для Favorites
const logger = new Logger({ name: 'Favorites' });


interface FavoritesProps {
  onPartSelect: (part: Part) => void;
}

export const Favorites: React.FC<FavoritesProps> = ({ onPartSelect }) => {
  const [favorites, setFavorites] = useState<Part[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const storageService = FileStorageService.getInstance();
      const favoriteParts = await storageService.getFavorites();
      setFavorites(favoriteParts);
    } catch (error) {
      logger.error('Помилка при завантаженні обраних запчастин:', error);
    }
  };

  const removeFromFavorites = async (partId: number) => {
    try {
      const storageService = FileStorageService.getInstance();
      await storageService.removeFromFavorites(partId);
      await loadFavorites(); // Оновлюємо список після видалення
    } catch (error) {
      logger.error('Помилка при видаленні з обраних:', error);
    }
  };

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Список обраних запчастин порожній</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Обрані запчастини</Text>
      <SafeFlatList<Part>
        data={Array.isArray(favorites) ? favorites : []}
        keyExtractor={(item) => item.id?.toString() || ''}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <PartCard
              part={item}
              onPress={() => onPartSelect(item)}
            />
            <Button
              title="Видалити з обраних"
              onPress={() => item.id && removeFromFavorites(item.id)}
              variant="secondary"
              size="small"
              style={styles.removeButton}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md as number,
    textAlign: 'center' as const,
    fontFamily: 'System',
    fontWeight: '600' as const,
  },
  listContent: {
    padding: spacing.sm
  },
  itemContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  removeButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.danger,
    padding: spacing.sm,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: 'bold' as const,
    fontFamily: 'System',
    alignSelf: 'flex-end'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background
  },
  emptyText: {
    ...typography.body,
    color: colors.textLight,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 'normal' as const
  }
});

export default Favorites;