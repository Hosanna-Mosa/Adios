// Plain-HTTP traffic is only allowed when the configured API itself is plain
// HTTP (a LAN backend during development). Production talks HTTPS only.
const usesCleartextTraffic = /^http:\/\//i.test(process.env.EXPO_PUBLIC_API_URL || '');

export default {
  expo: {
    name: 'Adios',
    slug: 'flavour',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'flavour',
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
      bundleIdentifier: 'com.flavour.customer',
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
      // Off on purpose: with predictive back on, Android 16 stops delivering the back
      // press to React Native's BackHandler, which the custom back handling relies on.
      predictiveBackGestureEnabled: false,
      package: 'com.flavour.customer',
      // Firebase config is not committed: EAS builds get it from the GOOGLE_SERVICES_JSON
      // file environment variable, local builds from the gitignored file next to this one.
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON || './google-services.json',
      adaptiveIcon: {
        foregroundImage: './assets/images/icon.png',
        backgroundColor: '#ffffff',
      },
      usesCleartextTraffic,
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
      // Session token lives in the Android Keystore / iOS Keychain (utils/secureToken.ts).
      'expo-secure-store',
      '@react-native-community/datetimepicker',
      './plugins/withFirebaseAndroidOnly',
      './plugins/withPortraitOnLargeScreens',
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
      // Previous (triozen-tech): b53cf032-dea6-4aff-835e-b3cd717e54a3
      eas: {
        projectId: 'e3e714ab-ffe7-4ea4-bf62-b317be38497c',
      },
    },
  },
};