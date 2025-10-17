declare module 'react-native-gesture-handler' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';

  export interface GestureHandlerRootViewProps {
    style?: ViewStyle;
    children?: React.ReactNode;
  }

  export class GestureHandlerRootView extends Component<GestureHandlerRootViewProps> {}

  // Add other exports as needed
  export const PanGestureHandler: any;
  export const TapGestureHandler: any;
  export const LongPressGestureHandler: any;
  export const PinchGestureHandler: any;
  export const RotationGestureHandler: any;
  export const FlingGestureHandler: any;
  export const ForceTouchGestureHandler: any;
  export const NativeViewGestureHandler: any;
  export const RawButton: any;
  export const BaseButton: any;
  export const RectButton: any;
  export const BorderlessButton: any;
  export const TouchableOpacity: any;
  export const TouchableHighlight: any;
  export const TouchableNativeFeedback: any;
  export const TouchableWithoutFeedback: any;
  export const Swipeable: any;
  export const DrawerLayout: any;
  export const State: any;
  export const Directions: any;
}