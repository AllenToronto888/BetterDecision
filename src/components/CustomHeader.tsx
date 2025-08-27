import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Typography } from './Typography';

interface CustomHeaderProps {
  title: string;
  leftAction?: {
    icon: keyof typeof MaterialIcons.glyphMap;
    onPress: () => void;
  };
  rightAction?: {
    icon: keyof typeof MaterialIcons.glyphMap;
    onPress: () => void;
  };
  statusBarColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  leftAction,
  rightAction,
  statusBarColor,
  statusBarStyle,
}) => {
  const { theme, isDarkMode } = useTheme();
  const headerBackgroundColor = statusBarColor || (isDarkMode ? theme.colors.background : theme.colors.primary);
  const defaultStatusBarStyle = isDarkMode ? 'light-content' : 'light-content';
  const finalStatusBarStyle = statusBarStyle || defaultStatusBarStyle;

  return (
    <SafeAreaView style={{ backgroundColor: headerBackgroundColor }} edges={['top']}>
      <View style={[styles.customHeader, { backgroundColor: headerBackgroundColor }]}>
        {leftAction ? (
          <TouchableOpacity style={styles.headerButton} onPress={leftAction.onPress}>
            <MaterialIcons name={leftAction.icon} size={36} color={isDarkMode ? theme.colors.text : '#FFFFFF'} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButton} />
        )}
        
        <Typography variant="h4" style={[styles.headerTitle, { color: isDarkMode ? theme.colors.text : '#FFFFFF' }]}>
          {title}
        </Typography>
        
        {rightAction ? (
          <TouchableOpacity style={styles.headerButton} onPress={rightAction.onPress}>
            <MaterialIcons name={rightAction.icon} size={36} color={isDarkMode ? theme.colors.text : '#FFFFFF'} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButton} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerButton: {
    padding: 0,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
});

export default CustomHeader;
