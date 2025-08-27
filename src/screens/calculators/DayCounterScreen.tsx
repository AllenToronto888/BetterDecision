import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { CustomHeader, SectionTitle, Share, useTheme } from '../../components';
import { useI18n } from '../../i18n';

const DayCounterScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const { t, currentLanguage } = useI18n();
  const navigation = useNavigation();
  const [calculatorTitle, setCalculatorTitle] = useState(t('dayCounter'));
  


  // Function to get locale for DateTimePicker
  const getLocale = () => {
    const localeMap: Record<string, string> = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'zh-Hans': 'zh-CN',
      'zh-Hant': 'zh-TW',
      'ja': 'ja-JP'
    };
    return localeMap[currentLanguage] || 'en-US';
  };
  
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    // Create date in local timezone (set to start of day to avoid timezone issues)
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    date.setDate(date.getDate() + 30); // Default to 30 days from today
    return date;
  });
  const [includeEndDate, setIncludeEndDate] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<'start' | 'end'>('start');
  const [daysDifference, setDaysDifference] = useState(0);
  const [actualDays, setActualDays] = useState(0);
  const [workingDays, setWorkingDays] = useState(0);


  // Update calculator title when language changes
  useEffect(() => {
    setCalculatorTitle(t('dayCounter'));
  }, [t]);

  useEffect(() => {
    calculateDifference();
  }, [startDate, endDate, includeEndDate]);

  const calculateWorkingDays = (startDate: Date, endDate: Date, includeEndDate: boolean) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Reset hours to avoid timezone issues
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    let workingDaysCount = 0;
    let currentDate = new Date(start);
    
    // Loop through each day from start to end
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
      
      // Count if it's Monday (1) through Friday (5)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        workingDaysCount++;
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Adjust for include end date setting
    if (!includeEndDate) {
      const endDayOfWeek = end.getDay();
      if (endDayOfWeek >= 1 && endDayOfWeek <= 5) {
        workingDaysCount--; // Remove end date if it's a weekday
      }
    }
    
    return workingDaysCount;
  };

  const calculateDifference = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Reset hours to avoid time zone issues
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    // Calculate the difference in days
    let diffTime = end.getTime() - start.getTime();
    let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Add one day if including end date
    if (includeEndDate) {
      diffDays += 1;
    }
    
    // Store the actual days for working time calculation
    setActualDays(diffDays);
    
    // Calculate proper working days using real calendar logic
    const actualWorkingDays = calculateWorkingDays(startDate, endDate, includeEndDate);
    setWorkingDays(actualWorkingDays);
    
    setDaysDifference(diffDays);
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };



  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomHeader
        title={t('dayCounter')}
        leftAction={{
          icon: "chevron-left",
          onPress: () => navigation.goBack()
        }}
      />

      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        <SectionTitle
          title={calculatorTitle}
          onTitleChange={setCalculatorTitle}
          editable={true}
          maxLength={50}
          defaultTitles={[t('dayCounter')]}
          actions={
            <Share
              data={{
                startDate,
                endDate,
                daysDifference,
                includeEndDate,
                calculationType: 'day_counter',
              }}
              dataType="calculation"
              title={t('dayCounterResult')}
              variant="icon"
              onShareSuccess={() => console.log('Shared successfully')}
            />
          }
        />
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{t('from')}</Text>
        <TouchableOpacity
          style={[styles.dateButton, { backgroundColor: theme.colors.background }]}
          onPress={() => {
            setEditingDate('start');
            setDatePickerOpen(true);
          }}
        >
          <Text style={[styles.dateText, { color: theme.colors.text }]}>
            {formatDate(startDate)}
          </Text>
          <MaterialIcons name="calendar-today" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        

        
        <Text style={[styles.cardTitle, { color: theme.colors.text, marginTop: 16 }]}>{t('to')}</Text>
        <TouchableOpacity
          style={[styles.dateButton, { backgroundColor: theme.colors.background }]}
          onPress={() => {
            setEditingDate('end');
            setDatePickerOpen(true);
          }}
        >
          <Text style={[styles.dateText, { color: theme.colors.text }]}>
            {formatDate(endDate)}
          </Text>
          <MaterialIcons name="calendar-today" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        
        {/* Date Picker - Platform specific implementation */}
        {Platform.OS === 'ios' ? (
          <Modal
            visible={datePickerOpen}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setDatePickerOpen(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('selectDate')}</Text>
                  <TouchableOpacity onPress={() => setDatePickerOpen(false)}>
                    <MaterialIcons name="close" size={24} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={editingDate === 'start' ? startDate : endDate}
                  mode="date"
                  display="spinner"
                  themeVariant={isDarkMode ? 'dark' : 'light'}
                  locale={getLocale()}
                  minimumDate={editingDate === 'end' ? startDate : undefined}
                  onChange={(event, selectedDate) => {
                    // On iOS, update immediately (spinner mode)
                    if (selectedDate) {
                      if (editingDate === 'start') {
                        setStartDate(selectedDate);
                      } else {
                        setEndDate(selectedDate);
                      }
                    }
                  }}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => setDatePickerOpen(false)}
                  >
                    <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>{t('done')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        ) : (
          // Android: DateTimePicker handles its own modal
          datePickerOpen && (
            <DateTimePicker
              value={editingDate === 'start' ? startDate : endDate}
              mode="date"
              display="calendar"
              themeVariant={isDarkMode ? 'dark' : 'light'}
              locale={getLocale()}
              minimumDate={editingDate === 'end' ? startDate : undefined}
              onChange={(event, selectedDate) => {
                // On Android, handle the built-in cancel/confirm buttons
                if (event.type === 'set' && selectedDate) {
                  if (editingDate === 'start') {
                    setStartDate(selectedDate);
                  } else {
                    setEndDate(selectedDate);
                  }
                }
                // Close picker regardless of action (set or dismissed)
                setDatePickerOpen(false);
              }}
            />
          )
        )}
        
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: theme.colors.text }]}>{t('includeEndDate')}</Text>
          <Switch
            value={includeEndDate}
            onValueChange={setIncludeEndDate}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.background}
          />
        </View>
      </View>
      
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{t('timeBetween')}</Text>
        <View style={styles.resultRow}>
          <View style={[styles.resultContainer, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.resultValue, { color: theme.colors.text }]}>
              {Math.round(daysDifference).toString()}
            </Text>
          </View>
          <View style={[styles.unitLabel, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.unitLabelText}>{t('days')}</Text>
          </View>
        </View>
      </View>
      
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{t('workingTime')}</Text>
        <Text 
          style={[styles.helperText, { color: theme.colors.textSecondary }]}
          numberOfLines={0}
        >
          {t('excludesWeekends')}
        </Text>
        <View style={styles.workingTimeContainer}>
          <View style={styles.resultRow}>
            <View style={[styles.resultContainer, { backgroundColor: theme.colors.background, flex: 1 }]}>
              <Text style={[styles.resultValue, { color: theme.colors.text }]}>
                {workingDays.toString()}
              </Text>
            </View>
            <View style={[styles.unitLabel, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.unitLabelText}>{t('days')}</Text>
            </View>
          </View>
        </View>
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    paddingBottom: 300,
  },
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  dateText: {
    fontSize: 18,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  switchLabel: {
    fontSize: 18,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultContainer: {
    flex: 3,
    height: 48,
    borderRadius: 4,
    paddingHorizontal: 12,
    justifyContent: 'center',
    marginRight: 8,
  },
  resultValue: {
    fontSize: 18,
  },
  unitLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 4,
    paddingHorizontal: 12,
    minWidth: 80,
  },
  unitLabelText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  helperText: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 22,
    flexWrap: 'wrap',
  },
  workingTimeContainer: {
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalButtons: {
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DayCounterScreen;
