import React from 'react';
import { ActivityIndicator, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

type LoadingIndicatorProps = {
  /**
   * Size of the loading indicator
   * @default 'small'
   */
  size?: 'small' | 'large' | number;
  
  /**
   * Color of the loading indicator
   * @default theme.colors.primary
   */
  color?: string;
  
  /**
   * Whether to show the loading indicator
   * @default true
   */
  visible?: boolean;
  
  /**
   * Custom style for the container
   */
  style?: ViewStyle;
  
  /**
   * Whether to fill the parent container
   * @default false
   */
  fullScreen?: boolean;
  
  /**
   * Background color of the container
   * @default 'transparent'
   */
  backgroundColor?: string;
};

/**
 * A customizable loading indicator component that shows a spinner.
 * Can be used as a full-screen overlay or inline within a component.
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'small',
  color,
  visible = true,
  style,
  fullScreen = false,
  backgroundColor = 'transparent',
}) => {
  const { theme } = useTheme();
  const indicatorColor = color || theme.colors.primary;
  
  if (!visible) {
    return null;
  }
  
  const containerStyle = [
    styles.container,
    fullScreen && styles.fullScreen,
    { backgroundColor },
    style,
  ];
  
  return (
    <View style={containerStyle} testID="loading-indicator">
      <ActivityIndicator 
        size={size} 
        color={indicatorColor} 
        testID="activity-indicator"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 999,
    elevation: 999,
  },
});

export { LoadingIndicator };
export default LoadingIndicator;
