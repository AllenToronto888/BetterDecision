import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider } from './i18n';
import MainNavigator from './navigation/MainNavigator';

const AppContent = () => {
  const { theme, isDarkMode } = useTheme();
  
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
        <MainNavigator />
      </NavigationContainer>
    </>
  );
};

const App = () => {
  console.log('DEBUG: App component initializing');
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
