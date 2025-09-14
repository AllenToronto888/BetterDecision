import React from 'react';
import { Text, View } from 'react-native';

// Try to import MaterialIcons, fallback to text if not available
let MaterialIcons: any;
try {
  MaterialIcons = require('@expo/vector-icons').MaterialIcons;
} catch (error) {
  console.log('MaterialIcons not available, using text fallbacks');
}

// Normal operation - try to use MaterialIcons first
let hasIcons = true;

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
  // If MaterialIcons is available, use it
  if (hasIcons && MaterialIcons && typeof MaterialIcons === 'function') {
    try {
      return (
        <MaterialIcons 
          name={name} 
          size={size} 
          color={color} 
          style={style}
        />
      );
    } catch (error) {
      // If MaterialIcons fails, fall through to fallback
      console.log('MaterialIcons failed, using fallback for:', name);
    }
  }
  
  // Fallback to text/emoji
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

