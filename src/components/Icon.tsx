import React from 'react';
import { Text, View } from 'react-native';

// Try to import MaterialIcons, fallback to text if not available
let MaterialIcons: any;
let hasIcons = false;

try {
  MaterialIcons = require('@expo/vector-icons').MaterialIcons;
  hasIcons = true; // Successfully loaded MaterialIcons
} catch (error) {
  console.log('MaterialIcons not available, using text fallbacks');
  hasIcons = false;
}

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

// Icon name to text/emoji fallbacks
const iconFallbacks: { [key: string]: string } = {
  // Navigation
  'close': '✕',
  'chevron-right': '→',
  'chevron-left': '←',
  'expand-more': '▼',
  'expand-less': '▲',
  
  // Tab bar
  'calculate': '🧮',
  'list': '📝',
  'casino': '🎲',
  'settings': '⚙️',
  
  // Common actions
  'add': '+',
  'remove': '-',
  'delete': '🗑️',
  'delete-sweep': '🧹',
  'clear': '🧹',
  'share': '📤',
  'star': '⭐',
  'check': '✓',
  'check-circle': '✅',
  'cancel': '❌',
  'remove-circle': '⭕',
  'warning': '⚠️',
  
  // Settings
  'brightness-6': '🌓',
  'privacy-tip': '🔒',
  'description': '📄',
  'mail': '📧',
  'language': '🌐',
  'school': '🎓',
  'refresh': '🔄',
  
  // Calendar
  'calendar-today': '📅',
  
  // Calculator home screen icons
  'shopping-cart': '🛒',
  'attach-money': '💰',
  'date-range': '📅',
  'access-time': '⏰',
  
  // Total Cost screen icons
  'local-shipping': '🚚',
  'percent': '%',
  'add-circle-outline': '⊕',
  
  // Lists home screen icons  
  'thumbs-up-down': '👍👎',
  'compare': '⚖️',
  'table-chart': '📊',
  'list-alt': '📋',
  'format-list-bulleted': '📝',
  
  // Fortune home screen icons
  'shuffle': '🔀',
  'rotate-right': '🎡',
  
  // Header icons
  'more-vert': '⋮',
  'more-horiz': '⋯',
  'history': '📜',
  
  // Other
  'note': '📝',
  'build': '🔧',
  'edit': '✏️',
  'save': '💾',
  
  // Default fallback
  'default': '•'
};

export const Icon: React.FC<IconProps> = ({ name, size = 24, color = '#000000', style }) => {
  // Try to use MaterialIcons first if available
  if (MaterialIcons && hasIcons) {
    try {
      return <MaterialIcons name={name as any} size={size} color={color} style={style} />;
    } catch (error) {
      // If specific icon name fails, fall through to emoji fallback
      console.log(`MaterialIcon "${name}" not found, using emoji fallback`);
    }
  }
  
  // Fallback to emoji (used when MaterialIcons not available or specific icon fails)
  const fallbackText = iconFallbacks[name] || iconFallbacks['default'];
  
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Text style={{ 
        fontSize: size * 0.8, 
        color: color,
        textAlign: 'center',
        lineHeight: size 
      }}>
        {fallbackText}
      </Text>
    </View>
  );
};

