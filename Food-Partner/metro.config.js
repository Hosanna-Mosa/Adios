const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Release bundles only (the minifier doesn't run in dev): strip every console.*
// call so no debug logging ships in the store build. Dev builds keep their logs.
config.transformer.minifierConfig = {
  ...config.transformer.minifierConfig,
  compress: { ...config.transformer.minifierConfig?.compress, drop_console: true },
};

module.exports = config;
