const path = require('path');
const { withPlugins } = require('@expo/config-plugins');

// Firebase Analytics is Android-only for now. The stock `@react-native-firebase/app`
// plugin also runs iOS mods, and those throw without a GoogleService-Info.plist —
// so this applies just its Android half. react-native.config.js keeps the native
// modules out of iOS autolinking, and utils/analytics.ts no-ops off Android.
// To add iOS later: drop those react-native.config.js entries, set
// `ios.googleServicesFile`, and swap this for '@react-native-firebase/app'.
const rnfbDir = path.dirname(require.resolve('@react-native-firebase/app/package.json'));
const {
  withBuildscriptDependency,
  withApplyGoogleServicesPlugin,
  withCopyAndroidGoogleServices,
} = require(path.join(rnfbDir, 'plugin/build/android'));

module.exports = (config) =>
  withPlugins(config, [
    withBuildscriptDependency,
    withApplyGoogleServicesPlugin,
    withCopyAndroidGoogleServices,
  ]);
