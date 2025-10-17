declare module 'styled-components/native' {
  import { Component } from 'react';

  export interface ThemeProviderProps {
    theme: any;
    children: React.ReactNode;
  }

  export class ThemeProvider extends Component<ThemeProviderProps> {}

  // Add other styled-components exports as needed
  export const styled: any;
  export default styled;
}