declare module '@react-native-community/slider' {
  import * as React from 'react';
  import { ViewStyle } from 'react-native';
  export interface SliderProps {
    value?: number;
    minimumValue?: number;
    maximumValue?: number;
    step?: number;
    minimumTrackTintColor?: string;
    maximumTrackTintColor?: string;
    thumbTintColor?: string;
    style?: ViewStyle;
    onValueChange?: (value: number) => void;
  }
  export default class Slider extends React.Component<SliderProps> {}
}
