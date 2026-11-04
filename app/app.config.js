export default {
  expo: {
    name: 'Adios',
    slug: 'adios',
    owner: 'adios-one',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'adios',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    // Root view (window) background, applied by expo-system-ui. It is what shows
    // between the native splash and the first JS frame, so it matches the brand
    // colour of the JS intro splash (designTokens.light.brand in
    // constants/colors.ts) instead of flashing white.
    backgroundColor: '#E8720C',
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      // Same brand colour as the JS intro splash in app/index.tsx, so the
      // native -> JS splash hand-off is seamless.
      backgroundColor: '#E8720C',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.adios.customer',
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'This app uses your location to show nearby services and track your deliveries.',
      },
      // Universal Links: lets a normal https:// link (e.g. shared via WhatsApp/SMS) open this
      // app directly instead of a browser. Swap the domain below for your real web domain once
      // decided (currently reusing the API domain as a placeholder). Also requires hosting
      // `apple-app-site-association` there — see backend/src/index.ts — with your real Apple
      // Team ID filled in (Apple Developer account → Membership), which nothing in this repo
      // can supply automatically.
      associatedDomains: ['applinks:x-api.triozen.tech'],
    },
    android: {
      package: 'com.adios.customer',
      googleServicesFile: './google-services.json',
      adaptiveIcon: {
        foregroundImage: './assets/images/icon.png',
        backgroundColor: '#ffffff',
      },
      usesCleartextTraffic: true,
      navigationBar: {
        backgroundColor: '#FFFFFF',
        buttonStyle: 'dark',
      },
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
      permissions: [
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'android.permission.POST_NOTIFICATIONS',
        'android.permission.RECEIVE_BOOT_COMPLETED',
      ],
      // Android App Links: same idea as iOS associatedDomains above. Also requires hosting
      // `assetlinks.json` on the domain below — see backend/src/index.ts — with your app's
      // real release-signing SHA256 fingerprint filled in (get it via `eas credentials`),
      // which nothing in this repo can supply automatically.
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [{ scheme: 'https', host: 'x-api.triozen.tech', pathPrefix: '/restaurant-menu' }],
          category: ['BROWSABLE', 'DEFAULT'],
        },
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
      'expo-font',
      'expo-web-browser',
      '@react-native-community/datetimepicker',
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
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      // Falls back to the App/Universal Link host declared above, which the backend
      // answers at /restaurant-menu/:id — so "share this dish" produces a link that
      // resolves even before a separate public website exists. Point
      // EXPO_PUBLIC_WEB_URL at the real site once there is one.
      webUrl: process.env.EXPO_PUBLIC_WEB_URL || 'https://x-api.triozen.tech',
      // EAS project adios-one/adios. Builds from older Expo accounts use different
      // signing keys, so they cannot upgrade over these.
      eas: {
        projectId: '0deedafc-8f7e-46e4-9975-38ef4a257417',
      },
    },
  },
};
