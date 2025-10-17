declare module '@emotion/react' {
  export interface Theme {
    colors: {
      primary: string;
      background: string;
      card: string;
      text: string;
      border: string;
      notification: string;
    };
  }
}

declare module '@emotion/react/jsx-runtime' {
  import { JSX as ReactJSX } from 'react';
  export * from '@emotion/react/types/jsx-namespace';
  export { ReactJSX as JSX };
}
