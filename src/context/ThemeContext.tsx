import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { getAppTheme, saveAppTheme } from '../utils/storage';

// Define typography
export const typography = {
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    semiBold: 'System',
  },
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
  },
  lineHeights: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 32,
    '2xl': 36,
    '3xl': 40,
    '4xl': 44,
    '5xl': 48,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Define spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

// Define theme colors with typography and spacing
export const lightTheme = {
  colors: {
    background: '#FFFFFF',
    text: '#000000',
    textSecondary: '#757575',
    primary: '#2196F3',
    secondary: '#FF9800',
    success: '#4CAF50',
    danger: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
    card: '#F5F5F5',
    border: '#E0E0E0',
    tabBar: '#FFFFFF',
    tabBarInactive: '#757575',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  typography,
  spacing,
};

export const darkTheme = {
  colors: {
    background: '#121212',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    primary: '#90CAF9',
    secondary: '#FFCC80',
    success: '#81C784',
    danger: '#E57373',
    warning: '#FFCC80',
    info: '#90CAF9',
    card: '#1E1E1E',
    border: '#333333',
    tabBar: '#1E1E1E',
    tabBarInactive: '#AAAAAA',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  typography,
  spacing,
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
        colors: {
          ...baseTheme.colors,
          primary: customColors.primary,
          secondary: customColors.secondary,
        }
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
