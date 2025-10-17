// Minimal type declarations for react-native-vector-icons

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  style?: any;
};

declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import { ComponentType } from 'react';
  const MaterialCommunityIcons: ComponentType<IconProps>;
  export default MaterialCommunityIcons;
}

declare module 'react-native-vector-icons/Ionicons' {
  import { ComponentType } from 'react';
  const Ionicons: ComponentType<IconProps>;
  export default Ionicons;
}
