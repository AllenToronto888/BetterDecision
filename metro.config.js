const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable Hermes and New Architecture support for React Native 0.79.5 + Expo SDK 53
// This is the modern recommended configuration for performance and compatibility
module.exports = config;
