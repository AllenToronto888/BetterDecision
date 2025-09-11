import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
// Remove direct import to avoid iOS < 14 crashes
// import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import mobileAds from "react-native-google-mobile-ads";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RateUsComponent } from "./components";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { useSessionTracking } from "./hooks/useSessionTracking";
import { LanguageProvider } from "./i18n";
import RootNavigator from "./navigation/RootNavigator";

const AppContent = () => {
  const { theme, isDarkMode } = useTheme();
  const { shouldShowRateUs, sessionCount } = useSessionTracking();
  const [showRateUsModal, setShowRateUsModal] = useState(false);

  // Initialize AdMob SDK without ATT (generic ads only)
  useEffect(() => {
    const initializeAdMob = async () => {
      try {
        // Check if we're running in Expo Go using Constants
        const isExpoGo = Constants.appOwnership === "expo";

        if (isExpoGo) {
          console.log("AdMob not available, showing placeholder");
          return;
        }

        // Initialize AdMob SDK with generic ads (no tracking)
        await mobileAds().initialize();
        console.log("AdMob SDK initialized successfully with generic ads");
      } catch (error) {
        // Silently handle AdMob initialization errors
        console.log(
          "AdMob initialization failed:",
          error instanceof Error ? error.message : String(error)
        );
      }
    };

    initializeAdMob();
  }, []);
  // Request App Tracking Transparency permission on iOS
  useEffect(() => {
    (async () => {
      setTimeout(async () => {
        const { granted } = await requestTrackingPermissionsAsync();
        if (granted) {
          console.log("Yay! I have user permission to track data");
        }
      }, 1000);
    })();
  }, []);
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
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
