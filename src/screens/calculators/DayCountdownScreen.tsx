import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button, CustomHeader, SectionTitle, Share, SwipableRow, useTheme } from '../../components';
import { useI18n } from '../../i18n';

interface DateItem {
  id: string;
  name: string;
  date: Date;
  dateOpen: boolean;
}

const DayCountdownScreen = () => {
  const { theme } = useTheme();
  const { t, currentLanguage } = useI18n();
  const navigation = useNavigation();
  const [calculatorTitle, setCalculatorTitle] = useState(t('dayCountdown'));
  


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
  
  const [dates, setDates] = useState<DateItem[]>([
    {
      id: '1',
      name: `${t('importantDate')} 1`,
      date: (() => {
        const today = new Date();
        // Create date in local timezone (set to start of day to avoid timezone issues)
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        date.setDate(date.getDate() + 30); // Default to 30 days from today
        return date;
      })(),
      dateOpen: false,
    },
  ]);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Update calculator title and initial data when language changes
  useEffect(() => {
    setCalculatorTitle(t('dayCountdown'));
    setDates(prevDates => 
      prevDates.map((date, index) => ({
        ...date,
        name: `${t('importantDate')} ${index + 1}`
      }))
    );
  }, [t]);

  const calculateWorkingDays = (startDate: Date, endDate: Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Reset hours to avoid timezone issues
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    let workingDaysCount = 0;
    let currentDate = new Date(start);
    
    // Loop through each day from start to end
    while (currentDate < end) {
      const dayOfWeek = currentDate.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
      
      // Count if it's Monday (1) through Friday (5)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        workingDaysCount++;
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return workingDaysCount;
  };

  const calculateDateCountdown = (targetDate: Date) => {
    const now = new Date();
    const target = new Date(targetDate);
    
    // Reset hours for day-based calculation
    const nowDayStart = new Date(now);
    nowDayStart.setHours(0, 0, 0, 0);
    
    const targetDayStart = new Date(target);
    targetDayStart.setHours(0, 0, 0, 0);
    
    // Calculate difference in days
    const diffDays = Math.ceil((targetDayStart.getTime() - nowDayStart.getTime()) / (1000 * 60 * 60 * 24));
    
    // Check if date is in the past
    const isPast = diffDays < 0;
    
    // Calculate working days using proper calendar logic
    const workingDays = calculateWorkingDays(now, target);
    
    const absDiffDays = Math.abs(diffDays);
    
    return {
      daysRemaining: absDiffDays,
      workingDaysRemaining: Math.abs(workingDays),
      isPastDate: isPast
    };
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };



  const addDate = () => {
    const today = new Date();
    // Create date in local timezone
    const newDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    newDate.setDate(newDate.getDate() + 30);
    
    const newDateItem: DateItem = {
      id: Date.now().toString(),
      name: `${t('importantDate')} ${dates.length + 1}`,
      date: newDate,
      dateOpen: false,
    };
    
    setDates([...dates, newDateItem]);
  };

  const clearAllDates = () => {
    setDates([]);
  };

  const updateDateItem = (id: string, field: keyof DateItem, value: any) => {
    setDates(prevDates => 
      prevDates.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeDateItem = (id: string) => {
    if (dates.length > 1) {
      setDates(dates.filter(item => item.id !== id));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomHeader
        title={t('dayCountdown')}
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
          defaultTitles={[t('dayCountdown')]}
          actions={
            <Share
              data={{
                dates,
                calculationType: 'day_countdown',
              }}
              dataType="calculation"
              title={t('dayCountdown')}
              variant="icon"
              onShareSuccess={() => console.log('Shared successfully')}
            />
          }
        />

        {/* Date Items */}
        {dates.map((dateItem, index) => {
          const countdown = calculateDateCountdown(dateItem.date);
          
          return (
            <View key={dateItem.id}>
              {/* Important Date Card */}
              <SwipableRow
                onDelete={() => removeDateItem(dateItem.id)}
              >
                  <View style={[styles.cardInSwipeableRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <TextInput
                    style={[
                      styles.nameInput, 
                      { backgroundColor: theme.colors.background, color: theme.colors.text },
                      focusedInput === `dateName-${dateItem.id}` && { borderWidth: 2, borderColor: theme.colors.primary }
                    ]}
                    value={dateItem.name}
                    onChangeText={(value) => updateDateItem(dateItem.id, 'name', value)}
                    placeholder={t('dateName')}
                    placeholderTextColor={theme.colors.tabBarInactive}
                    onFocus={() => setFocusedInput(`dateName-${dateItem.id}`)}
                    onBlur={() => setFocusedInput(null)}
                  />
                  
                  <TouchableOpacity
                    style={[styles.dateButton, { backgroundColor: theme.colors.background }]}
                    onPress={() => updateDateItem(dateItem.id, 'dateOpen', true)}
                  >
                    <Text style={[styles.dateText, { color: theme.colors.text }]}>
                      {formatDate(dateItem.date)}
                    </Text>
                    <MaterialIcons name="calendar-today" size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                  
                  <Modal
                    visible={dateItem.dateOpen}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => {
                      setDates(prevDates => 
                        prevDates.map(item => 
                          item.id === dateItem.id 
                            ? { ...item, dateOpen: false }
                            : item
                        )
                      );
                    }}
                  >
                    <View style={Platform.OS === 'ios' ? styles.modalOverlay : {}}>
                      <View style={Platform.OS === 'ios' ? [styles.modalContent, { backgroundColor: theme.colors.card }] : {}}>
                        {Platform.OS === 'ios' && (
                          <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('selectDate')}</Text>
                            <TouchableOpacity onPress={() => {
                              setDates(prevDates => 
                                prevDates.map(item => 
                                  item.id === dateItem.id 
                                    ? { ...item, dateOpen: false }
                                    : item
                                )
                              );
                            }}>
                              <MaterialIcons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                          </View>
                        )}
                        <DateTimePicker
                          value={dateItem.date}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                          locale={getLocale()}
                          onChange={(event, selectedDate) => {
                            if (Platform.OS === 'android') {
                              // On Android, handle the built-in cancel/confirm buttons
                              if (event.type === 'set' && selectedDate) {
                                updateDateItem(dateItem.id, 'date', selectedDate);
                              }
                              // Close modal regardless of action (set or dismissed)
                              updateDateItem(dateItem.id, 'dateOpen', false);
                            } else {
                              // On iOS, update immediately (spinner mode)
                              if (selectedDate) {
                                updateDateItem(dateItem.id, 'date', selectedDate);
                              }
                            }
                          }}
                        />
                        {Platform.OS === 'ios' && (
                          <View style={styles.modalButtons}>
                            <TouchableOpacity 
                              style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                              onPress={() => {
                                updateDateItem(dateItem.id, 'dateOpen', false);
                              }}
                            >
                              <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>{t('done')}</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  </Modal>
                </View>
              </SwipableRow>

              {/* Time Remaining Card */}
              <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                  {countdown.isPastDate ? t('timeSince') : t('timeRemaining')}
                </Text>
                <View style={styles.resultRow}>
                  <View style={[styles.resultContainer, { backgroundColor: theme.colors.background }]}>
                    <Text style={[styles.resultValue, { color: countdown.isPastDate ? theme.colors.danger : theme.colors.text }]}>
                      {Math.round(countdown.daysRemaining).toString()}
                    </Text>
                  </View>
                  <View style={[styles.unitLabel, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.unitLabelText}>{t('days')}</Text>
                  </View>
                </View>
              </View>

              {/* Working Time Card */}
              <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{t('workingTime')}</Text>
                <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
                  {t('excludesWeekends')}
                </Text>
                <View style={styles.workingTimeContainer}>
                  <View style={styles.resultRow}>
                    <View style={[styles.resultContainer, { backgroundColor: theme.colors.background, flex: 1 }]}>
                      <Text style={[styles.resultValue, { color: countdown.isPastDate ? theme.colors.danger : theme.colors.text }]}>
                        {countdown.workingDaysRemaining.toString()}
                      </Text>
                    </View>
                    <View style={[styles.unitLabel, { backgroundColor: theme.colors.primary }]}>
                      <Text style={styles.unitLabelText}>{t('days')}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {countdown.isPastDate && (
                <View style={[styles.statusCard, { backgroundColor: theme.colors.danger + '20', borderColor: theme.colors.danger }]}>
                  <MaterialIcons name="warning" size={20} color={theme.colors.danger} />
                  <Text style={[styles.statusText, { color: theme.colors.danger, fontSize: 16 }]}>
                    {t('targetDatePassed')}
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <Button
            title={t('addDates')}
            variant="primary"
            icon="add"
            size="large"
            onPress={addDate}
            style={styles.actionButton}
          />
          {dates.length > 0 && (
            <Button
              title={t('clearAll')}
              variant="outline"
              icon="clear"
              size="large"
              onPress={clearAllDates}
              style={styles.actionButton}
            />
          )}
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
  cardInSwipeableRow: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 0, // Remove margin since SwipableRow handles spacing
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
  },
  nameInput: {
    height: 48,
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 18,
    marginBottom: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
  workingTimeContainer: {
    marginTop: 8,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
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

export default DayCountdownScreen;
