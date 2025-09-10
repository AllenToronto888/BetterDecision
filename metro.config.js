const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// TODO: Re-enable Hermes in future for better performance (2-3x faster startup, 30% less memory)
// Currently disabled to avoid build issues - can be enabled later when needed
// To enable: remove this transformer override and set "jsEngine": "hermes" in app.json
config.transformer = {
  ...config.transformer,
  // Completely disable Hermes for now
  hermesCommand: '',
};

module.exports = config;
