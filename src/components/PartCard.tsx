import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Part } from '../models/Part';
import { colors, spacing, typography } from '../theme/theme';

interface PartCardProps {
  part: Part;
  onPress: () => void;
}

const PartCard: React.FC<PartCardProps> = ({ part, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {part.photoPath && (
        <Image 
          source={{ uri: part.photoPath }} 
          style={styles.image} 
          resizeMode="cover" 
        />
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.articleNumber}>{part.articleNumber}</Text>
          {part.isNew && <Text style={styles.newBadge}>Нова</Text>}
        </View>
        <Text style={styles.name} numberOfLines={1}>{part.name}</Text>
        <Text style={styles.manufacturer}>{part.manufacturer}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>{part.price} ₴</Text>
          <Text style={styles.quantity}>Кількість: {part.quantity}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  articleNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  newBadge: {
    fontSize: 12,
    backgroundColor: colors.primary,
    color: 'white',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  manufacturer: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  quantity: {
    fontSize: 14,
    color: colors.textLight,
  },
});

export default PartCard;