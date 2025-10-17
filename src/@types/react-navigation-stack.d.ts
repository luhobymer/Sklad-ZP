declare module '@react-navigation/stack' {
  export interface StackNavigationOptions {
    title?: string;
    headerShown?: boolean;
    headerTitle?: string;
    headerStyle?: any;
    headerTitleStyle?: any;
    headerTintColor?: string;
    headerBackTitle?: string;
    gestureEnabled?: boolean;
    cardStyle?: any;
    animationEnabled?: boolean;
    presentation?: 'card' | 'modal' | 'transparentModal';
  }

  export interface StackNavigationProp<T = any> {
    navigate: (name: string, params?: any) => void;
    goBack: () => void;
    push: (name: string, params?: any) => void;
    pop: (count?: number) => void;
    popToTop: () => void;
    replace: (name: string, params?: any) => void;
    reset: (state: any) => void;
    setParams: (params: any) => void;
    dispatch: (action: any) => void;
    addListener: (type: string, callback: Function) => () => void;
    removeListener: (type: string, callback: Function) => void;
    canGoBack: () => boolean;
    isFocused: () => boolean;
    dangerouslyGetParent: () => any;
    dangerouslyGetState: () => any;
  }

  export interface StackScreenProps<T = any> {
    navigation: StackNavigationProp<T>;
    route: {
      key: string;
      name: string;
      params?: any;
    };
  }

  export function createStackNavigator(): {
    Navigator: React.ComponentType<any>;
    Screen: React.ComponentType<any>;
  };

  export const TransitionPresets: {
    SlideFromRightIOS: any;
    ModalSlideFromBottomIOS: any;
    FadeFromBottomAndroid: any;
    RevealFromBottomAndroid: any;
    ScaleFromCenterAndroid: any;
    DefaultTransition: any;
    ModalTransition: any;
  };

  export const CardStyleInterpolators: {
    forHorizontalIOS: any;
    forVerticalIOS: any;
    forModalPresentationIOS: any;
    forFadeFromBottomAndroid: any;
    forRevealFromBottomAndroid: any;
    forScaleFromCenterAndroid: any;
    forNoAnimation: any;
  };

  export const HeaderStyleInterpolators: {
    forUIKit: any;
    forFade: any;
    forStatic: any;
    forSlideLeft: any;
    forSlideUp: any;
    forNoAnimation: any;
  };
}