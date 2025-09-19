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

// Create a function to request ATT permission that can be called after onboarding
export const requestATTPermission = async (): Promise<boolean> => {
  try {
    console.log("Requesting App Tracking Transparency permission...");
    const { granted } = await requestTrackingPermissionsAsync();
    
    if (granted) {
      console.log("✅ User granted tracking permission - enabling personalized ads");
    } else {
      console.log("❌ User denied tracking permission - keeping non-personalized ads only");
    }
    
    return granted;
  } catch (error) {
    console.log("ATT permission request failed:", error instanceof Error ? error.message : String(error));
    return false;
  }
};

const App = () => {
  const [attPermissionGranted, setAttPermissionGranted] = useState<boolean | null>(null);

  // Initialize AdMob without tracking first (for non-personalized ads)
  useEffect(() => {
    const initializeAdMobOnly = async () => {
      try {
        const isExpoGo = Constants.appOwnership === "expo";

        if (isExpoGo || !mobileAds) {
          console.log("AdMob not available, showing placeholder");
          setAttPermissionGranted(false);
          return;
        }

        // Initialize AdMob SDK with non-personalized ads first
        await mobileAds().initialize();
        console.log("AdMob SDK initialized with non-personalized ads");
        setAttPermissionGranted(false); // Default to non-personalized
        
      } catch (error) {
        console.log("AdMob initialization failed:", error instanceof Error ? error.message : String(error));
        setAttPermissionGranted(false);
      }
    };

    initializeAdMobOnly();
  }, []);

  const handleATTPermissionUpdate = (granted: boolean) => {
    setAttPermissionGranted(granted);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <ThemeProvider>
            <ATTProvider 
              attPermissionGranted={attPermissionGranted}
              onATTPermissionUpdate={handleATTPermissionUpdate}
            >
              <AppContent />
            </ATTProvider>
          </ThemeProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
