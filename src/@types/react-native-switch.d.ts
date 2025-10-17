declare module 'react-native-switch' {
  import * as React from 'react';
  import { ViewStyle, TextStyle } from 'react-native';

  export interface SwitchProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
    activeText?: string;
    inActiveText?: string;
    backgroundActive?: string;
    backgroundInactive?: string;
    circleActiveColor?: string;
    circleInActiveColor?: string;
    circleBorderActiveColor?: string;
    circleBorderInactiveColor?: string;
    barHeight?: number;
    circleSize?: number;
    switchWidthMultiplier?: number;
    style?: ViewStyle;
    innerCircleStyle?: ViewStyle;
    renderActiveText?: boolean;
    renderInActiveText?: boolean;
    switchLeftPx?: number;
    switchRightPx?: number;
    switchBorderRadius?: number;
    testID?: string;
  }

  export class Switch extends React.Component<SwitchProps> {}
  export default Switch;
}
