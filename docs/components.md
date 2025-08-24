# BetterDecision UI Components

This directory contains reusable UI components with a unified theme system.

## Theme System

### Usage
```typescript
import { useTheme } from '../context/ThemeContext';

const { theme } = useTheme();
// Access colors: theme.colors.primary
// Access typography: theme.typography.sizes.lg
// Access spacing: theme.spacing.md
```

### Colors
- `background`, `text`, `textSecondary`
- `primary`, `secondary`, `success`, `danger`, `warning`, `info`
- `card`, `border`, `tabBar`, `tabBarInactive`, `overlay`

### Typography
- **Sizes**: `xs` (12px) to `5xl` (36px)
- **Weights**: `normal`, `medium`, `semibold`, `bold`
- **Line Heights**: Matching sizes for optimal readability

### Spacing
- **Scale**: `xs` (4px) to `5xl` (48px)

## Components

### Card
Interactive card component with icon support.

```typescript
import { Card } from '../components';

<Card
  title="Unit Calculator"
  description="Compare products by unit price"
  icon="shopping-cart"
  iconColor="#FF9800"
  onPress={() => navigation.navigate('UnitCalculator')}
  variant="elevated" // default | outlined | elevated
/>
```

### Button
Themed button with multiple variants and states.

```typescript
import { Button } from '../components';

<Button
  title="Calculate"
  onPress={handleCalculate}
  variant="primary" // primary | secondary | danger | outline | ghost
  size="medium" // small | medium | large
  icon="calculate"
  loading={isLoading}
  disabled={!isValid}
/>
```

### Typography
Consistent text styling across the app.

```typescript
import { Typography, Heading1, BodyText } from '../components';

<Heading1 color="primary">Welcome</Heading1>
<BodyText color="textSecondary">Description text</BodyText>

// Or use the main component
<Typography 
  variant="h2" 
  color="primary" 
  weight="bold"
  align="center"
>
  Custom Text
</Typography>
```

### Header
Navigation header with actions.

```typescript
import { Header } from '../components';

<Header
  title="Calculator"
  subtitle="Unit Price Comparison"
  leftAction={{
    icon: 'arrow-back',
    onPress: () => navigation.goBack()
  }}
  rightActions={[
    {
      icon: 'settings',
      onPress: () => navigation.navigate('Settings')
    }
  ]}
  variant="large" // default | large | small
/>
```

## Migration Guide

### Before (Manual Styling)
```typescript
<TouchableOpacity
  style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
  onPress={() => navigation.navigate(option.screen)}
>
  <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
    <MaterialIcons name={option.icon} size={32} color="#FFFFFF" />
  </View>
  <View style={styles.cardContent}>
    <Text style={[styles.cardTitle, { color: theme.text }]}>{option.title}</Text>
    <Text style={[styles.cardDescription, { color: theme.tabBarInactive }]}>
      {option.description}
    </Text>
  </View>
  <MaterialIcons name="chevron-right" size={24} color={theme.tabBarInactive} />
</TouchableOpacity>
```

### After (Component)
```typescript
<Card
  title={option.title}
  description={option.description}
  icon={option.icon}
  iconColor={option.color}
  onPress={() => navigation.navigate(option.screen)}
/>
```

## Benefits

1. **Consistency**: Unified design system across all screens
2. **Maintainability**: Changes in one place affect the entire app
3. **Developer Experience**: Less code, fewer bugs, faster development
4. **Accessibility**: Built-in support for screen readers and accessibility features
5. **Theme Support**: Automatic dark/light mode and custom color support
6. **Type Safety**: Full TypeScript support with proper interfaces
