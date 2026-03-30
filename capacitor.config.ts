import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.lifeoshub.app",
  appName: "LifeOS Hub",
  webDir: "dist",
  server: {
    // Use HTTPS scheme on Android (required for certain Web APIs and Supabase auth)
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0f0f0f",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: {
      style: "Dark",
      backgroundColor: "#0f0f0f",
    },
  },
};

export default config;
