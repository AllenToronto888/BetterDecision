import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, CustomHeader, useTheme } from '../../components';

// Calculator screens
import CalculatorSavedItemsScreen from './CalculatorSavedItemsScreen';
import DayCounterScreen from './DayCounterScreen';
import TotalCostScreen from './TotalCostScreen';
import UnitCalculatorScreen from './UnitCalculatorScreen';

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
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomHeader title="Calculators" />
      
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
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
    </View>
  );
};

// Main navigator for Calculators tab
const CalculatorsScreen = () => {
  console.log('DEBUG: CalculatorsScreen navigator initializing');
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="CalculatorsHome" 
        component={CalculatorsHomeScreen} 
        options={{ headerShown: false, animation: 'none' }}
      />
      <Stack.Screen 
        name="UnitCalculator" 
        component={UnitCalculatorScreen} 
        options={{ headerShown: false, animation: 'none' }}
      />
      <Stack.Screen 
        name="TotalCost" 
        component={TotalCostScreen} 
        options={{ headerShown: false, animation: 'none' }}
      />
      <Stack.Screen 
        name="DayCounter" 
        component={DayCounterScreen} 
        options={{ headerShown: false, animation: 'none' }}
      />
      <Stack.Screen 
        name="SavedItems" 
        component={CalculatorSavedItemsScreen} 
        options={{ headerShown: false, animation: 'none' }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
});

export default CalculatorsScreen;
