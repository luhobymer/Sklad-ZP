/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 */

const { getDefaultConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

module.exports = {
  transformer: {
    ...defaultConfig.transformer,
    // Needed by some asset transformers (e.g. svg) on RN 0.72+
    assetRegistryPath: 'react-native/Libraries/Image/AssetRegistry',
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  serializer: {
    ...(defaultConfig.serializer || {}),
    getModulesRunBeforeMainModule: () => [
      require.resolve('./polyfills/errorutils-shim'),
    ],
  },
  resolver: {
    ...defaultConfig.resolver,
    // Allow importing SVGs as React components
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
};