import { Platform } from 'react-native';
import { ColorSchemeName } from '../theme/ThemeContext';
import { Logger } from './logger';

const logger = new Logger({ prefix: 'ThemeUtils' });

// Define EventSubscription type locally since it's not exported in newer RN versions
type EventSubscription = {
  remove(): void;
};

// Type for theme change listener
type ThemeChangeListener = (theme: ColorSchemeName) => void;

// Mock Appearance API for compatibility
const Appearance = {
  getColorScheme: (): ColorSchemeName => 'light',
  addChangeListener: (_listener: any) => {
    // Mock implementation
  },
  removeChangeListener: (_listener: any) => {
    // Mock implementation
  },
};

// Mock NativeEventEmitter
class NativeEventEmitter {
  constructor(_nativeModule: any) {}
  addListener(_eventType: string, _listener: any): EventSubscription {
    return {
      remove: () => {},
    } as EventSubscription;
  }
}

// Mock NativeModules
const NativeModules = {
  ThemeUtils: {
    setDarkMode: async (_isDark: boolean) => {
      // Mock implementation
    },
  },
};

// Types for theme change events

/**
 * Utility class for managing the app's theme and appearance.
 * Implements the singleton pattern to ensure a single source of truth for theme state.
 */
export class ThemeUtils {
  private static instance: ThemeUtils;
  private themeChangeListeners: ThemeChangeListener[] = [];
  private currentTheme: ColorSchemeName;
  private systemColorScheme: ColorSchemeName;
  private eventEmitter: NativeEventEmitter | null = null;
  private themeChangeSubscription: EventSubscription | null = null;

  private constructor() {
    this.systemColorScheme = Appearance.getColorScheme() || 'light';
    this.currentTheme = this.systemColorScheme;
    
    // Initialize native module event emitter if available
    if (Platform.OS === 'android' && NativeModules.ThemeUtils) {
      this.eventEmitter = new NativeEventEmitter(NativeModules.ThemeUtils);
    }
  }

  /**
   * Get the singleton instance of ThemeUtils
   */
  public static getInstance(): ThemeUtils {
    if (!ThemeUtils.instance) {
      ThemeUtils.instance = new ThemeUtils();
    }
    return ThemeUtils.instance;
  }

  /**
   * Initialize the theme manager
   */
  public async initialize(): Promise<void> {
    logger.log('Initializing theme manager');

    // Listen for system theme changes
    Appearance.addChangeListener(this.handleSystemThemeChange);
    logger.log('Added system theme change listener');

    // Set up native theme change listener if available
    if (this.eventEmitter) {
      this.themeChangeSubscription = this.eventEmitter.addListener(
        'onThemeChanged',
        this.handleNativeThemeChange
      );
      logger.log('Added native theme change listener');
    }

    // Apply the current theme
    try {
      await this.applyThemeFromSystem();
      logger.log('Applied system theme:', this.currentTheme);
    } catch (error) {
      logger.error('Failed to apply system theme:', error);
      // Fallback to light theme if system theme application fails
      this.currentTheme = 'light';
      this.notifyThemeChange('light');
    }
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    Appearance.removeChangeListener(this.handleSystemThemeChange);
    this.themeChangeSubscription?.remove();
    this.themeChangeListeners = [];
  }

  /**
   * Apply the current system theme
   */
  public async applyThemeFromSystem(): Promise<void> {
    const colorScheme = Appearance.getColorScheme() || 'light';
    await this.applyTheme(colorScheme);
  }

  /**
   * Apply a specific theme
   * @param theme The theme to apply ('light' | 'dark' | null)
   */
  public async applyTheme(theme: ColorSchemeName): Promise<void> {
    logger.log('Applying theme:', theme);

    if (!theme) {
      logger.warn('No theme specified, using light theme');
      theme = 'light';
    }

    this.currentTheme = theme;

    try {
      // Update native theme if available
      if (Platform.OS === 'android' && NativeModules.ThemeUtils && typeof NativeModules.ThemeUtils.setDarkMode === 'function') {
        logger.log('Setting native dark mode:', theme === 'dark');
        await NativeModules.ThemeUtils.setDarkMode(theme === 'dark');
      }

      // Notify listeners
      logger.log('Notifying listeners about theme change');
      this.notifyThemeChange(theme);
      logger.log('Theme applied successfully:', theme);
    } catch (error) {
      logger.error('Failed to apply theme:', error);
    }
  }

  /**
   * Toggle between light and dark theme
   */
  public async toggleTheme(): Promise<void> {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    await this.applyTheme(newTheme);
  }

  /**
   * Get the current theme
   */
  public getCurrentTheme(): ColorSchemeName {
    return this.currentTheme;
  }

  /**
   * Check if dark mode is currently enabled
   */
  public isDarkMode(): boolean {
    return this.currentTheme === 'dark';
  }

  /**
   * Add a theme change listener
   * @param listener The callback function to be called when the theme changes
   * @returns A function to remove the listener
   */
  public addThemeChangeListener(listener: ThemeChangeListener): () => void {
    this.themeChangeListeners.push(listener);
    
    // Return cleanup function
    return () => {
      this.themeChangeListeners = this.themeChangeListeners.filter(
        l => l !== listener
      );
    };
  }

  /**
   * Handle system theme changes
   */
  private handleSystemThemeChange = (preferences: { colorScheme: ColorSchemeName }) => {
    this.systemColorScheme = preferences.colorScheme || 'light';
    
    // Only update if we're following system theme
    if (this.currentTheme === this.systemColorScheme) {
      this.applyTheme(this.systemColorScheme);
    }
  };

  /**
   * Handle native theme changes (from Android)
   */
  private handleNativeThemeChange = (event: { isDark: boolean }) => {
    const newTheme = event.isDark ? 'dark' : 'light';
    if (this.currentTheme !== newTheme) {
      this.currentTheme = newTheme;
      this.notifyThemeChange(newTheme);
    }
  };

  /**
   * Notify all listeners of a theme change
   */
  private notifyThemeChange(theme: ColorSchemeName): void {
    logger.log(`Notifying ${this.themeChangeListeners.length} listeners of theme change to ${theme}`);

    if (this.themeChangeListeners.length === 0) {
      logger.warn('No theme change listeners registered');
    }

    this.themeChangeListeners.forEach((listener, index) => {
      try {
        logger.log(`Calling listener ${index + 1}/${this.themeChangeListeners.length}`);
        listener(theme);
      } catch (error) {
        logger.error(`Error in theme change listener ${index + 1}:`, error);
      }
    });

    logger.log('All listeners notified');
  }
}
