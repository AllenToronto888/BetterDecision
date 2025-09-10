const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure Hermes to suppress warnings that cause build failures
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fargs: true,
    mangle: {
      keep_fnames: true,
    },
    // Suppress warnings that don't affect functionality
    warnings: false,
  },
};

module.exports = config;
