const IS_DEV = process.env.APP_VARIANT === 'dev';

export default {
  expo: {
    name: IS_DEV ? 'When Baro? (Dev)' : 'When Baro?',
    slug: 'when-baro',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/imgs/logo_baro_icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/imgs/logo_baro_icon.png',
      resizeMode: 'contain',
      backgroundColor: '#0C0C0E',
    },
    ios: {
      icon: './assets/imgs/logo_baro_icon_ios.png',
      supportsTablet: true,
      bundleIdentifier: IS_DEV ? 'com.whenbaro.app.dev' : 'com.whenbaro.app',
      googleServicesFile: IS_DEV
        ? (process.env.GOOGLE_SERVICES_PLIST_DEV || './GoogleService-Info.dev.plist')
        : (process.env.GOOGLE_SERVICES_PLIST || './GoogleService-Info.plist'),
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: IS_DEV ? 'com.whenbaro.app.dev' : 'com.whenbaro.app',
      versionCode: 1,
      targetSdkVersion: 35,
      googleServicesFile: IS_DEV
        ? (process.env.GOOGLE_SERVICES_JSON_DEV || './google-services.dev.json')
        : (process.env.GOOGLE_SERVICES_JSON || './google-services.json'),
      adaptiveIcon: {
        foregroundImage: './assets/imgs/logo_baro_icon.png',
        backgroundColor: '#0C0C0E',
      },
    },
    web: {
      favicon: './assets/imgs/logo_baro_icon.png',
    },
    plugins: [
      'expo-sqlite',
      'expo-secure-store',
      [
        'expo-notifications',
        {
          icon: './assets/imgs/logo_baro_notif_icon.png',
          color: '#FFFFFF',
        },
      ],
    ],
    extra: {
      EXPO_PUBLIC_AZURE_FUNCTION_APP_BASE_URL: IS_DEV
        ? process.env.DEV_API_BASE_URL || 'https://api.whenbaro.app'
        : 'https://api.whenbaro.app',
      eas: {
        projectId: '379c5464-62fb-4458-9164-4b3d78449fcd',
      },
    },
  },
};
