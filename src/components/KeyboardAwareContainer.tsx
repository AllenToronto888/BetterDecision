import React from 'react';
import { Platform, StyleSheet, ViewStyle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface KeyboardAwareContainerProps {
  children: React.ReactNode;
  contentContainerStyle?: ViewStyle;
  extraScrollHeight?: number;
  extraHeight?: number;
  bottomPadding?: number;
  showsVerticalScrollIndicator?: boolean;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}

const KeyboardAwareContainer: React.FC<KeyboardAwareContainerProps> = ({
  children,
  contentContainerStyle,
  extraScrollHeight = Platform.OS === 'android' ? 8 : 0,
  extraHeight = Platform.OS === 'android' ? 280 : 0,
  bottomPadding = Platform.OS === 'android' ? 120 : 90,
  showsVerticalScrollIndicator = false,
  keyboardShouldPersistTaps = 'handled',
}) => {
  const defaultContentStyle = {
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: bottomPadding,
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={[defaultContentStyle, contentContainerStyle]}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      keyboardDismissMode="on-drag"
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={extraScrollHeight}
      extraHeight={extraHeight}
      nestedScrollEnabled={true}
    >
      {children}
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default KeyboardAwareContainer;
