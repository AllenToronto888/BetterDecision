import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
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
  statusBarStyle = 'light-content',
}) => {
  const { theme } = useTheme();
  const headerBackgroundColor = statusBarColor || theme.colors.primary;

  return (
    <>
      <StatusBar backgroundColor={headerBackgroundColor} barStyle={statusBarStyle} />
      <View style={[styles.customHeader, { backgroundColor: headerBackgroundColor }]}>
        {leftAction ? (
          <TouchableOpacity style={styles.headerButton} onPress={leftAction.onPress}>
            <MaterialIcons name={leftAction.icon} size={36} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButton} />
        )}
        
        <Typography variant="h4" style={styles.headerTitle}>
          {title}
        </Typography>
        
        {rightAction ? (
          <TouchableOpacity style={styles.headerButton} onPress={rightAction.onPress}>
            <MaterialIcons name={rightAction.icon} size={36} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButton} />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : 32, // Status bar height + 8px
    paddingBottom: 24,
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
