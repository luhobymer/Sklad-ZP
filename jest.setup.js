// Jest global setup - minimal
jest.setTimeout(30000);

// Моки для react-native-fs
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/test/documents',
  exists: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
  mkdir: jest.fn(),
  readDir: jest.fn(),
}));

// Моки для React Native
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return RN;
});

// Мок для платформи
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  Version: 15,
  isPad: false,
  isTV: false,
  select: jest.fn(obj => obj.ios),
}));

// Мок для AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
}));

// Моки для нативних модулів
jest.mock('react-native-share', () => ({
  open: jest.fn(),
}));

jest.mock('@react-native-camera-roll/camera-roll', () => ({
  requestPermissions: jest.fn(),
  getPhotos: jest.fn(),
  save: jest.fn(),
}));

jest.mock('react-native-vision-camera', () => ({
  Camera: {
    Type: { back: 'back', front: 'front' },
    FlashMode: { on: 'on', off: 'off', auto: 'auto', torch: 'torch' },
    AutoFocus: { on: 'on', off: 'off' },
    WhiteBalance: { auto: 'auto', sunny: 'sunny' },
  },
  useCameraPermission: jest.fn(),
}));

jest.mock('react-native-device-info', () => ({
  getModel: jest.fn(),
  getManufacturerSync: jest.fn(),
  getDeviceName: jest.fn(),
  getSystemVersion: jest.fn(),
  getVersion: jest.fn(),
}));

// Глобальні моки для тестів
global.fetch = jest.fn();

// Час очікування для асинхронних тестів
jest.setTimeout(30000);
