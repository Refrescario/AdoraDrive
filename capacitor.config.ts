import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.adoradrive.app',
  appName: 'AdoraDrive',
  webDir: 'dist-spa',
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    buildOptions: {
      keystorePath: undefined,
      releaseType: 'APK',
    },
  },
  server: {
    url: 'https://adoradrive-production.up.railway.app',
    cleartext: false,
    androidScheme: 'https',
  },
};

export default config;