import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Card } from '../../components';

// Calculator screens
import DayCounterScreen from './DayCounterScreen';
import TotalCostScreen from './TotalCostScreen';
import UnitCalculatorScreen from './UnitCalculatorScreen';

const Stack = createNativeStackNavigator();

// Home screen for Calculators tab
const CalculatorsHomeScreen = ({ navigation }: { navigation: any }) => {
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
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {calculatorOptions.map((option, index) => (
        <Card
          key={index}
          title={option.title}
          description={option.description}
          icon={option.icon}
          iconColor={option.color}
          onPress={() => navigation.navigate(option.screen)}
        />
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
});

export default CalculatorsScreen;
