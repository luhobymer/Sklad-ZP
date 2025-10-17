import * as React from 'react';
import { ViewProps, StyleProp, ViewStyle } from 'react-native';

declare module 'react-native-gesture-handler' {
  export interface GestureHandlerRootViewProps extends ViewProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
  }

  export const GestureHandlerRootView: React.ComponentType<GestureHandlerRootViewProps>;
  
  // Основні компоненти
  export const Swipeable: any;
  export const DrawerLayout: any;
  export const State: any;
  
  export const PanGestureHandler: any;
  export const TapGestureHandler: any;
  export const LongPressGestureHandler: any;
  export const FlingGestureHandler: any;
  export const PinchGestureHandler: any;
  export const RotationGestureHandler: any;
  export const ForceTouchGestureHandler: any;
  export const NativeViewGestureHandler: any;
  
  export const RectButton: any;
  export const BorderlessButton: any;
  export const TouchableOpacity: any;
  export const TouchableHighlight: any;
  export const TouchableWithoutFeedback: any;
  
  // Утиліти
  export const createNativeWrapper: any;
  export const Directions: any;
  export const gestureHandlerRootHOC: any;
  
  // Події
  export const GestureHandlerStateChangeNativeEvent: any;
  export const GestureHandlerStateChangeEvent: any;
  export const GestureEvent: any;
  export const GestureEventPayload: any;
  export const HandlerStateChangeEvent: any;
  export const HandlerStateChangeEventPayload: any;
}
