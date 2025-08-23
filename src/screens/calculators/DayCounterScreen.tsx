import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { CustomHeader, SectionTitle, Share, useTheme } from '../../components';

const DayCounterScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [calculatorTitle, setCalculatorTitle] = useState('Day Counter');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  });
  const [includeEndDate, setIncludeEndDate] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [daysDifference, setDaysDifference] = useState(0);
  const [actualDays, setActualDays] = useState(0);
  const [workingDays, setWorkingDays] = useState(0);
  const [timeUnit, setTimeUnit] = useState('days');
  
  const timeUnits = ['days', 'weeks', 'months', 'years'];

  useEffect(() => {
    calculateDifference();
  }, [startDate, endDate, includeEndDate, timeUnit]);

  const calculateWorkingDays = (startDate, endDate, includeEndDate) => {
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
    
    // Convert to selected time unit
    let result = diffDays;
    switch (timeUnit) {
      case 'weeks':
        result = diffDays / 7;
        break;
      case 'months':
        result = diffDays / 30.44; // Average days in a month
        break;
      case 'years':
        result = diffDays / 365.25; // Account for leap years
        break;
    }
    
    setDaysDifference(result);
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const nextTimeUnit = () => {
    const currentIndex = timeUnits.indexOf(timeUnit);
    const nextIndex = (currentIndex + 1) % timeUnits.length;
    setTimeUnit(timeUnits[nextIndex]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomHeader
        title="Day Counter"
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
                startDate,
                endDate,
                daysDifference,
                timeUnit,
                includeEndDate,
                calculationType: 'day_counter',
              }}
              dataType="calculation"
              title="Day Counter Result"
              variant="icon"
              onShareSuccess={() => console.log('Shared successfully')}
            />
          }
        />
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>From</Text>
        <TouchableOpacity
          style={[styles.dateButton, { backgroundColor: theme.colors.background }]}
          onPress={() => setStartDateOpen(true)}
        >
          <Text style={[styles.dateText, { color: theme.colors.text }]}>
            {formatDate(startDate)}
          </Text>
          <MaterialIcons name="calendar-today" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        
        {startDateOpen && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setStartDateOpen(false);
              if (selectedDate) {
                setStartDate(selectedDate);
              }
            }}
          />
        )}
        
        <Text style={[styles.cardTitle, { color: theme.colors.text, marginTop: 16 }]}>To</Text>
        <TouchableOpacity
          style={[styles.dateButton, { backgroundColor: theme.colors.background }]}
          onPress={() => setEndDateOpen(true)}
        >
          <Text style={[styles.dateText, { color: theme.colors.text }]}>
            {formatDate(endDate)}
          </Text>
          <MaterialIcons name="calendar-today" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        
        {endDateOpen && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            minimumDate={startDate}
            onChange={(event, selectedDate) => {
              setEndDateOpen(false);
              if (selectedDate) {
                setEndDate(selectedDate);
              }
            }}
          />
        )}
        
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: theme.colors.text }]}>Include end date</Text>
          <Switch
            value={includeEndDate}
            onValueChange={setIncludeEndDate}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.background}
          />
        </View>
      </View>
      
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Time between</Text>
        <View style={styles.resultRow}>
          <View style={[styles.resultContainer, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.resultValue, { color: theme.colors.text }]}>
              {timeUnit === 'days' ? Math.round(daysDifference).toString() : daysDifference.toFixed(2)}
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
      
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Working Time</Text>
        <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
          Excludes weekends (Mon-Fri only)
        </Text>
        <View style={styles.workingTimeContainer}>
          <View style={styles.resultRow}>
            <View style={[styles.resultContainer, { backgroundColor: theme.colors.background, flex: 1 }]}>
              <Text style={[styles.resultValue, { color: theme.colors.text }]}>
                {workingDays.toString()}
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
  workingTimeContainer: {
    marginTop: 8,
  },
});

export default DayCounterScreen;
