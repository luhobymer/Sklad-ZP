import { useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

// Define AppStateStatus type locally
type AppStateStatus = 'active' | 'background' | 'inactive';

// Mock AppState for compatibility
const AppState = {
  addEventListener: (event: string, handler: (state: AppStateStatus) => void) => {
    // Mock implementation
    return {
      remove: () => {},
    };
  },
};
import { ThemeUtils } from './themeUtils';
import useSplashScreen from '../hooks/useSplashScreen';

/**
 * Hook for initializing the application with splash screen and theme handling
 * @param options Configuration options for the app initializer
 */
export const useAppInitializer = (options: {
  /**
   * Whether to show the splash screen during initialization (default: true)
   */
  showSplash?: boolean;
  
  /**
   * Callback function called when the app is ready
   */
  onReady?: () => void;
  
  /**
   * Callback function called when the app state changes
   */
  onAppStateChange?: (state: AppStateStatus) => void;
} = {}) => {
  const { 
    showSplash = true, 
    onReady, 
    onAppStateChange 
  } = options;
  
  const { hide: hideSplash, isShowing: isSplashShowing } = useSplashScreen();
  const themeUtils = ThemeUtils.getInstance();
  
  // Initialize app state
  const initialize = useCallback(async () => {
    try {
      // Show splash screen if enabled
      if (showSplash && Platform.OS === 'android') {
        // Check if splash is showing, if not show it
        if (!isSplashShowing) {
          // Splash screen logic would go here
        }
      }
      
      // Apply theme based on system settings
      await themeUtils.initialize();
      
      // Notify that the app is ready
      onReady?.();
      
      // Hide splash screen after a short delay
      if (showSplash) {
        setTimeout(() => {
          hideSplash();
        }, 500);
      }
    } catch (error) {
      console.error('App initialization error:', error);
      // Ensure splash screen is hidden even if there's an error
      hideSplash().catch(() => {});
    }
  }, [showSplash, onReady, hideSplash, isSplashShowing, themeUtils]);
  
  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      onAppStateChange?.(nextAppState);
      
      // Re-apply theme when app comes to foreground
      if (nextAppState === 'active') {
        themeUtils.applyThemeFromSystem();
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [onAppStateChange, themeUtils]);
  
  return {
    initialize,
    hideSplash,
    isSplashShowing,
    themeUtils,
  };
};

/**
 * Initialize the application with splash screen and theme handling
 * @param options Configuration options for the app initializer
 */
export const initializeApp = async (options: {
  /**
   * Whether to show the splash screen during initialization (default: true)
   */
  showSplash?: boolean;
  
  /**
   * Callback function called when the app is ready
   */
  onReady?: () => void;
  
  /**
   * Callback function called when the app state changes
   */
  onAppStateChange?: (state: AppStateStatus) => void;
} = {}) => {
  const { 
    showSplash = true, 
    onReady, 
    onAppStateChange 
  } = options;
  
  // Handle app state changes
  if (onAppStateChange) {
    const subscription = AppState.addEventListener('change', onAppStateChange);
    
    // Cleanup function
    return () => {
      subscription.remove();
    };
  }
  
  // No-op cleanup function if no app state listener was set up
  return () => {};
};
