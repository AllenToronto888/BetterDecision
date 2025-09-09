import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../i18n';

// Tab Home Screens
import CalculatorsHomeScreen from '../screens/calculators/CalculatorsHomeScreen';
import FortuneHomeScreen from '../screens/fortune/FortuneHomeScreen';
import ListsHomeScreen from '../screens/lists/ListsHomeScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

// Detail Screens - All Calculator Screens
import CalculatorSavedItemsScreen from '../screens/calculators/CalculatorSavedItemsScreen';
import DayCountdownScreen from '../screens/calculators/DayCountdownScreen';
import DayCounterScreen from '../screens/calculators/DayCounterScreen';
import TotalCostSavedItemsScreen from '../screens/calculators/TotalCostSavedItemsScreen';
import TotalCostScreen from '../screens/calculators/TotalCostScreen';
import UnitCalculatorSavedItemsScreen from '../screens/calculators/UnitCalculatorSavedItemsScreen';
import UnitCalculatorScreen from '../screens/calculators/UnitCalculatorScreen';

// Detail Screens - All List Screens
import DetailComparisonSavedItemsScreen from '../screens/lists/DetailComparisonSavedItemsScreen';
import DetailComparisonScreen from '../screens/lists/DetailComparisonScreen';
import ProsConsSavedItemsScreen from '../screens/lists/ProsConsSavedItemsScreen';
import ProsConsScreen from '../screens/lists/ProsConsScreen';
import QuickComparisonSavedItemsScreen from '../screens/lists/QuickComparisonSavedItemsScreen';
import QuickComparisonScreen from '../screens/lists/QuickComparisonScreen';

// Detail Screens - All Fortune Screens
import DiceScreen from '../screens/fortune/DiceScreen';
import SpinnerScreen from '../screens/fortune/SpinnerScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Calculators Stack Navigator
const CalculatorsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalculatorsHome" component={CalculatorsHomeScreen} />
      <Stack.Screen name="UnitCalculator" component={UnitCalculatorScreen} />
      <Stack.Screen name="TotalCost" component={TotalCostScreen} />
      <Stack.Screen name="DayCounter" component={DayCounterScreen} />
      <Stack.Screen name="DayCountdown" component={DayCountdownScreen} />
      <Stack.Screen name="SavedItems" component={CalculatorSavedItemsScreen} />
      <Stack.Screen name="UnitCalculatorSavedItems" component={UnitCalculatorSavedItemsScreen} />
      <Stack.Screen name="TotalCostSavedItems" component={TotalCostSavedItemsScreen} />
    </Stack.Navigator>
  );
};

// Lists Stack Navigator
const ListsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ListsHome" component={ListsHomeScreen} />
      <Stack.Screen name="ProsCons" component={ProsConsScreen} />
      <Stack.Screen name="QuickComparison" component={QuickComparisonScreen} />
      <Stack.Screen name="DetailComparison" component={DetailComparisonScreen} />
      <Stack.Screen name="QuickComparisonSavedItems" component={QuickComparisonSavedItemsScreen} />
      <Stack.Screen name="DetailComparisonSavedItems" component={DetailComparisonSavedItemsScreen} />
      <Stack.Screen name="ProsConsSavedItems" component={ProsConsSavedItemsScreen} />
    </Stack.Navigator>
  );
};

// Fortune Stack Navigator
const FortuneStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FortuneHome" component={FortuneHomeScreen} />
      <Stack.Screen name="Spinner" component={SpinnerScreen} />
      <Stack.Screen name="Dice" component={DiceScreen} />
    </Stack.Navigator>
  );
};

// Main Tab Navigator (Root) - Tab bar always visible
const MainNavigator = () => {
  const { theme } = useTheme();
  const { t } = useI18n();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
      }}
    >
      <Tab.Screen 
        name="CalculatorsTab" 
        component={CalculatorsStack} 
        options={{
          headerShown: false,
          tabBarLabel: t('calculators'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="calculate" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="ListsTab" 
        component={ListsStack} 
        options={{
          headerShown: false,
          tabBarLabel: t('lists'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="list" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="FortuneTab" 
        component={FortuneStack} 
        options={{
          headerShown: false,
          tabBarLabel: t('fortune'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="casino" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsScreen} 
        options={{
          headerShown: false,
          tabBarLabel: t('settings'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
