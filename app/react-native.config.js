// Firebase Analytics is Android-only for now (see plugins/withFirebaseAndroidOnly.js),
// so its native modules are kept out of the iOS build.
module.exports = {
  dependencies: {
    '@react-native-firebase/app': { platforms: { ios: null } },
    '@react-native-firebase/analytics': { platforms: { ios: null } },
  },
};
