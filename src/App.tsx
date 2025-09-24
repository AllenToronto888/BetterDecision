import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RateUsComponent } from "./components";
import { ATTProvider } from "./context/ATTContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { useSessionTracking } from "./hooks/useSessionTracking";
import { LanguageProvider } from "./i18n";
import RootNavigator from "./navigation/RootNavigator";
import {
  requestImmediateATTPermission
} from "./utils/attHelpers";
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

  // SOLUTION: Request ATT permission IMMEDIATELY when app starts (for Apple reviewers & iPadOS)
  useEffect(() => {
    const initializeAppWithImmediateATT = async () => {
      try {
        const isExpoGo = Constants.appOwnership === "expo";

        if (isExpoGo || !mobileAds) {
          setAttPermissionGranted(false);
          return;
        }

        const result = await requestImmediateATTPermission();
        
        // Log the result for debugging
        
        setAttPermissionGranted(result.granted);

        await mobileAds().initialize();
        
      } catch (error) {
        console.log("❌ App initialization with ATT failed:", error instanceof Error ? error.message : String(error));
        // Fallback: initialize without ATT permission
        setAttPermissionGranted(false);
        
        try {
          await mobileAds().initialize();
          console.log("📱 AdMob SDK initialized in fallback mode");
        } catch (admobError) {
          console.log("❌ AdMob initialization also failed:", admobError);
        }
      }
    };

    initializeAppWithImmediateATT();
  }, []);

  const handleATTPermissionUpdate = (granted: boolean) => {
    console.log(`🔄 ATT permission updated: ${granted}`);
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
