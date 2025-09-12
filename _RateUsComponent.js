import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Linking,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors, typography, spacing } from '../theme';
import { markRateUsDismissed, markRateUsShown } from '../hooks/useSessionTracking';
import { useI18n } from '../hooks/useI18n';
import Button from './Button';
import { CircleButton } from './index';

// App Store Configuration for AITrip Bot
const APP_STORE_CONFIG = {
  ios: {
    appId: '6479147936', // From existing RateUsScreen
    bundleId: 'com.allentoronto888.AITripBot',
    storeUrl: 'https://apps.apple.com/app/id6479147936'
  },
  android: {
    packageName: 'com.allentoronto888.AITripBot', // From app.json
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.allentoronto888.AITripBot'
  }
};

const RateUsComponent = ({ visible, onClose, sessionCount }) => {
  const { t } = useI18n();
  const [selectedRating, setSelectedRating] = useState(0);

  const handleStarPress = (rating) => {
    setSelectedRating(rating);
    
    if (rating >= 4) {
      // High rating - direct to app store
      handleAppStoreReview();
    } else {
      // Low rating - show feedback option
      showFeedbackOption();
    }
  };

  const handleAppStoreReview = async () => {
    try {
      await markRateUsShown(); // Mark as completed
      
      if (Platform.OS === 'ios') {
        // iOS - App Store with direct review action
        const reviewUrl = `https://apps.apple.com/app/id${APP_STORE_CONFIG.ios.appId}?action=write-review`;
        const fallbackUrl = APP_STORE_CONFIG.ios.storeUrl;
        
        try {
          const canOpenReview = await Linking.canOpenURL(reviewUrl);
          if (canOpenReview) {
            await Linking.openURL(reviewUrl);
          } else {
            await Linking.openURL(fallbackUrl);
          }
        } catch (error) {
          console.log('iOS review URL failed, trying fallback');
          await Linking.openURL(fallbackUrl);
        }
        
      } else if (Platform.OS === 'android') {
        // Android - Google Play Store
        const playStoreUrl = APP_STORE_CONFIG.android.playStoreUrl;
        
        try {
          const canOpenPlayStore = await Linking.canOpenURL(playStoreUrl);
          if (canOpenPlayStore) {
            await Linking.openURL(playStoreUrl);
          } else {
            // Fallback to general Play Store
            await Linking.openURL('https://play.google.com/store');
            Alert.alert(
              'Find AI TripBot',
              t('rateUsManualSearch').replace('{storeName}', t('rateUsPlayStore')),
              [{ text: 'OK' }]
            );
          }
        } catch (error) {
          Alert.alert(
            'Rate AI TripBot',
            t('rateUsManualSearch').replace('{storeName}', t('rateUsPlayStore')),
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error opening store:', error);
      const storeName = Platform.OS === 'ios' ? t('rateUsAppStore') : t('rateUsPlayStore');
      Alert.alert(
        t('rateUsUnableToOpenStore'),
        t('rateUsManualSearch').replace('{storeName}', storeName),
        [{ text: 'OK' }]
      );
    }
    onClose();
  };

  const showFeedbackOption = () => {
    Alert.alert(
      t('rateUsThankYou'),
      t('rateUsMoreDetails'),
      [
        {
          text: t('rateUsNotNow'),
          style: 'cancel',
          onPress: onClose,
        },
        {
          text: t('rateUsSendFeedback'),
          onPress: handleEmailFeedback,
        },
      ]
    );
  };

  const handleEmailFeedback = async () => {
    const email = 'info@sequla.net'; // Support email from SettingScreen
    const subject = encodeURIComponent(t('rateUsEmailSubject'));
    const body = encodeURIComponent(`
Hi AI TripBot Team,

I'd like to share some feedback about the app:

[Please share your thoughts here]

Rating given: ${selectedRating}/5 stars

Thank you!
    `);
    
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
    
    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(
          t('rateUsEmailUnavailable'),
          t('rateUsEmailFallback') + ' ' + email
        );
      }
    } catch (error) {
      Alert.alert(
        t('rateUsEmailUnavailable'),
        t('rateUsEmailFallback') + ' ' + email
      );
    }
    onClose();
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleStarPress(star)}
            style={styles.starButton}
          >
            <MaterialIcons
              name="star"
              size={32}
              color={star <= selectedRating ? '#FFD700' : colors.text.secondary}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Cancel button top right */}
          <CircleButton
            style={styles.cancelButton}
            onPress={async () => {
              await markRateUsDismissed();
              onClose();
            }}
            iconText="×"
            iconSize={24}
            iconColor={colors.text.secondary}
          />

          {/* Title without emoji */}
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {t('rateUsTitle')}
          </Text>

          {/* Original subtitle text */}
          <Text style={[styles.message, { color: colors.text.secondary }]}>
            {t('rateUsMessage')}
          </Text>

          {/* Star rating */}
          {renderStars()}

          {/* Humble note */}
          <Text style={[styles.note, { color: colors.text.secondary }]}>
            {t('rateUsStarsNote')}
          </Text>

          {/* Single button with purple gradient (using your Button component) */}
          <Button
            title={t('rateUsMaybeLater')}
            onPress={async () => {
              await markRateUsDismissed();
              onClose();
            }}
            style={styles.maybeLaterButton}
            gradientColors={[colors.purple.primary, colors.purple.secondary]}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.padding.lg,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: spacing.padding.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  cancelButton: {
    position: 'absolute',
    top: 16, // Reduced from spacing.padding.md to 16px
    right: spacing.padding.md,
    padding: spacing.padding.xs,
    zIndex: 1,
  },
  title: {
    fontSize: typography.fontSize.header,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginTop: 16, // Simple 16px top margin
    marginBottom: spacing.margin.md,
  },
  message: {
    fontSize: typography.fontSize.body,
    fontFamily: typography.fonts.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.body,
    marginBottom: spacing.margin.lg,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.margin.md,
    width: '100%', // Ensure full width for proper centering
    alignSelf: 'center', // Center the container itself
  },
  starButton: {
    padding: 6, // Reduced padding for more compact layout
    marginHorizontal: 2, // Reduced margin for tighter spacing
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44, // Ensure consistent touch target size
    minHeight: 44, // Standard touch target height
  },
  note: {
    fontSize: typography.fontSize.caption,
    fontFamily: typography.fonts.secondary,
    textAlign: 'center',
    marginBottom: spacing.margin.lg,
    fontStyle: 'italic',
  },
  maybeLaterButton: {
    width: '100%',
  },
});

export default RateUsComponent;
