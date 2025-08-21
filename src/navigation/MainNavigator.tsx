import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';

// Screens
import CalculatorsScreen from '../screens/calculators/CalculatorsScreen';
import ListsScreen from '../screens/lists/ListsScreen';
import FortuneScreen from '../screens/fortune/FortuneScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.primary,
        },
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: theme.tabBar,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabBarInactive,
      }}
    >
      <Tab.Screen 
        name="Calculators" 
        component={CalculatorsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="calculate" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Lists" 
        component={ListsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="list" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Fortune" 
        component={FortuneScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="casino" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
