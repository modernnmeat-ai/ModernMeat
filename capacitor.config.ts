import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gosht.app',
  appName: 'Modern Meat',
  webDir: 'dist',
  server: {
    allowNavigation: ['modernmeat.onrender.com']
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
