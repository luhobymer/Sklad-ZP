module.exports = function (api) {
  api.cache(true);
  
  return {
    presets: [
      'module:metro-react-native-babel-preset',
      '@babel/preset-typescript'
    ],
    plugins: [
      ['module-resolver', {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
        },
      }],
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
        blacklist: null,
        whitelist: null,
        safe: false,
        allowUndefined: true
      }],
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-proposal-private-methods', { loose: true }],
      ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
      'react-native-paper/babel',
      // Reanimated plugin MUST be listed last
      'react-native-reanimated/plugin',
    ],
    env: {
      production: {
        plugins: ['transform-remove-console']
      },
      test: {
        plugins: ['@babel/plugin-transform-modules-commonjs']
      }
    }
  };
};
