declare module '@react-native-picker/picker' {
  import * as React from 'react';
  import { ViewStyle } from 'react-native';
  export interface PickerProps<T> {
    selectedValue?: T;
    onValueChange?: (itemValue: T, itemIndex: number) => void;
    style?: ViewStyle;
    children?: React.ReactNode;
  }
  export class Picker<T> extends React.Component<PickerProps<T>> {}
  export namespace Picker {
    export type ItemProps = {
      label: string;
      value: any;
      color?: string;
    };
    export class Item extends React.Component<ItemProps> {}
  }
  export default Picker;
}
