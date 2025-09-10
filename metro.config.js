const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable Hermes entirely to avoid warning-based build failures
config.transformer = {
  ...config.transformer,
  // Completely disable Hermes for now
  hermesCommand: '',
};

module.exports = config;
