const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add reanimated transformer
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Resolve reanimated
config.resolver.alias = {
  'react-native-reanimated': 'react-native-reanimated',
};

module.exports = config;