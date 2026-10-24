// Every key and URL comes from the environment (.env locally, EAS environment
// variables for cloud builds) — nothing secret is committed here. See .env.example.

// Plain-HTTP traffic is only allowed when the configured API itself is plain
// HTTP (a LAN backend during development). Production talks HTTPS only.
const usesCleartextTraffic = /^http:\/\//i.test(process.env.EXPO_PUBLIC_API_URL || '');

export default {
  expo: {
    name: 'Adios Partner',
    slug: 'flavour-partner',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'flavourpartner',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.flavour.partner',
      infoPlist: {
        NSPhotoLibraryUsageDescription: 'Pick photos of your dishes to show customers on your menu.',
        NSCameraUsageDescription: 'Take photos of your dishes to show customers on your menu.',
        NSLocationWhenInUseUsageDescription: 'Use your current location to set where your outlet is.',
      },
    },
    android: {
      // Off on purpose: with predictive back on, Android 16 stops delivering the back
      // press to React Native's BackHandler, which the custom back handling relies on.
      predictiveBackGestureEnabled: false,
      package: 'com.flavour.partner',
      adaptiveIcon: {
        foregroundImage: './assets/images/icon.png',
        backgroundColor: '#ffffff',
      },
      usesCleartextTraffic,
      navigationBar: {
        backgroundColor: '#FFFFFF',
        buttonStyle: 'dark',
      },
      permissions: ['android.permission.VIBRATE'],
      // Never requested, even if a library's manifest asks for them: no app records
      // audio or picks video, and only the driver app tracks in the background.
      blockedPermissions: [
        'android.permission.RECORD_AUDIO',
        'android.permission.READ_MEDIA_AUDIO',
        'android.permission.READ_MEDIA_VIDEO',
        // From the Expo project template; nothing here draws over other apps or
        // writes to shared storage (files go to the app cache and the share sheet).
        'android.permission.SYSTEM_ALERT_WINDOW',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.ACCESS_BACKGROUND_LOCATION',
      ],
    },
    web: {
      favicon: './assets/images/icon.png',
    },
    plugins: [
      'expo-router',
      'expo-font',
      'expo-web-browser',
      // Session token lives in the Android Keystore / iOS Keychain (utils/secureToken.ts).
      'expo-secure-store',
      './plugins/withPortraitOnLargeScreens',
      [
        'expo-image-picker',
        {
          photosPermission: 'Pick photos of your dishes to show customers on your menu.',
          cameraPermission: 'Take photos of your dishes to show customers on your menu.',
          // Dish photos only, never video — so no microphone permission.
          microphonePermission: false,
        },
      ],
      [
        'expo-notifications',
        {
          // White-on-transparent status-bar icon; Android tints it with `color`.
          icon: './assets/images/notification-icon.png',
          color: '#E8720C',
          // The new-order ring. The backend names it ("new_order.wav") in order pushes,
          // and the app's "orders" Android channel plays it — see utils/pushNotifications.ts.
          sounds: ['./assets/sounds/new_order.wav'],
        },
      ],
      // "Use my current location" on Edit restaurant details — foreground only.
      [
        'expo-location',
        {
          locationWhenInUsePermission: 'Use your current location to set where your outlet is.',
          locationAlwaysAndWhenInUsePermission: false,
          locationAlwaysPermission: false,
          isAndroidBackgroundLocationEnabled: false,
          isAndroidForegroundServiceEnabled: false,
        },
      ],
      // Plays the same ring in-app. Playback only — no microphone permission requested.
      ['expo-audio', { microphonePermission: false, recordAudioAndroid: false }],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      supportPhone: process.env.EXPO_PUBLIC_SUPPORT_PHONE,
      supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL,
      partnerWebUrl: process.env.EXPO_PUBLIC_PARTNER_WEB_URL,
      privacyPolicyUrl: process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL,
      ...(process.env.EAS_PROJECT_ID ? { eas: { projectId: process.env.EAS_PROJECT_ID } } : {}),
    },
  },
};
