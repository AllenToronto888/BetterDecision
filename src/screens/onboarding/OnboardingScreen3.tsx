import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../i18n';

const { width, height } = Dimensions.get('window');

interface OnboardingScreen3Props {
  onGetStarted: () => void;
  onBack: () => void;
}

const OnboardingScreen3: React.FC<OnboardingScreen3Props> = ({ onGetStarted, onBack }) => {
  const { theme } = useTheme();
  const { t } = useI18n();

  const renderProgressDots = () => {
    return (
      <View style={styles.progressContainer}>
        <View style={[styles.progressDot, { backgroundColor: theme.colors.tabBarInactive }]} />
        <View style={[styles.progressDot, { backgroundColor: theme.colors.tabBarInactive }]} />
        <View style={[styles.progressDot, { backgroundColor: theme.colors.primary }]} />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>

      {/* Content */}
      <View style={styles.content}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../../../assets/Wheel.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('stillCantDecide')}
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: theme.colors.primary }]}>
          Leave it to luck:{'\n'}spin the wheel, roll the dice.
        </Text>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        <View style={styles.navigationRow}>
          {/* Back Button */}
          <View style={styles.backButtonContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
            >
              <MaterialIcons name="chevron-left" size={36} color={theme.colors.tabBarInactive} />
            </TouchableOpacity>
          </View>

          {/* Progress Dots */}
          {renderProgressDots()}

          {/* Get Started Button */}
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={onGetStarted}
          >
            <MaterialIcons name="chevron-right" size={36} color={theme.colors.tabBarInactive} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  imageContainer: {
    width: width * 0.7,
    height: height * 0.35,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 24,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 40,
    fontStyle: 'italic',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButtonContainer: {
    width: 80,
    alignItems: 'flex-start',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  getStartedButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default OnboardingScreen3;
