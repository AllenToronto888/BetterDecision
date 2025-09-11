import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import * as admob from 'react-native-google-mobile-ads';

// Conditionally import AdMob components
let BannerAd: any, BannerAdSize: any, TestIds: any;
let hasAdMob = false;

try {
  BannerAd = admob.BannerAd;
  BannerAdSize = admob.BannerAdSize;
  TestIds = admob.TestIds;
  hasAdMob = true;
} catch (error) {
  // AdMob not available (likely in Expo Go)
  console.log('AdMob not available, showing placeholder');
}

interface AdMobBannerProps {
  /** Custom style for the container */
  style?: any;
  /** Banner size - defaults to FULL_BANNER */
  size?: admob.BannerAdSize;
  /** Whether to show personalized ads */
  showPersonalizedAds?: boolean;
  /** iOS Banner Ad Unit ID */
  iosUnitId?: string;
  /** Android Banner Ad Unit ID */
  androidUnitId?: string;
}

const AdMobBanner: React.FC<AdMobBannerProps> = ({
  style,
  size = hasAdMob ? BannerAdSize?.FULL_BANNER : 'FULL_BANNER',
  showPersonalizedAds = false,
  iosUnitId = "ca-app-pub-9076576179831024/3257889898", // iOS Banner Unit ID
  androidUnitId = "ca-app-pub-9076576179831024/9927240025", // Android Banner Unit ID
}) => {
  // Use test ads in development, real ads in production
  const getAdUnitId = () => {
    if (__DEV__ && hasAdMob) {
      return TestIds.BANNER;
    }
    return Platform.OS === 'ios' ? iosUnitId : androidUnitId;
  };

  // Show placeholder in Expo Go
  if (!hasAdMob) {
    return (
      <View style={[styles.container, styles.placeholder, style]}>
        <Text style={styles.placeholderText}>
          📱 AdMob Banner (Development Build Required)
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={getAdUnitId()}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: !showPersonalizedAds,
        }}
        onAdLoaded={() => {
          console.log('AdMob Banner loaded successfully');
        }}
        onAdFailedToLoad={(error) => {
          console.log('AdMob Banner Error:', error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  placeholder: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    paddingVertical: 20,
    paddingHorizontal: 16,
    minHeight: 50,
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default AdMobBanner;
