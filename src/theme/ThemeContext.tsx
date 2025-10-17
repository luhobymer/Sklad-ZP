import * as React from 'react';
import { useEffect } from 'react';
import { ThemeUtils } from '../utils/themeUtils';
import { lightTheme, darkTheme, AppTheme } from './theme';

export type ColorSchemeName = 'light' | 'dark' | null | undefined;

// Simple mock for useColorScheme
const useColorScheme = (): ColorSchemeName => 'light';

interface ThemeContextType {
  theme: AppTheme;
  isDark: boolean;
  toggleTheme: () => Promise<void>;
  setTheme: (theme: ColorSchemeName) => Promise<void>;
  themeUtils: ThemeUtils;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: ColorSchemeName;
}

/**
 * Theme provider component that manages the app's theme state.
 * Should be used at the root of your app to provide theme context to all child components.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme,
}) => {
  const systemTheme = useColorScheme() || 'light';
  const [isDark, setIsDark] = React.useState<boolean>(
    initialTheme ? initialTheme === 'dark' : (systemTheme || 'light') === 'dark'
  );
  
  const themeUtils = ThemeUtils.getInstance();
  const theme = isDark ? darkTheme : lightTheme;
  
  // Initialize theme and listeners
  useEffect(() => {
    const initTheme = async () => {
      try {
        // Initialize theme utils
        await themeUtils.initialize();
        
        // Set initial theme state
        const currentTheme = themeUtils.getCurrentTheme();
        setIsDark(currentTheme === 'dark');
      } catch (error) {
        console.error('Failed to initialize theme:', error);
      }
    };
    
    initTheme();
    
    // Listen for theme changes
    const cleanup = themeUtils.addThemeChangeListener((theme) => {
      setIsDark(theme === 'dark');
    });
    
    return () => {
      cleanup();
      themeUtils.cleanup();
    };
  }, [themeUtils]);
  
  /**
   * Toggle between light and dark theme
   */
  const toggleTheme = async () => {
    try {
      await themeUtils.toggleTheme();
    } catch (error) {
      console.error('Failed to toggle theme:', error);
    }
  };
  
  /**
   * Set a specific theme
   * @param theme The theme to set ('light' | 'dark' | null)
   */
  const setTheme = async (theme: ColorSchemeName) => {
    try {
      // Ensure we pass a valid theme (not undefined) to applyTheme
      const validTheme = theme || 'light';
      await themeUtils.applyTheme(validTheme);
    } catch (error) {
      console.error('Failed to set theme:', error);
    }
  };
  
  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        toggleTheme,
        setTheme,
        themeUtils,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access the theme context
 * @returns The theme context with theme utilities and state
 * @throws Error if used outside of a ThemeProvider
 */
export const useTheme = (): ThemeContextType => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
