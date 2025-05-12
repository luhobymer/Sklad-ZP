import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Part } from '../models/Part';
import FileStorageService from '../services/FileStorageService';
import { colors, spacing, typography } from '../theme/theme';
import PartCard from './PartCard';
import Button from './Button';

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
      console.error('Помилка при завантаженні обраних запчастин:', error);
    }
  };

  const removeFromFavorites = async (partId: number) => {
    try {
      const storageService = FileStorageService.getInstance();
      await storageService.removeFromFavorites(partId);
      await loadFavorites(); // Оновлюємо список після видалення
    } catch (error) {
      console.error('Помилка при видаленні з обраних:', error);
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
      <FlatList
        data={favorites}
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
    padding: spacing.md
  },
  listContent: {
    padding: spacing.sm
  },
  itemContainer: {
    marginBottom: spacing.md
  },
  removeButton: {
    marginTop: spacing.xs,
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
    color: colors.textLight
  }
});

export default Favorites;