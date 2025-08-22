import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface HeaderAction {
  icon: string;
  onPress: () => void;
  disabled?: boolean;
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: HeaderAction;
  rightActions?: HeaderAction[];
  backgroundColor?: string;
  variant?: 'default' | 'large' | 'small';
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftAction,
  rightActions = [],
  backgroundColor,
  variant = 'default',
  style,
}) => {
  const { theme } = useTheme();

  const headerStyle = [
    styles.header,
    styles[variant],
    {
      backgroundColor: backgroundColor || theme.colors.primary,
    },
    style,
  ];

  const titleStyle = [
    styles.title,
    styles[`${variant}Title`],
    { color: '#FFFFFF' },
  ];

  const subtitleStyle = [
    styles.subtitle,
    { color: 'rgba(255, 255, 255, 0.8)' },
  ];

  return (
    <View style={headerStyle}>
      {/* Left Action */}
      <View style={styles.leftContainer}>
        {leftAction && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={leftAction.onPress}
            disabled={leftAction.disabled}
          >
            <MaterialIcons
              name={leftAction.icon as any}
              size={28}
              color={leftAction.disabled ? 'rgba(255, 255, 255, 0.5)' : '#FFFFFF'}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Title and Subtitle */}
      <View style={styles.titleContainer}>
        <Text style={titleStyle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={subtitleStyle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right Actions */}
      <View style={styles.rightContainer}>
        {rightActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.actionButton, index > 0 && styles.actionSpacing]}
            onPress={action.onPress}
            disabled={action.disabled}
          >
            <MaterialIcons
              name={action.icon as any}
              size={28}
              color={action.disabled ? 'rgba(255, 255, 255, 0.5)' : '#FFFFFF'}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  default: {
    paddingVertical: 16,
    minHeight: 56,
  },
  large: {
    paddingVertical: 20,
    minHeight: 72,
  },
  small: {
    paddingVertical: 12,
    minHeight: 48,
  },
  leftContainer: {
    width: 40,
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  rightContainer: {
    flexDirection: 'row',
    width: 40,
    justifyContent: 'flex-end',
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  defaultTitle: {
    fontSize: 18,
  },
  largeTitle: {
    fontSize: 24,
  },
  smallTitle: {
    fontSize: 16,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
    textAlign: 'center',
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSpacing: {
    marginLeft: 8,
  },
});
