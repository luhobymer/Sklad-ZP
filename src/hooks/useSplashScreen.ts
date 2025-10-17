import { useEffect, useRef } from 'react';
import { Platform, NativeModules, AppState } from 'react-native';
import type { NativeModuleEvents } from '../types/native-modules';

// Доступ до нативних модулів
const SplashScreenHelper = Platform.OS === 'android' ? NativeModules.SplashScreenHelper : null;

// Створюємо заглушку для SplashScreenHelper, якщо він недоступний
const SplashScreenFallback = {
  show: () => Promise.resolve(),
  hide: () => Promise.resolve(),
  isShowing: () => Promise.resolve(false),
  setBackgroundColor: () => {}
};

// Використовуємо реальний модуль або заглушку
const SplashScreen = SplashScreenHelper || SplashScreenFallback;

/**
 * A custom hook for managing the splash screen in a React Native app.
 * This hook provides methods to show, hide, and check the status of the splash screen.
 * 
 * @example
 * const { hide, isShowing } = useSplashScreen();
 * 
 * useEffect(() => {
 *   // Hide splash screen when component mounts
 *   hide();
 *   
 *   // Or hide it with a delay
 *   const timer = setTimeout(() => {
 *     hide(true); // with animation
 *   }, 2000);
 *   
 *   return () => clearTimeout(timer);
 * }, [hide]);
 */
const useSplashScreen = () => {
  const splashScreenInitialized = useRef(false);
  
  // Initialize the splash screen when the hook is first used
  useEffect(() => {
    if (!splashScreenInitialized.current && Platform.OS === 'android') {
      // Show the splash screen immediately when the hook is first used
      SplashScreen.show();
      splashScreenInitialized.current = true;
      
      return () => {
        // Cleanup if needed
        if (splashScreenInitialized.current) {
          SplashScreen.hide(false);
        }
      };
    }
  }, []);
  
  /**
   * Hides the splash screen.
   * @param animated Whether to use a fade-out animation (default: true).
   */
  const hide = async (animated: boolean = true): Promise<void> => {
    if (Platform.OS !== 'android') return;
    
    try {
      await SplashScreen.hide(animated);
    } catch (error) {
      console.warn('Failed to hide splash screen:', error);
    }
  };
  
  /**
   * Shows the splash screen.
   */
  const show = async (): Promise<void> => {
    if (Platform.OS !== 'android') return;
    
    try {
      await SplashScreen.show();
    } catch (error) {
      console.warn('Failed to show splash screen:', error);
    }
  };
  
  /**
   * Checks if the splash screen is currently showing.
   * @returns A promise that resolves to a boolean indicating if the splash screen is showing.
   */
  const isShowing = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;
    
    try {
      return await SplashScreen.isShowing() || false;
    } catch (error) {
      console.warn('Failed to check splash screen status:', error);
      return false;
    }
  };
  
  /**
   * Sets the background color of the splash screen.
   * @param color The color to set as the background (in ARGB format).
   */
  const setBackgroundColor = (color: number): void => {
    if (Platform.OS !== 'android') return;
    
    try {
      SplashScreen.setBackgroundColor(color);
    } catch (error) {
      console.warn('Failed to set splash screen background color:', error);
    }
  };
  
  /**
   * Sets the background resource of the splash screen.
   * @param resName The name of the drawable resource to use as the background.
   */
  const setBackgroundResource = (resName: string): void => {
    if (Platform.OS !== 'android') return;
    
    try {
      SplashScreenHelper?.setBackgroundResource(resName);
    } catch (error) {
      console.warn('Failed to set splash screen background resource:', error);
    }
  };
  
  return {
    hide,
    show,
    isShowing,
    setBackgroundColor,
    setBackgroundResource,
  };
};

export default useSplashScreen;
