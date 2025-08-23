import { MaterialIcons } from '@expo/vector-icons';
import React, { ReactNode, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    PanGestureHandler,
    PanGestureHandlerGestureEvent,
    State,
} from 'react-native-gesture-handler';
import { useTheme } from '../context/ThemeContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25; // 25% of screen width
const ACTION_WIDTH = 80;

interface SwipableRowProps {
  children: ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
  leftActions?: Array<{
    icon: string;
    color: string;
    onPress: () => void;
  }>;
  rightActions?: Array<{
    icon: string;
    color: string;
    onPress: () => void;
  }>;
  disabled?: boolean;
  onSwipeChange?: (isSwiping: boolean) => void;
  style?: any;
  contentStyle?: any;
}

export const SwipableRow: React.FC<SwipableRowProps> = ({
  children,
  onDelete,
  onEdit,
  leftActions,
  rightActions,
  disabled = false,
  onSwipeChange,
  style,
  contentStyle,
}) => {
  const { theme } = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const lastOffsetX = useRef(0);
  const [isSwipedOpen, setIsSwipedOpen] = useState(false);

  const defaultRightActions = [
    ...(onEdit ? [{
      icon: 'edit',
      color: theme.colors.warning,
      onPress: onEdit,
    }] : []),
    ...(onDelete ? [{
      icon: 'delete',
      color: theme.colors.danger,
      onPress: onDelete,
    }] : []),
  ];

  const finalRightActions = rightActions || defaultRightActions;
  const finalLeftActions = leftActions || [];

  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    if (disabled) return;
    
    const { translationX } = event.nativeEvent;
    const newTranslateX = lastOffsetX.current + translationX;
    
    // Constrain the swipe within bounds
    const maxLeftSwipe = finalLeftActions.length * ACTION_WIDTH;
    const maxRightSwipe = -finalRightActions.length * ACTION_WIDTH;
    
    const constrainedTranslateX = Math.max(
      maxRightSwipe,
      Math.min(maxLeftSwipe, newTranslateX)
    );
    
    translateX.setValue(constrainedTranslateX);
  };

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (disabled) return;
    
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;
      const currentTranslateX = lastOffsetX.current + translationX;
      
      let finalPosition = 0;
      
      // Determine final position based on swipe distance and velocity
      if (currentTranslateX > SWIPE_THRESHOLD || velocityX > 500) {
        // Swipe right - show left actions
        if (finalLeftActions.length > 0) {
          finalPosition = finalLeftActions.length * ACTION_WIDTH;
        }
      } else if (currentTranslateX < -SWIPE_THRESHOLD || velocityX < -500) {
        // Swipe left - show right actions
        if (finalRightActions.length > 0) {
          finalPosition = -finalRightActions.length * ACTION_WIDTH;
        }
      }
      
      // Animate to final position
      Animated.spring(translateX, {
        toValue: finalPosition,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
      
      lastOffsetX.current = finalPosition;
      setIsSwipedOpen(finalPosition !== 0);
      onSwipeChange?.(finalPosition !== 0);
    }
  };

  const resetPosition = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    lastOffsetX.current = 0;
    setIsSwipedOpen(false);
    onSwipeChange?.(false);
  };

  const renderActions = (
    actions: Array<{ icon: string; color: string; onPress: () => void }>,
    isLeft: boolean
  ) => {
    return actions.map((action, index) => (
      <TouchableOpacity
        key={index}
        style={[
          styles.actionButton,
          { backgroundColor: action.color },
          isLeft ? styles.leftAction : styles.rightAction,
        ]}
        onPress={() => {
          action.onPress();
          resetPosition();
        }}
        activeOpacity={0.7}
      >
        <MaterialIcons name={action.icon as any} size={24} color="#FFFFFF" />
      </TouchableOpacity>
    ));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
      {/* Left Actions */}
      {finalLeftActions.length > 0 && (
        <View style={[styles.actionsContainer, styles.leftActionsContainer]}>
          {renderActions(finalLeftActions, true)}
        </View>
      )}
      
      {/* Right Actions */}
      {finalRightActions.length > 0 && (
        <View style={[styles.actionsContainer, styles.rightActionsContainer]}>
          {renderActions(finalRightActions, false)}
        </View>
      )}
      
      {/* Main Content */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        enabled={!disabled}
      >
        <Animated.View
          style={[
            styles.swipableContent,
            {
              transform: [{ translateX }],
              backgroundColor: theme.colors.card,
              borderRadius: isSwipedOpen ? 0 : 8,
            },
            contentStyle,
          ]}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
    borderRadius: 8,
  },
  swipableContent: {
    minHeight: 60,
    justifyContent: 'center',
    zIndex: 2,
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  leftActionsContainer: {
    left: 0,
  },
  rightActionsContainer: {
    right: 0,
  },
  actionButton: {
    width: ACTION_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftAction: {
    // Additional styling for left actions if needed
  },
  rightAction: {
    // Additional styling for right actions if needed
  },
});
