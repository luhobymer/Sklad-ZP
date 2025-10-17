declare module '@react-navigation/native' {
  export * from '@types/react-navigation';
  export function NavigationContainer(props: any): JSX.Element;
}

declare module '@react-navigation/native-stack' {
  export function createNativeStackNavigator(): any;
  export const NativeStackView: any;
}
