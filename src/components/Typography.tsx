import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'button';
  color?: 'primary' | 'secondary' | 'text' | 'textSecondary' | 'danger' | 'success' | 'warning';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  color = 'text',
  weight,
  align = 'left',
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();

  const getVariantStyle = () => {
    switch (variant) {
      case 'h1':
        return {
          fontSize: theme.typography.sizes['5xl'],
          lineHeight: theme.typography.lineHeights['5xl'],
          fontWeight: theme.typography.weights.bold,
        };
      case 'h2':
        return {
          fontSize: theme.typography.sizes['4xl'],
          lineHeight: theme.typography.lineHeights['4xl'],
          fontWeight: theme.typography.weights.bold,
        };
      case 'h3':
        return {
          fontSize: theme.typography.sizes['3xl'],
          lineHeight: theme.typography.lineHeights['3xl'],
          fontWeight: theme.typography.weights.bold,
        };
      case 'h4':
        return {
          fontSize: theme.typography.sizes['2xl'],
          lineHeight: theme.typography.lineHeights['2xl'],
          fontWeight: theme.typography.weights.semibold,
        };
      case 'h5':
        return {
          fontSize: theme.typography.sizes.xl,
          lineHeight: theme.typography.lineHeights.xl,
          fontWeight: theme.typography.weights.semibold,
        };
      case 'h6':
        return {
          fontSize: theme.typography.sizes.lg,
          lineHeight: theme.typography.lineHeights.lg,
          fontWeight: theme.typography.weights.semibold,
        };
      case 'body1':
        return {
          fontSize: theme.typography.sizes.base,
          lineHeight: theme.typography.lineHeights.base,
          fontWeight: theme.typography.weights.normal,
        };
      case 'body2':
        return {
          fontSize: theme.typography.sizes.sm,
          lineHeight: theme.typography.lineHeights.sm,
          fontWeight: theme.typography.weights.normal,
        };
      case 'caption':
        return {
          fontSize: theme.typography.sizes.xs,
          lineHeight: theme.typography.lineHeights.xs,
          fontWeight: theme.typography.weights.normal,
        };
      case 'button':
        return {
          fontSize: theme.typography.sizes.base,
          lineHeight: theme.typography.lineHeights.base,
          fontWeight: theme.typography.weights.semibold,
        };
      default:
        return {
          fontSize: theme.typography.sizes.base,
          lineHeight: theme.typography.lineHeights.base,
          fontWeight: theme.typography.weights.normal,
        };
    }
  };

  const getColor = () => {
    switch (color) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'text':
        return theme.colors.text;
      case 'textSecondary':
        return theme.colors.textSecondary;
      case 'danger':
        return theme.colors.danger;
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      default:
        return theme.colors.text;
    }
  };

  const getWeight = () => {
    if (weight) {
      return theme.typography.weights[weight];
    }
    return undefined;
  };

  const textStyle = [
    getVariantStyle(),
    {
      color: getColor(),
      textAlign: align,
      fontWeight: getWeight() || getVariantStyle().fontWeight,
    },
    style,
  ];

  return (
    <Text style={textStyle} {...props}>
      {children}
    </Text>
  );
};

// Convenience components for common use cases
export const Heading1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h1" {...props} />
);

export const Heading2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h2" {...props} />
);

export const Heading3: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h3" {...props} />
);

export const BodyText: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body1" {...props} />
);

export const Caption: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="caption" {...props} />
);
