import { NativeEventEmitter } from 'react-native';

declare module 'react-native' {
  interface NativeModulesStatic {
    /**
     * Interface for the native SplashScreenHelper module.
     * This module provides methods to control the splash screen.
     */
    SplashScreenHelper: {
      /**
       * Shows the splash screen with an optional fade-in animation.
       */
      show(): Promise<void>;
      
      /**
       * Hides the splash screen with an optional fade-out animation.
       * @param animated Whether to use a fade-out animation (default: true).
       */
      hide(animated?: boolean): Promise<void>;
      
      /**
       * Checks if the splash screen is currently showing.
       * @returns A promise that resolves to a boolean indicating if the splash screen is showing.
       */
      isShowing(): Promise<boolean>;
      
      /**
       * Sets the background color of the splash screen.
       * @param color The color to set as the background (in ARGB format).
       */
      setBackgroundColor(color: number): void;
      
      /**
       * Sets the background resource of the splash screen.
       * @param resName The name of the drawable resource to use as the background.
       */
      setBackgroundResource(resName: string): void;
    };
    
    /**
     * Interface for the ThemeUtils native module.
     * This module provides methods to control the app's theme.
     */
    ThemeUtils: {
      /**
       * Applies the current theme based on system settings or user preference.
       */
      applyTheme(): Promise<void>;
      
      /**
       * Toggles between light and dark theme.
       * @param isDark Whether to use dark theme (true) or light theme (false).
       */
      setDarkMode(isDark: boolean): Promise<void>;
      
      /**
       * Checks if dark mode is currently enabled.
       * @returns A promise that resolves to a boolean indicating if dark mode is enabled.
       */
      isDarkMode(): Promise<boolean>;
      
      /**
       * Enables or disables immersive mode.
       * @param enabled Whether to enable immersive mode.
       */
      setImmersiveMode(enabled: boolean): Promise<void>;
    };
  }
}

// Export the native module interfaces
export interface NativeModulesInterfaces {
  SplashScreenHelper: {
    show(): Promise<void>;
    hide(animated?: boolean): Promise<void>;
    isShowing(): Promise<boolean>;
    setBackgroundColor(color: number): void;
    setBackgroundResource(resName: string): void;
  };
  
  ThemeUtils: {
    applyTheme(): Promise<void>;
    setDarkMode(isDark: boolean): Promise<void>;
    isDarkMode(): Promise<boolean>;
    setImmersiveMode(enabled: boolean): Promise<void>;
  };
}

// Export the native module event emitter
export interface NativeModuleEvents {
  SplashScreenHelper: NativeEventEmitter;
  ThemeUtils: NativeEventEmitter;
}
