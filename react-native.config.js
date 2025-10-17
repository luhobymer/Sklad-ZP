module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: [
    './assets/fonts/',
    './assets/images/'
  ],
  dependencies: {
    // Вимкнення автоматичного посилання для бібліотек, які потребують додаткової налаштування
    'react-native-vector-icons': {
      platforms: {
        ios: null,
        android: null,
      },
    },
    // react-native-vision-camera видалено
  },
  // Додаткові налаштування для React Native CLI
  commands: [
    {
      func: () => {
        console.log('Running custom iOS command');
        // You might want to call the default 'run-ios' command here if it exists
        // For example: require('@react-native-community/cli-platform-ios').commands.find(c => c.name === 'run-ios').func();
      },

      name: 'run-ios',
      description: 'Запуск на iOS симуляторі',
      options: [
        {
          name: '--simulator <simulatorName>',
          description: 'Виберіть симулятор (наприклад: "iPhone 15")',
        },
      ],
    },
  ],
  // Налаштування для react-native-svg-transformer
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  // Налаштування для реактивних нативних модулів
  reactNativePath: 'node_modules/react-native',
};
