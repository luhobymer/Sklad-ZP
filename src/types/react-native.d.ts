import 'react';

declare module 'react-native' {
  // Додаємо відсутні експорти
  export const NativeModules: any;
  export const AppState: any;
  
  // Додаємо типи для хуків
  export function useRef<T>(initialValue: T): { current: T; };
  export function useRef<T = undefined>(): { current: T | undefined; };
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: ReadonlyArray<any>): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: ReadonlyArray<any>): T;
  export function useMemo<T>(factory: () => T, deps: ReadonlyArray<any>): T;
  
  // Базові пропси для компонентів
  export interface ViewProps {
    children?: React.ReactNode;
    style?: any;
    testID?: string;
    accessible?: boolean;
    onLayout?: (event: any) => void;
  }
  
  export interface TextProps extends ViewProps {
    children?: React.ReactNode;
    style?: any;
    numberOfLines?: number;
    ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  }

  // Додаємо типи для компонентів, які викликають помилки
  export const View: React.ComponentType<ViewProps>;
  export const Text: React.ComponentType<TextProps>;
  export const Button: React.ComponentType<{
    title: string;
    onPress: () => void;
    disabled?: boolean;
    color?: string;
  }>;
}

// Глобальні оголошення
declare const ErrorUtils: {
  getGlobalHandler(): (error: any, isFatal?: boolean) => void;
  setGlobalHandler(handler: (error: any, isFatal?: boolean) => void): void;
  reportError(error: any): void;
};

declare global {
  interface Global {
    ErrorUtils: typeof ErrorUtils;
  }
}
