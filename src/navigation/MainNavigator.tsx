import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../i18n';

// Screens
import CalculatorsScreen from '../screens/calculators/CalculatorsScreen';
import FortuneScreen from '../screens/fortune/FortuneScreen';
import ListsScreen from '../screens/lists/ListsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator();

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
          position: 'absolute',
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
      }}
    >
      <Tab.Screen 
        name="Calculators" 
        component={CalculatorsScreen} 
        options={{
          headerShown: false,
          tabBarLabel: t('calculators'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="calculate" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Lists" 
        component={ListsScreen} 
        options={{
          headerShown: false,
          tabBarLabel: t('lists'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="list" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Fortune" 
        component={FortuneScreen} 
        options={{
          headerShown: false,
          tabBarLabel: t('fortune'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="casino" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
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
