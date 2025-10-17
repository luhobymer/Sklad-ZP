/**
 * @format
 * @flow strict-local
 */

// Гарантуємо наявність глобального ErrorUtils на найранішій стадії, ДО будь-яких імпортів
// щоб уникнути падінь, якщо модулі викликають setGlobalHandler під час імпорту
if (typeof global !== 'undefined') {
  const g = global;
  if (!g.ErrorUtils) {
    const noop = () => {};
    const defaultHandler = (error) => {
      // eslint-disable-next-line no-console
      console.error('Unhandled error (shim):', error);
    };
    g.ErrorUtils = {
      setGlobalHandler: noop,
      getGlobalHandler: () => defaultHandler,
      reportFatalError: noop,
    };
  } else {
    // Забезпечуємо наявність методів, якщо об'єкт існує, але без методів
    g.ErrorUtils.setGlobalHandler = g.ErrorUtils.setGlobalHandler || (() => {});
    g.ErrorUtils.getGlobalHandler = g.ErrorUtils.getGlobalHandler || (() => (e) => console.error('Unhandled error:', e));
    g.ErrorUtils.reportFatalError = g.ErrorUtils.reportFatalError || (() => {});
  }
}

import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import App from './App';

AppRegistry.registerComponent(appName, () => App);

// Безпечна установка глобального обробника помилок, якщо доступний
// Використовуємо globalThis.ErrorUtils з optional chaining
const EU = (typeof global !== 'undefined' && global.ErrorUtils) || undefined;
const originalHandler =
  (EU && typeof EU.getGlobalHandler === 'function' && EU.getGlobalHandler()) ||
  ((error) => {
    // fallback: просто логувати
    // eslint-disable-next-line no-console
    console.error('Unhandled error (fallback):', error);
  });

if (EU && typeof EU.setGlobalHandler === 'function') {
  EU.setGlobalHandler((error, isFatal) => {
    // eslint-disable-next-line no-console
    console.error('Unhandled error:', error);
    if (isFatal) {
      // eslint-disable-next-line no-console
      console.error('Fatal error, app will be closed', { isFatal });
    }
    if (typeof originalHandler === 'function') {
      originalHandler(error, isFatal);
    }
  });
}
