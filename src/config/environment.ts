import { Platform } from 'react-native';
import { Logger } from '../utils/logger';
import {
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
  API_BASE_URL,
  APP_VERSION,
  BUILD_NUMBER,
  ENABLE_GOOGLE_DRIVE,
  ENABLE_OFFLINE_MODE
} from '@env';

// Створюємо логер для environment
const logger = new Logger({ prefix: 'environment' });

// Get environment variables with fallback values
const getEnvVariable = (value: string | undefined, defaultValue = ''): string => {
  return value || defaultValue;
};

// Environment configuration
export const env = {
  // App environment
  NODE_ENV: __DEV__ ? 'development' : 'production',
  
  // Google OAuth Client IDs
  GOOGLE_ANDROID_CLIENT_ID: getEnvVariable(
    GOOGLE_ANDROID_CLIENT_ID,
    'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com'
  ),
  
  GOOGLE_IOS_CLIENT_ID: getEnvVariable(
    GOOGLE_IOS_CLIENT_ID,
    'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com'
  ),
  
  GOOGLE_WEB_CLIENT_ID: getEnvVariable(
    GOOGLE_WEB_CLIENT_ID,
    'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com'
  ),
  
  // API endpoints
  API_BASE_URL: getEnvVariable(
    API_BASE_URL,
    'https://api.yourdomain.com'
  ),
  
  // Feature flags
  FEATURES: {
    ENABLE_GOOGLE_DRIVE: getEnvVariable(ENABLE_GOOGLE_DRIVE, 'true') === 'true',
    ENABLE_OFFLINE_MODE: getEnvVariable(ENABLE_OFFLINE_MODE, 'true') === 'true',
  },
  
  // App version and build info
  APP_VERSION: getEnvVariable(APP_VERSION, '1.0.0'),
  BUILD_NUMBER: getEnvVariable(BUILD_NUMBER, '1'),
  
  // Platform specific configurations
  IS_ANDROID: Platform.OS === 'android',
  IS_IOS: Platform.OS === 'ios',
  IS_WEB: Platform.OS === 'web',
};

// Development mode specific configurations
if (__DEV__) {
  console.log('Environment:', {
    ...env,
    // Hide sensitive data in logs
    GOOGLE_ANDROID_CLIENT_ID: env.GOOGLE_ANDROID_CLIENT_ID ? '***' : undefined,
    GOOGLE_IOS_CLIENT_ID: env.GOOGLE_IOS_CLIENT_ID ? '***' : undefined,
    GOOGLE_WEB_CLIENT_ID: env.GOOGLE_WEB_CLIENT_ID ? '***' : undefined,
  });
}

export default env;
