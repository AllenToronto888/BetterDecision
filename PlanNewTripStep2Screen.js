import React, { useState, useRef, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  Image,
  Modal
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '../theme';
import { Header, Button, CreditButton } from '../components';
import { useI18n } from '../hooks/useI18n';
import { creditService } from '../utils/creditService';

const SelectionButton = React.memo(({ 
  option, 
  isSelected, 
  onPress, 
  showRange = false,
  outerStyle,
  t,
}) => {
  const content = (
    <>
      <Text style={isSelected ? styles.selectionButtonTextSelected : styles.selectionButtonText}>
        {option.label}
      </Text>
      {showRange && option.range && (
        <Text style={isSelected ? styles.rangeTextSelected : styles.rangeText}>
          {option.range}
        </Text>
      )}
    </>
  );
  
  return (
    <View style={[styles.buttonOuter, outerStyle]}>
      <TouchableOpacity
        style={styles.buttonInner}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {isSelected ? (
          <LinearGradient
            colors={['#40c3ff', '#0074d9']}
            style={styles.buttonContent}
          >
            {content}
          </LinearGradient>
        ) : (
          <View style={[styles.buttonContent, styles.defaultButton]}>
            {content}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
});

const PlanNewTripStep2Screen = ({ navigation, route }) => {
  const { destination, startDate, endDate, selectedDestinationData } = route.params || {};
  const { t } = useI18n();
  
  const [travellers, setTravellers] = useState('');
  const [budget, setBudget] = useState('');
  const [interests, setInterests] = useState([]);

  const [showErrorModal, setShowErrorModal] = useState(false);
  

  const creditButtonRef = useRef(null); // Add ref for CreditButton
  const scrollViewRef = useRef(null);

  const travellerOptions = [
    { id: 'justme', label: t('justMe') },
    { id: 'couple', label: t('couple') },
    { id: 'friends', label: t('friends') },
    { id: 'family', label: t('family') },
  ];

  const budgetOptions = [
    { id: 'economy', label: t('economy'), range: '' },
    { id: 'moderate', label: t('moderate'), range: '' },
    { id: 'luxury', label: t('luxury'), range: '' },
  ];

  const interestOptions = [
    t('mustSeeAttractions'), t('foodCulinary'), t('adventureOutdoor'), t('cultureHistory'), t('beach'),
    t('nightlifeEntertainment'), t('shoppingMarkets'), t('photographyArt'), t('natureWildlife'), t('sportsFitness'),
    t('localExperiences'), t('musicFestivals'), t('architectureDesign'), t('wellnessSpa'), t('kidFriendly')
  ];

  const handleTravellerSelect = (travellerId) => {
    setTravellers(travellerId);
  };

  const handleBudgetSelect = (budgetId) => {
    setBudget(budgetId);
  };



  const handleInterestToggle = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else if (interests.length < 3) {
      setInterests([...interests, interest]);
    }
  };



  const isFormValid = () => {
    const hasTravellers = travellers !== '';
    const hasBudget = budget !== '';
    return hasTravellers && hasBudget;
  };

  const getValidationErrors = () => {
    const errors = [];
    if (!travellers) errors.push(t('pleaseSelectWhoTravelling'));
    if (!budget) errors.push(t('pleaseSelectBudget'));
    return errors;
  };

    const handleStartPlanning = async () => {
    if (!isFormValid()) {
      setShowErrorModal(true);
      return;
    }

    // Deduct 3 messages immediately when Start Planning button is tapped, regardless of success or failure
    if (creditButtonRef.current) {
      const messagesNeeded = 3; // 3 messages for itinerary generation
      
      console.log(`🚀 [PlanNewTripStep2Screen.handleStartPlanning] SERVICE TAP DETECTED:`);
      console.log(`   🎯 Service: Start Planning Button`);
      console.log(`   💰 Cost: ${messagesNeeded} messages`);
      console.log(`   📊 Current button count: ${creditButtonRef.current?.getMessageCount() || 'unknown'}`);
      
      const deductionSuccess = await creditButtonRef.current.deductMessages(messagesNeeded);
      
      if (!deductionSuccess) {
        // Not enough messages, user will be prompted to upgrade
        return;
      }
      
      // Use setTimeout to ensure state has updated
      setTimeout(() => {
        console.log(`✅ [PlanNewTripStep2Screen] START PLANNING DEDUCTION COMPLETE - Final button count: ${creditButtonRef.current?.getMessageCount() || 'unknown'}`);
      }, 10);
    }

    const tripData = {
      destination,
      startDate,
      endDate,
      travellers,
      budget: budget,
      interests,
      // Include Google Places data if available (FIXED: Now includes place_id)
      ...(selectedDestinationData && {
        destinationData: {
          place_id: selectedDestinationData.id,
          name: selectedDestinationData.name,
          formatted_address: selectedDestinationData.formatted_address,
          geometry: selectedDestinationData.geometry,
          types: selectedDestinationData.types
        }
      })
    };
    
    // Debug logging to verify fix
    console.log('🔧 [DEBUG] PlanNewTripStep2 - Fix Verification:', {
      hasSelectedDestinationData: !!selectedDestinationData,
      destinationDataIncluded: !!tripData.destinationData,
      place_id: tripData.destinationData?.place_id || 'MISSING',
      destination: destination
    });
    
    // Navigate to AI loading screen first, then generate itinerary
    // Credits already deducted - no refund for simplicity if processing fails
    navigation.navigate('AIPlannerLoading', { tripData });
  };
  
  const travellerButtons = useMemo(() => 
    travellerOptions.map((option) => ({
      key: option.id,
      option,
      isSelected: travellers === option.id,
      onPress: () => handleTravellerSelect(option.id)
    })), [travellers]
  );

  const budgetButtons = useMemo(() => 
    budgetOptions.map((option) => ({
      key: option.id,
      option,
      isSelected: budget === option.id,
      onPress: () => handleBudgetSelect(option.id)
    })), [budget]
  );

  const interestButtons = useMemo(() => 
    interestOptions.map((interest) => ({
      key: interest,
      option: { id: interest, label: interest },
      isSelected: interests.includes(interest),
      onPress: () => handleInterestToggle(interest)
    })), [interests]
  );
  
  return (
    <View style={{ flex: 1 }}>
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <View style={styles.headerContainer}>
        <Header 
          title={t('planNewTrip')}
          leftButtons={[{ 
            iconComponent: <MaterialIcons name="chevron-left" size={30} color={colors.text.primary} />, 
            onPress: () => navigation.goBack() 
          }]}
          rightButtons={[]} // No additional right buttons since CreditButton handles the purple button
          style={styles.headerWithButton}
        />
        <CreditButton
          ref={creditButtonRef}
          onNavigateToPremium={() => navigation.navigate('PriceCard')}
                      onMessageCountChanged={(newCount) => {/* Silent */}}
          style={styles.creditButtonPosition}
        />
      </View>

      <View style={styles.mainContent}>
        <KeyboardAvoidingView 
          style={styles.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
        >
          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.contentWrapper}>
              
              <View style={styles.section}>
                <View style={styles.sectionTitleContainer}>
                  <Image source={require('../../assets/icons/Traveller.png')} style={styles.sectionIcon} />
                  <Text style={styles.sectionTitle}>{t('whoTravelling')}</Text>
                </View>
                <View style={styles.buttonGrid}>
                  {travellerButtons.map(({ key, option, isSelected, onPress }) => (
                    <SelectionButton
                      key={key}
                      option={option}
                      isSelected={isSelected}
                      onPress={onPress}
                      t={t}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionTitleContainer}>
                  <Image source={require('../../assets/icons/Budget.png')} style={styles.sectionIcon} />
                  <Text style={styles.sectionTitle}>{t('whatBudget')}</Text>
                </View>
                <View style={styles.buttonGrid}>
                  {budgetButtons.map(({ key, option, isSelected, onPress }) => (
                    <SelectionButton
                      key={key}
                      option={option}
                      isSelected={isSelected}
                      onPress={onPress}
                      showRange={true}
                      t={t}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionTitleContainer}>
                  <Image source={require('../../assets/icons/Interest.png')} style={styles.sectionIcon} />
                  <Text style={styles.sectionTitle}>
                    {t('interests')} <Text style={styles.subtitle}>{t('preferencesUpTo3')}</Text>
                  </Text>
                </View>
                <View style={styles.interestGrid}>
                  {interestOptions.map((interest) => (
                    <SelectionButton
                      key={interest}
                      option={{ id: interest, label: interest }}
                      isSelected={interests.includes(interest)}
                      onPress={() => handleInterestToggle(interest)}
                      outerStyle={{ width: 'auto', marginRight: 12 }}
                      t={t}
                    />
                  ))}
                </View>
              </View>


              
              <View style={styles.bottomSpacing} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
          
      <View style={styles.footer}>
        <Button
          title={t('startPlanning')} 
          onPress={handleStartPlanning}
          variant="primary"
          icon={require('../../assets/icons/Sparkles.png')}
        />
      </View>

      {/* Validation Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.errorModalOverlay}>
          <View style={styles.errorModalContent}>
            <Text style={styles.errorModalTitle}>{t('missingInformation')}</Text>
            <View style={styles.errorModalBody}>
              {getValidationErrors().map((error, index) => (
                <Text key={index} style={styles.errorModalText}>• {error}</Text>
              ))}
            </View>
            <Button
              title={t('ok')}
              onPress={() => setShowErrorModal(false)}
              variant="primary"
              gradientColors={['#8D20C2', '#6D41CE']}
              style={styles.errorModalButton}
            />
          </View>
        </View>
      </Modal>

    </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Header Styles
  headerContainer: {
    position: 'relative', // Allow absolute positioning of CreditButton
  },
  headerWithButton: {
    // Keep Header's original padding and sizing
  },
  creditButtonPosition: {
    position: 'absolute',
    top: 6, // Changed from 12 to 6 for vertical centering (56-44)/2
    right: 16, // 16px spacing as requested
    zIndex: 20, 
  },
  mainContent: {
    flex: 1,
  },
  kav: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentWrapper: {
    paddingHorizontal: 16,
    paddingTop: spacing.padding.md,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 30,
    height: 30,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.text.secondary,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  buttonOuter: {
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: 'transparent',
  },
  buttonInner: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 56,
  },
  buttonContent: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  defaultButton: {
    backgroundColor: colors.surface,
  },
  selectionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.primary,
    textAlign: 'center',
  },
  selectionButtonTextSelected: {
    color: colors.text.onPrimary,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  rangeText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.text.secondary,
    marginTop: 2,
    textAlign: 'center',
  },
  rangeTextSelected: {
    color: colors.text.onPrimary,
    opacity: 0.8,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
    textAlign: 'center',
  },

  interestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  bottomSpacing: {
    height: Platform.OS === 'ios' ? 50 : 30,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: spacing.padding.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.padding.sm : spacing.padding.lg,
    backgroundColor: colors.background,
  },
  
  // Error Modal Styles
  errorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorModalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  errorModalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorModalBody: {
    width: '100%',
    marginBottom: 24,
  },
  errorModalText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: 8,
  },
  errorModalButton: {
    width: '100%',
    height: 48,
  },
});

export default PlanNewTripStep2Screen; 
 
 
 