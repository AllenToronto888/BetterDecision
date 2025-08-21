import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DatePicker from 'react-native-date-picker';

const DayCounterScreen = () => {
  const { theme } = useTheme();
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
  const [timeUnit, setTimeUnit] = useState('days');
  
  const timeUnits = ['days', 'weeks', 'months', 'years'];

  useEffect(() => {
    calculateDifference();
  }, [startDate, endDate, includeEndDate, timeUnit]);

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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>From</Text>
        <TouchableOpacity
          style={[styles.dateButton, { backgroundColor: theme.background }]}
          onPress={() => setStartDateOpen(true)}
        >
          <Text style={[styles.dateText, { color: theme.text }]}>
            {formatDate(startDate)}
          </Text>
          <Icon name="calendar-today" size={20} color={theme.primary} />
        </TouchableOpacity>
        
        <DatePicker
          modal
          open={startDateOpen}
          date={startDate}
          mode="date"
          onConfirm={(date) => {
            setStartDateOpen(false);
            setStartDate(date);
          }}
          onCancel={() => {
            setStartDateOpen(false);
          }}
        />
        
        <Text style={[styles.cardTitle, { color: theme.text, marginTop: 16 }]}>To</Text>
        <TouchableOpacity
          style={[styles.dateButton, { backgroundColor: theme.background }]}
          onPress={() => setEndDateOpen(true)}
        >
          <Text style={[styles.dateText, { color: theme.text }]}>
            {formatDate(endDate)}
          </Text>
          <Icon name="calendar-today" size={20} color={theme.primary} />
        </TouchableOpacity>
        
        <DatePicker
          modal
          open={endDateOpen}
          date={endDate}
          mode="date"
          minimumDate={startDate}
          onConfirm={(date) => {
            setEndDateOpen(false);
            setEndDate(date);
          }}
          onCancel={() => {
            setEndDateOpen(false);
          }}
        />
        
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: theme.text }]}>Include end date</Text>
          <Switch
            value={includeEndDate}
            onValueChange={setIncludeEndDate}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={theme.background}
          />
        </View>
      </View>
      
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Time between</Text>
        <View style={styles.resultRow}>
          <View style={[styles.resultContainer, { backgroundColor: theme.background }]}>
            <Text style={[styles.resultValue, { color: theme.text }]}>
              {daysDifference.toFixed(timeUnit === 'days' ? 0 : 1)}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.unitButton, { backgroundColor: theme.primary }]}
            onPress={nextTimeUnit}
          >
            <Text style={styles.unitButtonText}>{timeUnit}</Text>
            <Icon name="arrow-drop-down" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      {timeUnit !== 'days' && (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Working Time</Text>
          <View style={styles.workingTimeContainer}>
            <Text style={[styles.workingTimeText, { color: theme.text }]}>
              Working time
            </Text>
            <View style={styles.resultRow}>
              <View style={[styles.resultContainer, { backgroundColor: theme.background, flex: 1 }]}>
                <Text style={[styles.resultValue, { color: theme.text }]}>
                  {Math.max(0, Math.floor(daysDifference * 5 / 7)).toString()}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.unitButton, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.unitButtonText}>days</Text>
                <Icon name="arrow-drop-down" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
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
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  switchLabel: {
    fontSize: 16,
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
    marginRight: 4,
  },
  workingTimeContainer: {
    marginTop: 8,
  },
  workingTimeText: {
    fontSize: 14,
    marginBottom: 8,
  },
});

export default DayCounterScreen;
