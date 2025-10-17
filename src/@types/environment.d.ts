/// <reference types="react-native/types" />

declare module '@env' {
  export const GOOGLE_ANDROID_CLIENT_ID: string;
  export const GOOGLE_IOS_CLIENT_ID: string;
  export const GOOGLE_WEB_CLIENT_ID: string;
  export const API_BASE_URL: string;
  export const APP_VERSION: string;
  export const BUILD_NUMBER: string;
  export const ENABLE_GOOGLE_DRIVE: string;
  export const ENABLE_OFFLINE_MODE: string;
}

declare module 'react-native' {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    GOOGLE_ANDROID_CLIENT_ID?: string;
    GOOGLE_IOS_CLIENT_ID?: string;
    GOOGLE_WEB_CLIENT_ID?: string;
    API_BASE_URL?: string;
    APP_VERSION?: string;
    BUILD_NUMBER?: string;
    ENABLE_GOOGLE_DRIVE?: string;
    ENABLE_OFFLINE_MODE?: string;
  }
}

declare const process: {
  env: ProcessEnv;
};
