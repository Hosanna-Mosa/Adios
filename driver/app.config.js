export default {
  expo: {
    name: 'Adios Driver',
    slug: 'adios-driver',
    owner: 'adios-one',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'adios-driver',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.adios.driver',
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
    android: {
      package: 'com.adios.driver',
      googleServicesFile: './google-services.json',
      adaptiveIcon: {
        foregroundImage: './assets/images/icon.png',
        backgroundColor: '#ffffff',
      },
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
      permissions: [
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'ACCESS_BACKGROUND_LOCATION',
        'android.permission.POST_NOTIFICATIONS',
        'android.permission.RECEIVE_BOOT_COMPLETED',
      ],
    },
    notification: {
      icon: './assets/images/icon.png',
      color: '#ffffff',
    },
    web: {
      favicon: './assets/images/icon.png',
    },
    plugins: [
      [
        'expo-router',
        {
          origin: 'https://replit.com/',
        },
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Allow Driver App to use your location for real-time order tracking and navigation even in background.',
          locationWhenInUsePermission:
            'Allow Driver App to use your location for real-time order tracking and navigation.',
          isAndroidBackgroundLocationEnabled: true,
        },
      ],
      'expo-font',
      'expo-web-browser',
      // Firebase (Analytics) on Android and iOS. CocoaPods rather than Swift
      // Package Manager, with static frameworks, which Firebase's iOS pods need.
      ['@react-native-firebase/app', { ios: { disableSPM: true } }],
      ['expo-build-properties', { ios: { useFrameworks: 'static' } }],
      [
        'expo-notifications',
        {
          icon: './assets/images/icon.png',
          color: '#ffffff',
        },
      ],
      [
        'expo-image-picker',
        {
          cameraPermission: 'Allow Driver App to use your camera to take your onboarding profile photo.',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,

      // eas init cannot write to a dynamic config, so the id is set by hand.
      // EAS project adios-one/adios-driver. Builds from older Expo accounts use
      // different signing keys, so they cannot upgrade over these.
      eas: {
        projectId: '493315d7-7bdb-43ea-be55-8ccfc58fa8bd',
      },
    },
  },
};