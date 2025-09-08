import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  ScrollView,
  StatusBar,
  FlatList,
  Modal,
  Image,
  Keyboard
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar } from 'react-native-calendars';
import { Header, InputField, Button, ErrorModal, CircleButton } from '../components';
import { colors, typography, spacing } from '../theme';
// Removed static locations import - Google Places API provides better coverage
import { useI18n } from '../hooks/useI18n';
import { AIServices } from '../utils/aiServices';
import { GuestSessionService } from '../services/guestSessionService';

const PlanNewTripScreen = ({ navigation, route }) => {
  const { mode = 'manual' } = route.params || {};
  const { t, currentLanguage } = useI18n();
  
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectingStartDate, setSelectingStartDate] = useState(true);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [destinationToSet, setDestinationToSet] = useState(null);
  const [selectedDestinationData, setSelectedDestinationData] = useState(null); // Store complete Google Places data

  useEffect(() => {
    if (destinationToSet) {
      setDestination(destinationToSet.name);
      setSelectedDestinationData(destinationToSet); // Store complete data for later use
      setShowDestinationDropdown(false);
      console.log(`📍 [PlanNewTrip] Selected destination: ${destinationToSet.name} (${destinationToSet.source})`, {
        place_id: destinationToSet.id,
        mainText: destinationToSet.mainText,
        secondaryText: destinationToSet.secondaryText
      });
      setDestinationToSet(null);
    }
  }, [destinationToSet]);

  // Language mapping for Google Places API
  const getGoogleLanguageCode = (i18nLanguage) => {
    const languageMap = {
      'en': 'en',
      'es': 'es', 
      'fr': 'fr',
      'zh_tw': 'zh-TW',
      'zh_cn': 'zh-CN',
      'ja': 'ja',
      'ko': 'ko'
    };
    return languageMap[i18nLanguage] || 'en';
  };

  // Google Places Autocomplete API call
  const searchPlacesAutocomplete = async (input, language) => {
    try {
      const response = await fetch(`${AIServices.config.supabase.functionsUrl}/real-time-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AIServices.config.supabase.anonKey}`,
        },
        body: JSON.stringify({
          action: 'places_autocomplete',
          input: input,
          language: language,
          types: '(cities)', // Focus on cities for travel destinations
        }),
      });

      if (!response.ok) {
        throw new Error(`Places API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return data.predictions || [];
    } catch (error) {
      console.error('❌ [PlanNewTrip] Places API error:', error);
      return [];
    }
  };

  // Enhanced destination change handler with Google Places API
  const handleDestinationChange = async (text) => {
    setDestination(text);
    
    if (text.length >= 2) { // Start searching after 2 characters (matches API requirement)
      setIsLoadingPlaces(true);
      
      try {
        // Get current language for Google Places API
        const googleLang = getGoogleLanguageCode(currentLanguage);
        
        // Call Google Places Autocomplete API
        const placesResults = await searchPlacesAutocomplete(text, googleLang);
        
        if (placesResults.length > 0) {
          // Format Google Places results
          const formattedPlaces = placesResults.map(place => ({
            id: place.place_id,
            name: place.description,
            mainText: place.structured_formatting?.main_text || place.description,
            secondaryText: place.structured_formatting?.secondary_text || '',
            source: 'google_places'
          }));
          
          setFilteredDestinations(formattedPlaces);
      setShowDestinationDropdown(true);
        } else {
          // No results from Google Places - allow manual entry
          console.log('📍 [PlanNewTrip] No Google Places results, allowing manual entry');
          setFilteredDestinations([]);
          setShowDestinationDropdown(false);
        }
      } catch (error) {
        console.error('❌ [PlanNewTrip] Destination search error:', error);
        
        // Show error modal for API failures
        setErrorMessage(`Failed to search destinations: ${error.message}`);
        setShowErrorModal(true);
        
        // Clear dropdown on error - user can type destination manually
        setFilteredDestinations([]);
        setShowDestinationDropdown(false);
      } finally {
        setIsLoadingPlaces(false);
      }
    } else {
      setShowDestinationDropdown(false);
      setFilteredDestinations([]);
    }
  };

  const selectDestination = (selectedDestination) => {
    Keyboard.dismiss(); // Dismiss the keyboard first
    setDestinationToSet(selectedDestination);
  };

  const formatDateRange = () => {
    if (!startDate && !endDate) return '';
    if (startDate && !endDate) return `${formatDate(startDate)} - Select end date`;
    if (startDate && endDate) return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    return '';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    // Fix timezone issues by parsing date components directly
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    // Use MM/DD/YYYY format (US format)
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const openCalendar = () => {
    // If both dates are selected, start with selecting end date for easier editing
    // If only start date is selected, select end date next
    // If no dates are selected, start with start date
    if (startDate && endDate) {
      setSelectingStartDate(false); // Start with end date for easier editing
    } else if (startDate && !endDate) {
      setSelectingStartDate(false); // Select end date
    } else {
      setSelectingStartDate(true); // Select start date
    }
    setShowCalendar(true);
  };

  const handleDateSelect = (day) => {
    const selectedDate = day.dateString;
    
    if (selectingStartDate) {
      setStartDate(selectedDate);
        setSelectingStartDate(false);
    } else {
      // When selecting end date, allow any valid end date >= start date
      // This allows selecting earlier end dates (like Jun 26 after Jun 27)
      if (selectedDate >= startDate) {
        setEndDate(selectedDate);
      } else {
        // If user selects a date before the start date, treat it as a new start date
        setStartDate(selectedDate);
        setEndDate('');
        setSelectingStartDate(false);
      }
    }
  };

  const handleClearDates = () => {
    setStartDate('');
    setEndDate('');
    setSelectingStartDate(true);
  };

  const getMarkedDates = () => {
    const marked = {};
    
    if (startDate) {
      marked[startDate] = {
        startingDay: true,
        color: colors.primary, // Use theme primary color
        textColor: 'white'
      };
    }
    
    if (endDate) {
      marked[endDate] = {
        endingDay: true,
        color: colors.primary, // Use theme primary color
        textColor: 'white'
      };
    }
    
    // Mark dates between start and end with tertiary color
    if (startDate && endDate) {
      // Fix timezone issues by parsing date components directly
      const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
      const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
      
      const start = new Date(startYear, startMonth - 1, startDay);  // No timezone offset
      const end = new Date(endYear, endMonth - 1, endDay);          // No timezone offset
      const current = new Date(start);
      current.setDate(current.getDate() + 1);
      
      while (current < end) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        marked[dateString] = {
          color: colors.tertiary, // Use tertiary color for the range
          textColor: colors.text.primary,
        };
        current.setDate(current.getDate() + 1);
      }
    }
    
    return marked;
  };

  const handleContinue = async () => {
    if (!isFormValid) {
      setShowErrorModal(true);
      return;
    }
    
    if (mode === 'ai') {
      // Navigate to AI planning step 2 - FIXED: Include destination data with place_id
      navigation.navigate('PlanNewTripStep2', {
        destination,
        startDate,
        endDate,
        selectedDestinationData: selectedDestinationData // Pass the Google Places data
      });
    } else {
      // Navigate to Itinerary List for manual planning
      const tripData = {
        destination,
        startDate,
        endDate,
        // Include Google Places data if available
        ...(selectedDestinationData && {
          destinationData: {
            place_id: selectedDestinationData.id,
            name: selectedDestinationData.name,
            mainText: selectedDestinationData.mainText,
            secondaryText: selectedDestinationData.secondaryText,
            source: selectedDestinationData.source
          }
        })
      };
      
      // Create a trip ID for manual trips so they can be updated instead of creating duplicates
      const manualTripId = await GuestSessionService.cacheAIGeneration(tripData, null, true); // Pass isManualTrip = true
      
      console.log('📍 [PlanNewTrip] Navigating to ItineraryList with manual trip:', { 
        tripData, 
        tripId: manualTripId,
        isManualTrip: true
      });
      navigation.navigate('ItineraryList', { 
        tripData,
        tripId: manualTripId // Pass trip ID so manual trips can be updated instead of creating new ones
      });
    }
  };

  const isFormValid = destination && startDate && endDate;
  const buttonText = mode === 'ai' ? t('continueButton') : t('startPlanning');

  const getValidationErrors = () => {
    const errors = [];
    if (!destination) errors.push(t('pleaseEnterDestination'));
    if (!startDate) errors.push(t('pleaseSelectStartDate'));
    if (!endDate) errors.push(t('pleaseSelectEndDate'));
    return errors;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header using Header component */}
      <Header 
        title={t('planNewTrip')}
        leftButtons={[
          {
            icon: 'chevron-left',
            onPress: () => navigation.goBack()
          }
        ]}
        rightButtons={[]}
      />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.contentWrapper}>
          {/* Destination Input */}
          <View style={styles.inputGroup}>
            <View style={styles.sectionTitleContainer}>
              <Image source={require('../../assets/icons/Destination.png')} style={styles.sectionIcon} />
              <Text style={styles.label}>{t('destination')}</Text>
            </View>
            <InputField
              placeholder={t('whereGoing')}
              value={destination}
              onChangeText={handleDestinationChange}
              leadingIconName={require('../../assets/icons/map.png')} // Use the custom map.png icon
              containerStyle={styles.inputContainer}
            />
            
            {/* Destination Dropdown */}
            {showDestinationDropdown && (
              <View style={styles.dropdown}>
                {isLoadingPlaces && (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>🔍 {t('searchingDestinations')}...</Text>
                  </View>
                )}
                {filteredDestinations.length > 0 && (
                <FlatList
                  data={filteredDestinations}
                    keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => selectDestination(item)}
                        activeOpacity={0.7}
                        delayPressIn={0}
                      >
                        <View style={styles.dropdownItemContent}>
                          <View style={styles.dropdownItemTextContainer}>
                            <Text style={styles.dropdownItemMainText}>{item.mainText}</Text>
                            {item.secondaryText ? (
                              <Text style={styles.dropdownItemSecondaryText}>{item.secondaryText}</Text>
                            ) : null}
                          </View>
                          {item.source === 'google_places' && (
                            <View style={styles.googleBadge}>
                              <Text style={styles.googleBadgeText}>📍</Text>
                            </View>
                          )}
                        </View>
                    </TouchableOpacity>
                  )}
                  style={styles.dropdownList}
                  nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    removeClippedSubviews={false}
                />
                )}
              </View>
            )}
          </View>

          {/* When Input */}
          <View style={styles.inputGroup}>
            <View style={styles.sectionTitleContainer}>
              <Image source={require('../../assets/icons/Date.png')} style={styles.sectionIcon} />
              <Text style={styles.label}>{t('when')}</Text>
            </View>
            <TouchableOpacity onPress={openCalendar}>
              <View style={styles.whenInputWrapper} pointerEvents="none">
                <InputField
                  placeholder={t('checkinCheckout')}
                  value={formatDateRange()}
                  editable={false}
                  trailingIconName="calendar-outline"
                  containerStyle={styles.inputContainer}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomContainer}>
        <Button
          title={buttonText}
          onPress={handleContinue}
          disabled={false}
          variant="primary"
        />
      </View>

      {/* Error Modal */}
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

      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModalContent}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity 
                onPress={() => {
                  if (startDate && endDate) {
                    setSelectingStartDate(!selectingStartDate);
                  }
                }}
                disabled={!startDate || !endDate}
              >
              <Text style={styles.calendarTitle}>
                {(() => {
                  if (!startDate && !endDate) {
                    return t('selectCheckinDate');
                  } else if (startDate && !endDate && !selectingStartDate) {
                    return t('selectCheckoutDate');
                  } else if (startDate && endDate && selectingStartDate) {
                    return t('editCheckinDate');
                  } else if (startDate && endDate && !selectingStartDate) {
                    return t('editCheckoutDate');
                  } else if (selectingStartDate) {
                    return t('selectCheckinDate');
                  } else {
                    return t('selectCheckoutDate');
                  }
                })()}
              </Text>
              </TouchableOpacity>
              <CircleButton 
                onPress={() => setShowCalendar(false)}
                iconText="×"
              />
            </View>
            
            <Calendar
              onDayPress={handleDateSelect}
              markedDates={getMarkedDates()}
              markingType="period"
              minDate={new Date().toISOString().split('T')[0]}
              theme={{
                backgroundColor: colors.surface,
                calendarBackground: colors.surface,
                textSectionTitleColor: colors.text.secondary,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: colors.text.onPrimary,
                todayTextColor: colors.primary,
                dayTextColor: colors.text.primary,
                textDisabledColor: colors.text.placeholder,
                dotColor: colors.primary,
                selectedDotColor: colors.text.onPrimary,
                arrowColor: colors.primary,
                disabledArrowColor: colors.text.placeholder,
                monthTextColor: colors.text.primary,
                indicatorColor: colors.primary,
                textDayFontFamily: 'Inter-Regular',
                textMonthFontFamily: 'Inter-SemiBold',
                textDayHeaderFontFamily: 'Inter-Medium',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14
              }}
            />
            
            <View style={styles.calendarActions}>
              <TouchableOpacity style={styles.clearButton} onPress={handleClearDates}>
                <LinearGradient
                  colors={['#8D20C2', '#6D41CE']}
                  style={styles.clearButtonGradient}
                >
                  <LinearGradient colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.0)']} style={styles.clearButtonReflection} />
                  <Text style={styles.clearButtonText}>{t('clear')}</Text>
                </LinearGradient>
              </TouchableOpacity>
              <Button
                title={t('done')}
                onPress={() => setShowCalendar(false)}
                variant="primary"
                style={styles.doneButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={t('destinationSearchError')}
        message={errorMessage}
        type="error"
        primaryButtonText={t('ok')}
        onPrimaryPress={() => setShowErrorModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  contentWrapper: {
    padding: 16,
    paddingTop: 24,
  },
  inputGroup: {
    marginBottom: 24,
    position: 'relative',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIcon: {
    width: 30,
    height: 30,
    marginRight: 12,
  },
  label: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: colors.text.primary,
  },
  inputContainer: {
    marginBottom: 0,
  },
  dropdown: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
    maxHeight: 220,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownList: {
    maxHeight: 220,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownItemTextContainer: {
    flex: 1,
  },
  dropdownItemMainText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.primary,
  },
  dropdownItemSecondaryText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.text.secondary,
    marginTop: 2,
  },
  googleBadge: {
    marginLeft: 8,
  },
  googleBadgeText: {
    fontSize: 12,
  },
  bottomContainer: {
    padding: 16,
  },
  continueButtonDisabled: {
    opacity: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModalContent: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 16,
    width: '95%',
    maxHeight: '80%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: colors.text.primary,
  },

  calendarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    height: 48,
    borderRadius: 100,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 8,
  },
  clearButtonGradient: {
    flex: 1,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  clearButtonReflection: {
    position: 'absolute',
    top: 4,
    height: 12,
    width: '70%',
    borderRadius: 100,
    zIndex: 1,
  },
  clearButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: colors.text.onPrimary,
    fontWeight: '700',
    zIndex: 2,
  },
  doneButton: {
    flex: 1,
    height: 48,
    maxWidth: '100%',
  },
  whenInputWrapper: {
    // This wrapper ensures the When field stays white even when disabled
    borderRadius: 16,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  errorContainer: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.error,
    marginBottom: 4,
  },
  errorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorModalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 300,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  errorModalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorModalBody: {
    marginBottom: 24,
  },
  errorModalText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.text.secondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  errorModalButton: {
    width: 252,
    height: 44,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text.primary,
  },
});

export default PlanNewTripScreen; 
 
 
 