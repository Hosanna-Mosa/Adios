const { withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');

// Apps targeting Android 16 (API 36) have their portrait lock ignored on screens
// 600dp and wider (tablets, unfolded foldables), so every screen would also have to
// work in landscape. The layouts are phone-portrait only, so this property keeps the
// lock on those devices. Android 17 (API 37) drops the opt-out: give the layouts a
// landscape / wide-screen pass before moving targetSdk to 37.
const PROPERTY = 'android.window.PROPERTY_COMPAT_ALLOW_RESTRICTED_RESIZABILITY';

module.exports = (config) =>
  withAndroidManifest(config, (config) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
    app.property = (app.property || []).filter((p) => p.$['android:name'] !== PROPERTY);
    app.property.push({ $: { 'android:name': PROPERTY, 'android:value': 'true' } });
    return config;
  });
