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
import { useTheme } from '../context/ThemeContext';
import { markRateUsDismissed, markRateUsShown } from '../hooks/useSessionTracking';
import { useI18n } from '../i18n';
import { Button } from './Button';

// App Store Configuration (same as settings)
const APP_STORE_CONFIG = {
  ios: {
    appId: '6751603616', // Official App Store ID from Apple
    bundleId: 'com.allentoronto888.betterdecision'
  },
  android: {
    packageName: 'com.allentoronto888.betterdecision'
  }
};

interface RateUsComponentProps {
  visible: boolean;
  onClose: () => void;
  sessionCount?: number;
}

const RateUsComponent: React.FC<RateUsComponentProps> = ({ visible, onClose, sessionCount }) => {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [selectedRating, setSelectedRating] = useState<number>(0);

  const handleStarPress = (rating: number) => {
    setSelectedRating(rating);
    
    if (rating >= 4) {
      // High rating - direct to app store (same logic as settings)
      handleAppStoreReview();
    } else {
      // Low rating - show feedback option
      showFeedbackOption();
    }
  };

  // Use the same App Store logic as settings screen
  const handleAppStoreReview = async () => {
    try {
      await markRateUsShown(); // Mark as completed
      
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
            t('searchAppInStore'),
            [
              { text: t('cancel'), style: 'cancel' },
              { 
                text: t('openAppStore'), 
                onPress: () => Linking.openURL('https://apps.apple.com/') 
              }
            ]
          );
        }
      } else if (Platform.OS === 'android') {
        // Android - Google Play Store
        const playStoreUrl = `https://play.google.com/store/apps/details?id=${APP_STORE_CONFIG.android.packageName}`;
        const supported = await Linking.canOpenURL(playStoreUrl);
        
        if (supported) {
          await Linking.openURL(playStoreUrl);
        } else {
          Alert.alert(
            t('rateApp'),
            t('searchAppInPlayStore'),
            [
              { text: t('cancel'), style: 'cancel' },
              { 
                text: t('openPlayStore'), 
                onPress: () => Linking.openURL('https://play.google.com/store') 
              }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Error opening app store:', error);
      Alert.alert(t('error'), t('unableToOpenStore'));
    }
    onClose();
  };

  const showFeedbackOption = () => {
    Alert.alert(
      t('thankYouForFeedback'),
      t('wouldLikeToShareFeedback'),
      [
        {
          text: t('notNow'),
          style: 'cancel',
          onPress: onClose,
        },
        {
          text: t('sendFeedback'),
          onPress: handleEmailFeedback,
        },
      ]
    );
  };

  const handleEmailFeedback = async () => {
    const email = 'info@sequla.ca'; // Support email for feedback
    const subject = encodeURIComponent('Better Decision - App Feedback');
    const body = encodeURIComponent(`
Hi Better Decision Team,

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
          t('emailNotAvailable'),
          t('pleaseEmailUsAt') + ': ' + email
        );
      }
    } catch (error) {
      Alert.alert(
        t('emailNotAvailable'),
        t('pleaseEmailUsAt') + ': ' + email
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
              size={40}
              color={star <= selectedRating ? '#FFD700' : theme.colors.tabBarInactive}
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
        <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
          {/* Personalized title with session count */}
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {t('youHaveBeenUsing')}
          </Text>

          {/* Humble message */}
          <Text style={[styles.message, { color: theme.colors.tabBarInactive }]}>
            {t('rateUsHumbleMessage')}
          </Text>

          {/* Star rating */}
          {renderStars()}

          {/* Humble note */}
          <Text style={[styles.note, { color: theme.colors.tabBarInactive }]}>
            {t('tapStarsToRate')}
          </Text>

          {/* Bottom buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={async () => {
                await markRateUsDismissed();
                onClose();
              }}
            >
              <Text style={[styles.cancelText, { color: theme.colors.tabBarInactive }]}>
                {t('cancel')}
              </Text>
            </TouchableOpacity>
            
            <Button
              title={t('maybeLater')}
              variant="primary"
              size="medium"
              style={styles.maybeLaterButton}
              onPress={async () => {
                await markRateUsDismissed();
                onClose();
              }}
            />
          </View>
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
    paddingHorizontal: 20,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
    marginHorizontal: 2,
  },
  note: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  maybeLaterButton: {
    flex: 1,
  },
});

export default RateUsComponent;
