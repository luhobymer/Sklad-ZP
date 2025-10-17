// TypeScript Version: 3.8

import * as React from 'react';
import { TextProps, TextStyle } from 'react-native';

// Minimal type declarations for react-native-vector-icons

declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import { ComponentType } from 'react';
  import { TextProps } from 'react-native';
  
  export interface MaterialCommunityIconsProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }
  
  const MaterialCommunityIcons: ComponentType<MaterialCommunityIconsProps>;
  export default MaterialCommunityIcons;
}

declare module 'react-native-vector-icons/Ionicons' {
  import { ComponentType } from 'react';
  import { TextProps } from 'react-native';
  
  export interface IoniconsProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }
  
  const Ionicons: ComponentType<IoniconsProps>;
  export default Ionicons;
}
