import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface CardProps {
  title: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  variant?: 'default' | 'outlined' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  icon,
  iconColor,
  onPress,
  style,
  disabled = false,
  variant = 'default',
}) => {
  const { theme } = useTheme();
  
  const cardStyle = [
    styles.card,
    {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
    },
    variant === 'outlined' && {
      backgroundColor: 'transparent',
      borderWidth: 1,
    },
    variant === 'elevated' && {
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    disabled && { opacity: 0.6 },
    style,
  ];

  const content = (
    <>
      {icon && (
        <View style={[styles.iconContainer, { backgroundColor: iconColor || theme.colors.primary }]}>
          <MaterialIcons name={icon as any} size={32} color="#FFFFFF" />
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{title}</Text>
        {description && (
          <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
      {onPress && (
        <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
      )}
    </>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{content}</View>;
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
  },
});
