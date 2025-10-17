import * as React from 'react';
import { ViewStyle, StyleProp } from 'react-native';

declare module 'react-native-modal' {
  export interface ModalProps {
    isVisible: boolean;
    onBackdropPress?: () => void;
    onBackButtonPress?: () => boolean | null | void;
    onModalShow?: () => void;
    onModalHide?: () => void;
    onModalWillShow?: () => void;
    onModalWillHide?: () => void;
    style?: StyleProp<ViewStyle>;
    animationIn?: 'fade' | 'slideInUp' | 'slideInDown' | 'slideInLeft' | 'slideInRight' | string;
    animationOut?: 'fade' | 'slideOutUp' | 'slideOutDown' | 'slideOutLeft' | 'slideOutRight' | string;
    animationInTiming?: number;
    animationOutTiming?: number;
    backdropOpacity?: number;
    backdropColor?: string;
    backdropTransitionInTiming?: number;
    backdropTransitionOutTiming?: number;
    avoidKeyboard?: boolean;
    coverScreen?: boolean;
    hasBackdrop?: boolean;
    children?: React.ReactNode;
    useNativeDriver?: boolean;
    hideModalContentWhileAnimating?: boolean;
    propagateSwipe?: boolean;
    deviceHeight?: number;
    deviceWidth?: number;
    statusBarTranslucent?: boolean;
    supportedOrientations?: Array<
      'portrait' | 
      'portrait-upside-down' | 
      'landscape' | 
      'landscape-left' | 
      'landscape-right'
    >;
    useNativeDriverForBackdrop?: boolean;
    onSwipeComplete?: () => void;
    swipeDirection?: 'up' | 'down' | 'left' | 'right' | string[];
    swipeThreshold?: number;
  }

  const ReactNativeModal: React.ComponentType<ModalProps>;
  export default ReactNativeModal;
  
  // Додаткові експорти
  export const Slide: any;
  export const Fade: any;
  export const Zoom: any;
  export const Bounce: any;
  export const Flip: any;
}
