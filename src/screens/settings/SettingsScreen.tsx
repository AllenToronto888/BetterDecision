import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Linking,
    PanResponder,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { CustomHeader, RateUsComponent, useTheme } from '../../components';
import { resetSessionData } from '../../hooks/useSessionTracking';
import { useI18n } from '../../i18n';
import WebViewScreen from './WebViewScreen';

const Stack = createNativeStackNavigator();

// App Store Configuration
const APP_STORE_CONFIG = {
  ios: {
    appId: '6751603616', // Official App Store ID from Apple
    bundleId: 'com.allentoronto888.betterdecision'
  },
  android: {
    packageName: 'com.allentoronto888.betterdecision'
  }
};

const SettingsHomeScreen = ({ navigation }: { navigation: any }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { t, currentLanguage, changeLanguage, supportedLanguages } = useI18n();
  
  // Floating button state
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showRateUsModal, setShowRateUsModal] = useState(false);
  const pan = useRef(new Animated.ValueXY({ x: Dimensions.get('window').width - 84, y: 100 })).current;
  
  // Track drag state to prevent tap when dragging
  const isDragging = useRef(false);
  const dragStartTime = useRef(0);

  // PanResponder for dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only start dragging if moved more than 10 pixels
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        isDragging.current = true;
        dragStartTime.current = Date.now();
        // @ts-ignore - accessing _value for gesture handling
        pan.setOffset({
          // @ts-ignore
          x: pan.x._value,
          // @ts-ignore
          y: pan.y._value,
        });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        // Snap to edges
        const screenWidth = Dimensions.get('window').width;
        // @ts-ignore - accessing _value for position calculation
        const currentX = pan.x._value;
        const snapToRight = currentX > screenWidth / 2;
        
        Animated.spring(pan.x, {
          toValue: snapToRight ? screenWidth - 84 : 20,
          useNativeDriver: false,
        }).start();

        // Reset drag state after a short delay
        setTimeout(() => {
          isDragging.current = false;
        }, 100);
      },
    })
  ).current;
  
  const clearCalculator = () => {
    Alert.alert(
      t('clearCalculatorsDataTitle'),
      t('clearCalculatorsDataMessage'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('clear'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all calculator-related storage
              await AsyncStorage.multiRemove([
                'saved_calculations',
                'better_decision_unit_comparisons',
                'better_decision_total_cost_comparisons'
              ]);
              Alert.alert(t('success'), t('calculatorDataCleared'));
            } catch (error) {
              Alert.alert(t('error'), 'Failed to clear calculator data');
            }
          },
        },
      ]
    );
  };

  const clearLists = () => {
    Alert.alert(
      t('clearListsDataTitle'),
      t('clearListsDataMessage'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('clear'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all lists-related storage
              await AsyncStorage.multiRemove([
                'saved_decisions',
                'saved_quick_comparisons',
                'saved_detail_comparisons',
                'better_decision_pros_cons_lists',
                'better_decision_quick_comparisons',
                'better_decision_detail_comparisons'
              ]);
              Alert.alert(t('success'), t('listsDataCleared'));
            } catch (error) {
              Alert.alert(t('error'), 'Failed to clear lists data');
            }
          },
        },
      ]
    );
  };
  
  const clearAllData = () => {
    Alert.alert(
      t('clearAllDataTitle'),
      t('clearAllDataMessage'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear ALL app data
              await AsyncStorage.clear();
              Alert.alert(t('success'), t('allDataCleared'));
            } catch (error) {
              Alert.alert(t('error'), 'Failed to clear all data');
            }
          },
        },
      ]
    );
  };
  
  const rateApp = async () => {
    try {
      if (Platform.OS === 'ios') {
        if (APP_STORE_CONFIG.ios.appId) {
          // Direct link to App Store rating page
          const appStoreUrl = `https://apps.apple.com/app/id${APP_STORE_CONFIG.ios.appId}?action=write-review`;
          const supported = await Linking.canOpenURL(appStoreUrl);
          
          if (supported) {
            await Linking.openURL(appStoreUrl);
          } else {
            // Fallback to app page
            await Linking.openURL(`https://apps.apple.com/app/id${APP_STORE_CONFIG.ios.appId}`);
          }
        } else {
          // App not published yet - show search message
          Alert.alert(
            t('rateApp'),
            'Please search for "Better Decision" in the App Store to rate our app.',
            [
              { text: t('cancel'), style: 'cancel' },
              { 
                text: 'Open App Store', 
                onPress: () => Linking.openURL('https://apps.apple.com/') 
              }
            ]
          );
        }
      } else {
        // Android Play Store
        const packageName = APP_STORE_CONFIG.android.packageName;
        const playStoreUrl = `market://details?id=${packageName}`;
        const webPlayStoreUrl = `https://play.google.com/store/apps/details?id=${packageName}`;
        
        try {
          const supported = await Linking.canOpenURL(playStoreUrl);
          if (supported) {
            await Linking.openURL(playStoreUrl);
          } else {
            // Fallback to web version
            await Linking.openURL(webPlayStoreUrl);
          }
        } catch (fallbackError) {
          // If app not published yet, show search message
          Alert.alert(
            t('rateApp'),
            'Please search for "Better Decision" in the Play Store to rate our app.',
            [
              { text: t('cancel'), style: 'cancel' },
              { 
                text: 'Open Play Store', 
                onPress: () => Linking.openURL('https://play.google.com/store') 
              }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Error opening app store:', error);
      Alert.alert(
        t('error'),
        'Unable to open app store. Please search for "Better Decision" in your app store.',
        [{ text: t('ok') }]
      );
    }
  };
  
  const openPrivacyPolicy = () => {
    navigation.navigate('WebView', {
      url: 'https://betterdecision.sequla.net/privacy-policy',
      title: t('privacyPolicy')
    });
  };
  
  const openTermsOfService = () => {
    navigation.navigate('WebView', {
      url: 'https://betterdecision.sequla.net/terms-and-conditions',
      title: t('termsOfService')
    });
  };
  
  const contactUs = () => {
    navigation.navigate('WebView', {
      url: 'https://betterdecision.sequla.net/contact',
      title: t('contactUs')
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomHeader title={t('settings')} />
      
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ 
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 100
        }}
      >
      
      <View style={[styles.section, styles.appearanceSection, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.appearanceSectionTitle, { color: theme.colors.text }]}>{t('appearance')}</Text>
        
        <View style={[styles.settingRow, styles.lastRow, styles.appearanceRow, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="brightness-6" size={24} color="#FFA500" style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{t('darkMode')}</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.background}
          />
        </View>
      </View>
      
      <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('dataManagement')}</Text>
        
        <TouchableOpacity style={[styles.settingRow, { borderBottomColor: theme.colors.border }]} onPress={clearCalculator}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="calculate" size={24} color="#4CAF50" style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{t('clearCalculatorsData')}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.tabBarInactive} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.settingRow, { borderBottomColor: theme.colors.border }]} onPress={clearLists}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="list" size={24} color="#2196F3" style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{t('clearListsData')}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.tabBarInactive} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.settingRow, styles.lastRow, { borderBottomColor: theme.colors.border }]} onPress={clearAllData}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="delete-sweep" size={24} color="#F44336" style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{t('clearAllData')}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.tabBarInactive} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('app')}</Text>
        
        <TouchableOpacity style={[styles.settingRow, { borderBottomColor: theme.colors.border }]} onPress={rateApp}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="star" size={24} color="#FFD700" style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{t('rateApp')}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.tabBarInactive} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.settingRow, { borderBottomColor: theme.colors.border }]} onPress={openPrivacyPolicy}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="privacy-tip" size={24} color="#9C27B0" style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{t('privacyPolicy')}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.tabBarInactive} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.settingRow, { borderBottomColor: theme.colors.border }]} onPress={openTermsOfService}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="description" size={24} color="#607D8B" style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{t('termsOfService')}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.tabBarInactive} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.settingRow, styles.lastRow, { borderBottomColor: theme.colors.border }]} onPress={contactUs}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="mail" size={24} color="#FF5722" style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{t('contactUs')}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.tabBarInactive} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: theme.colors.tabBarInactive }]}>
          Better Decision {t('version')} {Constants.expoConfig?.version}
        </Text>
      </View>
      </ScrollView>
      
      {/* Development Floating Button */}
      {__DEV__ && (
        <>
          {/* Language Dropdown (when expanded) */}
          {showLanguageDropdown && (
            <View style={[styles.languageDropdownOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
              <TouchableOpacity 
                style={styles.dropdownBackdrop} 
                onPress={() => setShowLanguageDropdown(false)}
              />
              <View style={[styles.languageDropdownMenu, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.dropdownTitle, { color: theme.colors.text }]}>Select Language</Text>
                {supportedLanguages.map((lang, index) => (
                  <TouchableOpacity
                    key={lang}
                    style={[
                      styles.languageItem,
                      { borderBottomColor: theme.colors.border },
                      currentLanguage === lang && { backgroundColor: theme.colors.primary + '20' }
                    ]}
                    onPress={() => {
                      changeLanguage(lang);
                      setShowLanguageDropdown(false);
                      setIsExpanded(false);
                    }}
                  >
                    <MaterialIcons 
                      name="language" 
                      size={20} 
                      color={currentLanguage === lang ? theme.colors.primary : theme.colors.tabBarInactive} 
                    />
                    <Text style={[
                      styles.languageItemText, 
                      { color: currentLanguage === lang ? theme.colors.primary : theme.colors.text }
                    ]}>
                      {lang === 'en' ? 'English' :
                       lang === 'es' ? 'Español' :
                       lang === 'fr' ? 'Français' :
                       lang === 'zh-Hans' ? '简体中文' :
                       lang === 'zh-Hant' ? '繁體中文' :
                       lang === 'ja' ? '日本語' : lang}
                    </Text>
                    {currentLanguage === lang && (
                      <MaterialIcons name="check" size={20} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
                
                {/* Cancel Button */}
                <TouchableOpacity
                  style={[styles.cancelButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                  onPress={() => {
                    setShowLanguageDropdown(false);
                  }}
                >
                  <MaterialIcons name="close" size={20} color={theme.colors.tabBarInactive} />
                  <Text style={[styles.cancelButtonText, { color: theme.colors.tabBarInactive }]}>
                    {t('cancel')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Floating Button */}
          <Animated.View
            style={[
              styles.floatingButton,
              { backgroundColor: theme.colors.card + 'CC', borderColor: theme.colors.border },
              { transform: [{ translateX: pan.x }, { translateY: pan.y }] }
            ]}
            {...panResponder.panHandlers}
          >
            {/* Main Button */}
            <TouchableOpacity
              style={styles.mainButton}
              onPress={() => {
                // Don't toggle if we're dragging
                if (!isDragging.current) {
                  setIsExpanded(!isExpanded);
                  setShowLanguageDropdown(false);
                }
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons 
                name={isExpanded ? "close" : "build"} 
                size={24} 
                color={theme.colors.primary} 
              />
            </TouchableOpacity>

            {/* Expanded Menu */}
            {isExpanded && (
              <View style={[styles.expandedMenu, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowLanguageDropdown(true);
                  }}
                >
                  <MaterialIcons name="language" size={20} color={theme.colors.primary} />
                  <Text style={[styles.menuItemText, { color: theme.colors.text }]}>Language</Text>
                  <Text style={[styles.currentLangText, { color: theme.colors.tabBarInactive }]}>
                    {currentLanguage.split('-')[0].toUpperCase()}
                  </Text>
                </TouchableOpacity>
                
                {/* Rate Us Testing */}
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setIsExpanded(false);
                    setShowRateUsModal(true);
                  }}
                >
                  <MaterialIcons name="star" size={20} color="#FFD700" />
                  <Text style={[styles.menuItemText, { color: theme.colors.text }]}>Test Rate Us</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={async () => {
                    setIsExpanded(false);
                    await resetSessionData();
                    Alert.alert('Dev Tools', 'Session data reset! Rate us will show after 20 sessions again.');
                  }}
                >
                  <MaterialIcons name="refresh" size={20} color="#FF5722" />
                  <Text style={[styles.menuItemText, { color: theme.colors.text }]}>Reset Sessions</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </>
      )}
      
      {/* Rate Us Modal for Testing */}
      <RateUsComponent 
        visible={showRateUsModal}
        onClose={() => setShowRateUsModal(false)}
        sessionCount={20}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  appearanceSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  lastRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  appearanceRow: {
    paddingVertical: 4,
  },
  appearanceSection: {
    paddingBottom: 8,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  versionText: {
    fontSize: 14,
  },
  // Floating Button Styles
  floatingButton: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 1000,
  },
  mainButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedMenu: {
    position: 'absolute',
    top: 70,
    left: 0,
    minWidth: 180,
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  currentLangText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Language Dropdown Overlay
  languageDropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  languageDropdownMenu: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  languageItemText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
});

// Main navigator for Settings tab
const SettingsScreen = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="SettingsHome" 
        component={SettingsHomeScreen} 
        options={{ headerShown: false, animation: 'none' }}
      />
      <Stack.Screen 
        name="WebView" 
        component={WebViewScreen} 
        options={{ headerShown: false, animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
};

export default SettingsScreen;
