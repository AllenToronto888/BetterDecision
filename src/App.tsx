import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
// Remove direct import to avoid iOS < 14 crashes
// import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RateUsComponent } from "./components";
import { ATTProvider } from "./context/ATTContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { useSessionTracking } from "./hooks/useSessionTracking";
import { LanguageProvider } from "./i18n";
import RootNavigator from "./navigation/RootNavigator";
// Conditionally import mobileAds to avoid Expo Go crashes
let mobileAds: any;
try {
  mobileAds = require("react-native-google-mobile-ads").default;
} catch (error) {
  // AdMob not available in Expo Go
  console.log('AdMob module not available');
}

const AppContent = () => {
  const { theme, isDarkMode } = useTheme();
  const { shouldShowRateUs, sessionCount } = useSessionTracking();
  const [showRateUsModal, setShowRateUsModal] = useState(false);
  // Show rate us modal when conditions are met
  React.useEffect(() => {
    if (shouldShowRateUs) {
      // Small delay to let the app fully load
      const timer = setTimeout(() => {
        setShowRateUsModal(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [shouldShowRateUs]);

  const navigationTheme = {
    ...DefaultTheme,
    dark: isDarkMode,
    colors: {
      ...DefaultTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.primary,
    },
  };

  return (
    <>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <NavigationContainer theme={navigationTheme}>
        <RootNavigator />
      </NavigationContainer>

      {/* Rate Us Modal */}
      <RateUsComponent
        visible={showRateUsModal}
        onClose={() => setShowRateUsModal(false)}
        sessionCount={sessionCount}
      />
    </>
  );
};

const App = () => {
  const [attPermissionGranted, setAttPermissionGranted] = useState<boolean | null>(null);

  // Request App Tracking Transparency permission FIRST, then initialize AdMob
  useEffect(() => {
    const initializeAppWithATT = async () => {
      try {
        // Check if we're running in Expo Go using Constants or if mobileAds is not available
        const isExpoGo = Constants.appOwnership === "expo";

        if (isExpoGo || !mobileAds) {
          console.log("AdMob not available, showing placeholder");
          setAttPermissionGranted(false);
          return;
        }

        // Request ATT permission FIRST before any data collection
        console.log("Requesting App Tracking Transparency permission...");
        const { granted } = await requestTrackingPermissionsAsync();
        setAttPermissionGranted(granted);
        
        if (granted) {
          console.log("✅ User granted tracking permission - initializing AdMob with personalized ads");
        } else {
          console.log("❌ User denied tracking permission - initializing AdMob with non-personalized ads only");
        }

        // Initialize AdMob SDK AFTER ATT permission is determined
        await mobileAds().initialize();
        console.log("AdMob SDK initialized successfully");
        
      } catch (error) {
        // Silently handle errors and default to non-personalized ads
        console.log(
          "ATT/AdMob initialization failed:",
          error instanceof Error ? error.message : String(error)
        );
        setAttPermissionGranted(false);
      }
    };

    initializeAppWithATT();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <ThemeProvider>
            <ATTProvider attPermissionGranted={attPermissionGranted}>
              <AppContent />
            </ATTProvider>
          </ThemeProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
