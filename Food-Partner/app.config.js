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
    },
    web: {
      favicon: './assets/images/icon.png',
    },
    plugins: [
      'expo-router',
      'expo-font',
      'expo-web-browser',
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
      // @hosanna4190/flavour-partner. Written here like app/ and driver/ do, since
      // eas-cli does not read .env; EAS_PROJECT_ID still overrides it.
      eas: { projectId: process.env.EAS_PROJECT_ID || 'c76ed939-2b2e-4118-a48d-2c1ac3facbf3' },
    },
  },
};
