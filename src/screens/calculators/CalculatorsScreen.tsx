import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Calculator screens
import UnitCalculatorScreen from './UnitCalculatorScreen';
import TotalCostScreen from './TotalCostScreen';
import DayCounterScreen from './DayCounterScreen';

const Stack = createNativeStackNavigator();

// Home screen for Calculators tab
const CalculatorsHomeScreen = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  
  const calculatorOptions = [
    {
      title: 'Unit Calculator',
      icon: 'shopping-cart',
      description: 'Compare products by unit price',
      screen: 'UnitCalculator',
      color: '#FF9800',
    },
    {
      title: 'Total Cost',
      icon: 'attach-money',
      description: 'Calculate the true cost with additional fees',
      screen: 'TotalCost',
      color: '#4CAF50',
    },
    {
      title: 'Day Counter',
      icon: 'date-range',
      description: 'Find the number of days between dates',
      screen: 'DayCounter',
      color: '#2196F3',
    },
  ];
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {calculatorOptions.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.navigate(option.screen)}
        >
          <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
            <Icon name={option.icon} size={32} color="#FFFFFF" />
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{option.title}</Text>
            <Text style={[styles.cardDescription, { color: theme.tabBarInactive }]}>
              {option.description}
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color={theme.tabBarInactive} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

// Main navigator for Calculators tab
const CalculatorsScreen = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="CalculatorsHome" 
        component={CalculatorsHomeScreen} 
        options={{ title: 'Calculators' }}
      />
      <Stack.Screen 
        name="UnitCalculator" 
        component={UnitCalculatorScreen} 
        options={{ title: 'Unit Calculator' }}
      />
      <Stack.Screen 
        name="TotalCost" 
        component={TotalCostScreen} 
        options={{ title: 'Total Cost' }}
      />
      <Stack.Screen 
        name="DayCounter" 
        component={DayCounterScreen} 
        options={{ title: 'Day Counter' }}
      />
    </Stack.Navigator>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
  },
});

export default CalculatorsScreen;
