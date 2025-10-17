import * as React from 'react';
import { ViewStyle, TextStyle, ImageStyle, Animated } from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';

declare module '@react-navigation/stack' {
  // Базові типи
  export interface StackNavigationOptions {
    title?: string;
    headerShown?: boolean;
    headerTitle?: string | ((props: { children: string; tintColor?: string }) => React.ReactNode);
    headerTitleAlign?: 'left' | 'center';
    headerTitleStyle?: TextStyle;
    headerStyle?: ViewStyle;
    headerTintColor?: string;
    headerLeft?: (props: any) => React.ReactNode;
    headerRight?: (props: any) => React.ReactNode;
    headerBackTitle?: string;
    headerBackTitleStyle?: TextStyle;
    headerBackImage?: (props: { tintColor: string }) => React.ReactNode;
    headerPressColorAndroid?: string;
    headerBackground?: (props: { style: ViewStyle }) => React.ReactNode;
    headerStatusBarHeight?: number;
    headerTransparent?: boolean;
    headerBackgroundContainerStyle?: ViewStyle;
    cardStyle?: ViewStyle;
    cardOverlay?: (props: { style: ViewStyle }) => React.ReactNode;
    cardShadowEnabled?: boolean;
    cardStyleInterpolator?: (props: any) => any;
    cardOverlayEnabled?: boolean;
    gestureEnabled?: boolean;
    gestureDirection?: 'horizontal' | 'horizontal-inverted' | 'vertical' | 'vertical-inverted';
    gestureResponseDistance?: { horizontal?: number; vertical?: number } | number;
    gestureVelocityImpact?: number;
    transitionSpec?: {
      open: {
        animation: 'spring' | 'timing' | 'decay';
        config: any;
      };
      close: {
        animation: 'spring' | 'timing' | 'decay';
        config: any;
      };
    };
    cardStyleInterpolator?: (props: any) => any;
    headerStyleInterpolator?: (props: any) => any;
  }

  // Пропси для екранів
  export interface StackScreenProps<ParamList extends {}, RouteName extends keyof ParamList = string> {
    navigation: StackNavigationProp<ParamList, RouteName>;
    route: RouteProp<ParamList, RouteName>;
  }

  // Навігаційний проп
  export interface StackNavigationProp<ParamList, RouteName extends keyof ParamList = string> 
    extends NavigationProp<ParamList, RouteName> {
    push<RouteName extends keyof ParamList>(
      name: RouteName,
      params?: ParamList[RouteName]
    ): void;
    replace<RouteName extends keyof ParamList>(
      name: RouteName,
      params?: ParamList[RouteName]
    ): void;
    pop(count?: number): void;
    popToTop(): void;
  }

  // Опції переходів
  export const TransitionSpecs: {
    DefaultTransition: any;
    ModalSlideFromBottomIOS: any;
    ModalPresentationIOS: any;
    FadeInFromBottomAndroid: any;
    RevealFromBottomAndroid: any;
    ScaleFromCenterAndroid: any;
    DefaultTransition: any;
    ModalSlideFromBottomIOS: any;
    ModalPresentationIOS: any;
    FadeInFromBottomAndroid: any;
    RevealFromBottomAndroid: any;
    ScaleFromCenterAndroid: any;
  };

  // Інтерполятори стилів
  export const CardStyleInterpolators: {
    forHorizontalIOS: any;
    forVerticalIOS: any;
    forModalPresentationIOS: any;
    forFadeFromBottomAndroid: any;
    forRevealFromBottomAndroid: any;
  };

  export const HeaderStyleInterpolators: {
    forUIKit: any;
    forFade: any;
    forStatic: any;
    forNoAnimation: any;
  };

  // Пресети переходів
  export const TransitionPresets: {
    DefaultTransition: any;
    ModalSlideFromBottomIOS: any;
    ModalPresentationIOS: any;
    FadeInFromBottomAndroid: any;
    RevealFromBottomAndroid: any;
    ScaleFromCenterAndroid: any;
  };

  // Створення навігатора
  export function createStackNavigator<ParamList = {}>(): {
    Navigator: React.ComponentType<{
      initialRouteName?: string;
      screenOptions?: StackNavigationOptions | ((props: any) => StackNavigationOptions);
      mode?: 'card' | 'modal';
      headerMode?: 'float' | 'screen' | 'none';
      keyboardHandlingEnabled?: boolean;
    }>;
    Screen: React.ComponentType<{
      name: keyof ParamList;
      component: React.ComponentType<any>;
      options?: StackNavigationOptions | ((props: any) => StackNavigationOptions);
      initialParams?: any;
    }>;
  };

  // Хуки
  export function useCardAnimation(): {
    current: {
      progress: Animated.AnimatedInterpolation;
      next?: Animated.AnimatedInterpolation;
      closing: Animated.AnimatedInterpolation;
      swiping: Animated.AnimatedInterpolation;
      inverted: Animated.AnimatedInterpolation;
      layouts: {
        screen: {
          width: Animated.AnimatedInterpolation;
          height: Animated.AnimatedInterpolation;
        };
      };
      insets: {
        top: number;
        right: number;
        bottom: number;
        left: number;
      };
    };
  };

  // Компоненти
  export const Header: React.ComponentType<any>;
  export const HeaderBackButton: React.ComponentType<any>;
  export const HeaderBackground: React.ComponentType<any>;
  export const HeaderTitle: React.ComponentType<any>;
  export const HeaderBackContext: React.Context<{
    title?: string;
    tintColor?: string;
  }>;
  export const HeaderHeightContext: React.Context<number>;
  export const HeaderShownContext: React.Context<boolean>;
  export const GestureHandlerRefContext: React.Context<React.RefObject<any>>;
  export const useHeaderHeight: () => number;
  export const useHeaderHeightWithStatusBar: () => number;
  export const useHeaderHeightWithStatusBarAndOrientation: () => number;
  export const useHeaderHeightWithStatusBarAndOrientationAndDimensions: () => number;
  export const useHeaderHeightWithStatusBarAndOrientationAndDimensionsAndInsets: () => number;
  export const useHeaderHeightWithStatusBarAndOrientationAndDimensionsAndInsetsAndStatusBarHeight: () => number;
  export const useHeaderHeightWithStatusBarAndOrientationAndDimensionsAndInsetsAndStatusBarHeightAndSafeAreaInsets: () => number;
}
