import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, spacing, shadows } from '../theme/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined';
  onPress?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'elevated',
  onPress
}) => {
  const cardStyles = [
    styles.card,
    variant === 'elevated' ? styles.cardElevated : styles.cardOutlined,
    style
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyles} onPress={onPress}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    marginVertical: spacing.xs,
    marginHorizontal: spacing.xs,
  },
  cardElevated: {
    ...shadows.small,
  },
  cardOutlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export default Card;