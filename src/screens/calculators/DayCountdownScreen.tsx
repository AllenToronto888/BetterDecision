import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button, CustomHeader, SectionTitle, Share, SwipableRow, useTheme } from '../../components';

interface DateItem {
  id: string;
  name: string;
  date: Date;
  dateOpen: boolean;
}

const DayCountdownScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [calculatorTitle, setCalculatorTitle] = useState('Day Countdown');
  const [dates, setDates] = useState<DateItem[]>([
    {
      id: '1',
      name: 'Important Date 1',
      date: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 30); // Default to 30 days from now
        return date;
      })(),
      dateOpen: false,
    },
  ]);
  const [timeUnit, setTimeUnit] = useState('days');
  
  const timeUnits = ['days', 'weeks', 'months', 'years'];

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
    
    // Convert to selected time unit
    const absDiffDays = Math.abs(diffDays);
    let result = absDiffDays;
    switch (timeUnit) {
      case 'weeks':
        result = absDiffDays / 7;
        break;
      case 'months':
        result = absDiffDays / 30.44; // Average days in a month
        break;
      case 'years':
        result = absDiffDays / 365.25; // Account for leap years
        break;
    }
    
    return {
      daysRemaining: result,
      workingDaysRemaining: Math.abs(workingDays),
      isPastDate: isPast
    };
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const nextTimeUnit = () => {
    const currentIndex = timeUnits.indexOf(timeUnit);
    const nextIndex = (currentIndex + 1) % timeUnits.length;
    setTimeUnit(timeUnits[nextIndex]);
  };

  const formatTimeUnit = (value: number, unit: string) => {
    if (unit === 'days') {
      return Math.round(value).toString();
    }
    return value.toFixed(2);
  };

  const addDate = () => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 30);
    
    const newDateItem: DateItem = {
      id: Date.now().toString(),
      name: `Important Date ${dates.length + 1}`,
      date: newDate,
      dateOpen: false,
    };
    
    setDates([...dates, newDateItem]);
  };

  const clearAllDates = () => {
    setDates([]);
  };

  const updateDateItem = (id: string, field: keyof DateItem, value: any) => {
    setDates(dates.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeDateItem = (id: string) => {
    if (dates.length > 1) {
      setDates(dates.filter(item => item.id !== id));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomHeader
        title="Day Countdown"
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
          actions={
            <Share
              data={{
                dates,
                timeUnit,
                calculationType: 'day_countdown',
              }}
              dataType="calculation"
              title="Day Countdown"
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
                    style={[styles.nameInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                    value={dateItem.name}
                    onChangeText={(value) => updateDateItem(dateItem.id, 'name', value)}
                    placeholder="Date name"
                    placeholderTextColor={theme.colors.tabBarInactive}
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
                  
                  {dateItem.dateOpen && (
                    <DateTimePicker
                      value={dateItem.date}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        console.log('DateTimePicker event:', event.type, selectedDate);
                        
                        // Close picker immediately
                        setDates(prevDates => 
                          prevDates.map(item => 
                            item.id === dateItem.id 
                              ? { ...item, dateOpen: false }
                              : item
                          )
                        );
                        
                        // Update date if user selected one
                        if (selectedDate && (event.type === 'set' || event.type === undefined)) {
                          setDates(prevDates => 
                            prevDates.map(item => 
                              item.id === dateItem.id 
                                ? { ...item, date: selectedDate }
                                : item
                            )
                          );
                        }
                      }}
                    />
                  )}
                </View>
              </SwipableRow>

              {/* Time Remaining Card */}
              <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                  {countdown.isPastDate ? 'Time since' : 'Time remaining'}
                </Text>
                <View style={styles.resultRow}>
                  <View style={[styles.resultContainer, { backgroundColor: theme.colors.background }]}>
                    <Text style={[styles.resultValue, { color: countdown.isPastDate ? theme.colors.danger : theme.colors.text }]}>
                      {formatTimeUnit(countdown.daysRemaining, timeUnit)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.unitButton, { backgroundColor: theme.colors.primary }]}
                    onPress={nextTimeUnit}
                  >
                    <Text style={styles.unitButtonText}>{timeUnit}</Text>
                    <MaterialIcons name="arrow-drop-down" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Working Time Card */}
              <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Working Time</Text>
                <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
                  Excludes weekends (Mon-Fri only)
                </Text>
                <View style={styles.workingTimeContainer}>
                  <View style={styles.resultRow}>
                    <View style={[styles.resultContainer, { backgroundColor: theme.colors.background, flex: 1 }]}>
                      <Text style={[styles.resultValue, { color: countdown.isPastDate ? theme.colors.danger : theme.colors.text }]}>
                        {countdown.workingDaysRemaining.toString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.unitButton, { backgroundColor: theme.colors.primary }]}
                    >
                      <Text style={styles.unitButtonText}>days</Text>
                      <MaterialIcons name="arrow-drop-down" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {countdown.isPastDate && (
                <View style={[styles.statusCard, { backgroundColor: theme.colors.danger + '20', borderColor: theme.colors.danger }]}>
                  <MaterialIcons name="warning" size={20} color={theme.colors.danger} />
                  <Text style={[styles.statusText, { color: theme.colors.danger, fontSize: 16 }]}>
                    Target date has passed!
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <Button
            title="Add Dates"
            variant="primary"
            icon="add"
            size="large"
            onPress={addDate}
            style={styles.actionButton}
          />
          {dates.length > 0 && (
            <Button
              title="Clear All"
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
    paddingBottom: 100,
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
  unitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  unitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 4,
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
});

export default DayCountdownScreen;
