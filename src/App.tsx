import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RateUsComponent } from './components';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useSessionTracking } from './hooks/useSessionTracking';
import { LanguageProvider } from './i18n';
import RootNavigator from './navigation/RootNavigator';

const AppContent = () => {
  const { theme, isDarkMode } = useTheme();
  const { shouldShowRateUs, sessionCount } = useSessionTracking();
  const [showRateUsModal, setShowRateUsModal] = useState(false);

  // Initialize AdMob SDK only in development/production builds, not Expo Go
  useEffect(() => {
    const initializeAdMob = async () => {
      try {
        // Check if AdMob is available (not in Expo Go)
        const admob = require('react-native-google-mobile-ads');
        if (admob && admob.default) {
          await admob.default().initialize();
          console.log('AdMob SDK initialized successfully');
        }
      } catch (error) {
        // Silently handle - AdMob not available in Expo Go
        console.log('AdMob not available (likely Expo Go environment)');
      }
    };
    
    initializeAdMob();
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
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
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
