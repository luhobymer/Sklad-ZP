import * as React from 'react';
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

declare module '@react-navigation/native' {
  // Базові типи
  export interface NavigationContainerProps {
    children: React.ReactNode;
    theme?: {
      dark: boolean;
      colors: {
        primary: string;
        background: string;
        card: string;
        text: string;
        border: string;
        notification: string;
      };
    };
    onReady?: () => void;
  }

  // Основні компоненти
  export const NavigationContainer: React.ComponentType<NavigationContainerProps>;
  
  // Хуки
  export function useNavigation(): {
    navigate: (name: string, params?: object) => void;
    goBack: () => void;
    canGoBack: () => boolean;
    isFocused: () => boolean;
    addListener: (event: string, callback: (e: any) => void) => () => void;
  };
  
  export function useRoute<T = any>(): {
    key: string;
    name: string;
    params: T;
  };
  
  // Теми
  export const DarkTheme: any;
  export const DefaultTheme: any;
  
  // Дії навігації
  export const CommonActions: {
    navigate: (name: string, params?: object) => any;
    goBack: () => any;
    setParams: (params: object) => any;
  };
  
  export const StackActions: {
    push: (name: string, params?: object) => any;
    pop: (count?: number) => any;
    popToTop: () => any;
    replace: (name: string, params?: object) => any;
    reset: (state: any) => any;
  };
  
  // Утиліти
  export function useFocusEffect(
    effect: () => void | (() => void | undefined),
    deps?: any[]
  ): void;
  
  export function useIsFocused(): boolean;
  
  // Навігаційні провайдери
  export function createNavigationContainerRef<T = any>(): {
    isReady: () => boolean;
    navigate: (name: string, params?: object) => void;
    goBack: () => void;
  };
  
  // Додаткові типи
  export type NavigationProp<ParamList, RouteName extends keyof ParamList = string> = {
    navigate<RouteName extends keyof ParamList>(
      route: RouteName | { key: string; params?: any } | { name: RouteName; params?: any; merge?: boolean },
      params?: ParamList[RouteName],
    ) : void;
    goBack(): void;
    canGoBack(): boolean;
  };
  
  export type RouteProp<ParamList, RouteName extends keyof ParamList = string> = {
    key: string;
    name: RouteName;
    params: ParamList[RouteName];
  };
}
