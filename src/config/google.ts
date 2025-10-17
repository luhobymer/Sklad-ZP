import { Platform } from 'react-native';
import env from './environment';
import { Logger } from '../utils/logger';

/**
 * Google OAuth configuration for different environments
 */

// Common settings
// Створюємо логер для google
const logger = new Logger({ prefix: 'google' });

export const GOOGLE_API_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

// Get redirect URI based on platform
const getRedirectUri = () => {
  if (env.IS_WEB) {
    // TODO: Замінити на логіку отримання redirectUri через Google Sign-In або Linking у чистому React Native
    return '' // Повертаємо пустий рядок, поки не реалізовано
  }
  // For native platforms, use the app scheme
  // TODO: Замінити на логіку отримання redirectUri через Google Sign-In або Linking у чистому React Native
  return '' // Повертаємо пустий рядок, поки не реалізовано
};

// Main Google OAuth configuration
export const googleConfig = {
  // Client IDs from environment variables
  androidClientId: env.GOOGLE_ANDROID_CLIENT_ID,
  iosClientId: env.GOOGLE_IOS_CLIENT_ID,
  webClientId: env.GOOGLE_WEB_CLIENT_ID,
  
  // Dynamic redirect URI
  redirectUri: getRedirectUri(),
  
  // Scopes for Google APIs
  scopes: GOOGLE_API_SCOPES,
  
  // Additional parameters
  extraParams: {
    prompt: 'consent',
    access_type: 'offline',
  },
  
  // Platform-specific client ID
  clientId: Platform.select({
    android: env.GOOGLE_ANDROID_CLIENT_ID,
    ios: env.GOOGLE_IOS_CLIENT_ID,
    default: env.GOOGLE_WEB_CLIENT_ID,
  }),
};

// Helper function to get auth configuration
export const getGoogleAuthConfig = () => ({
  ...googleConfig,
  // Log configuration in development
  ...(__DEV__ ? {
    _config: {
      ...googleConfig,
      // Hide sensitive data in logs
      androidClientId: googleConfig.androidClientId ? '***' : undefined,
      iosClientId: googleConfig.iosClientId ? '***' : undefined,
      webClientId: googleConfig.webClientId ? '***' : undefined,
      clientId: googleConfig.clientId ? '***' : undefined,
    }
  } : {})
});

// Log configuration in development
if (__DEV__) {
  console.log('Google OAuth Configuration:', {
    ...googleConfig,
    // Hide sensitive data in logs
    androidClientId: googleConfig.androidClientId ? '***' : undefined,
    iosClientId: googleConfig.iosClientId ? '***' : undefined,
    webClientId: googleConfig.webClientId ? '***' : undefined,
    clientId: googleConfig.clientId ? '***' : undefined,
  });
}
// TODO: Google Sign-In інтегровано через @react-native-google-signin/google-signin у GoogleDriveService
