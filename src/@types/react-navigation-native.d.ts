declare module '@react-navigation/native' {
  import { Component } from 'react';

  export interface Theme {
    dark: boolean;
    colors: {
      primary: string;
      background: string;
      card: string;
      text: string;
      border: string;
      notification: string;
    };
  }

  export const DefaultTheme: Theme;
  export const DarkTheme: Theme;

  export interface NavigationContainerProps {
    theme?: Theme;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    linking?: any;
    documentTitle?: any;
    onReady?: () => void;
    onStateChange?: (state: any) => void;
    initialState?: any;
  }

  export class NavigationContainer extends Component<NavigationContainerProps> {}

  export function useNavigation(): any;
  export function useRoute(): any;
  export function useFocusEffect(effect: () => void | (() => void)): void;
  export function useIsFocused(): boolean;
}