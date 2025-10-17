import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
type AnyStyle = any; // Додаємо імпорт типів для стилів
import { colors, spacing, typography } from '../theme/theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: AnyStyle;
  textStyle?: AnyStyle;
}

interface ButtonStyles {
  button: AnyStyle;
  buttonSmall: AnyStyle;
  buttonMedium: AnyStyle;
  buttonLarge: AnyStyle;
  buttonPrimary: AnyStyle;
  buttonSecondary: AnyStyle;
  buttonDanger: AnyStyle;
  buttonDisabled: AnyStyle;
  text: AnyStyle;
  textSmall: AnyStyle;
  textMedium: AnyStyle;
  textLarge: AnyStyle;
  textPrimary: AnyStyle;
  textSecondary: AnyStyle;
  textDanger: AnyStyle;
  textDisabled: AnyStyle;
}

const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle
}) => {
  const buttonStyles = StyleSheet.compose(
    StyleSheet.compose(
      StyleSheet.compose(
        styles.button,
        styles[`button${size.charAt(0).toUpperCase()}${size.slice(1)}` as keyof typeof styles]
      ),
      variant === 'primary' ? styles.buttonPrimary : 
      variant === 'secondary' ? styles.buttonSecondary : styles.buttonDanger
    ),
    disabled ? styles.buttonDisabled : {}
  ) as AnyStyle;

  const textStyles = StyleSheet.compose(
    StyleSheet.compose(
      styles.text,
      styles[`text${size.charAt(0).toUpperCase()}${size.slice(1)}` as keyof typeof styles]
    ),
    variant === 'primary' ? styles.textPrimary : 
    variant === 'secondary' ? styles.textSecondary : styles.textDanger
  ) as AnyStyle;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyles}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.background : colors.primary}
          size="small"
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSmall: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  buttonMedium: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  buttonLarge: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
  },
  buttonDanger: {
    backgroundColor: colors.error,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    ...typography.body,
    textAlign: 'center',
  },
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 18,
  },
  textPrimary: {
    color: colors.background,
  },
  textSecondary: {
    color: colors.text,
  },
  textDanger: {
    color: colors.background,
  },
  textDisabled: {
    color: colors.textLight,
  },
});

export default Button;