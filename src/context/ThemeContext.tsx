import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { getAppTheme, saveAppTheme } from '../utils/storage';

// Define theme colors
export const lightTheme = {
  background: '#FFFFFF',
  text: '#000000',
  primary: '#2196F3',
  secondary: '#FF9800',
  success: '#4CAF50',
  danger: '#F44336',
  card: '#F5F5F5',
  border: '#E0E0E0',
  tabBar: '#FFFFFF',
  tabBarInactive: '#757575',
};

export const darkTheme = {
  background: '#121212',
  text: '#FFFFFF',
  primary: '#90CAF9',
  secondary: '#FFCC80',
  success: '#81C784',
  danger: '#E57373',
  card: '#1E1E1E',
  border: '#333333',
  tabBar: '#1E1E1E',
  tabBarInactive: '#AAAAAA',
};

type Theme = typeof lightTheme;

interface ThemeContextProps {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  customColors: {
    primary: string;
    secondary: string;
  } | null;
  setCustomColors: (colors: { primary: string; secondary: string } | null) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [customColors, setCustomColors] = useState<{ primary: string; secondary: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load saved theme settings
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await getAppTheme();
        if (savedTheme) {
          setIsDarkMode(savedTheme.isDarkMode);
          setCustomColors(savedTheme.customColors || null);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTheme();
  }, []);
  
  // Get the base theme based on dark mode setting
  const baseTheme = isDarkMode ? darkTheme : lightTheme;
  
  // Apply custom colors if available
  const theme = customColors
    ? {
        ...baseTheme,
        primary: customColors.primary,
        secondary: customColors.secondary,
      }
    : baseTheme;
  
  // Save theme settings when changed
  useEffect(() => {
    if (!isLoading) {
      saveAppTheme({
        isDarkMode,
        customColors: customColors || undefined,
      });
    }
  }, [isDarkMode, customColors, isLoading]);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  const updateCustomColors = (colors: { primary: string; secondary: string } | null) => {
    setCustomColors(colors);
  };
  
  if (isLoading) {
    return null; // Or a loading indicator
  }
  
  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        isDarkMode, 
        toggleTheme, 
        customColors, 
        setCustomColors: updateCustomColors 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
