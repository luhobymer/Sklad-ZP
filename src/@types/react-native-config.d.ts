declare module 'react-native-config' {
  export interface NativeConfig {
    [name: string]: string;
    setStringValue: (key: string, value: string) => void;
    setNumberValue: (key: string, value: number) => void;
    setBooleanValue: (key: string, value: boolean) => void;
    getString: (key: string) => string | undefined;
    getNumber: (key: string) => number | undefined;
    getBoolean: (key: string) => boolean | undefined;
  }

  const Config: NativeConfig;
  export default Config;
}