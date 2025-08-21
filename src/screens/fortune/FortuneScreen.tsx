import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Fortune screens
import SpinnerScreen from './SpinnerScreen';
import DiceScreen from './DiceScreen';

const Stack = createNativeStackNavigator();

// Home screen for Fortune tab
const FortuneHomeScreen = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  
  const fortuneOptions = [
    {
      title: 'Spinner',
      icon: 'refresh',
      description: 'Spin to decide between options',
      screen: 'Spinner',
      color: '#9C27B0',
    },
    {
      title: 'Dice',
      icon: 'casino',
      description: 'Roll the dice for random numbers',
      screen: 'Dice',
      color: '#FF9800',
    },
  ];
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {fortuneOptions.map((option, index) => (
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

// Main navigator for Fortune tab
const FortuneScreen = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="FortuneHome" 
        component={FortuneHomeScreen} 
        options={{ title: 'Fortune' }}
      />
      <Stack.Screen 
        name="Spinner" 
        component={SpinnerScreen} 
        options={{ title: 'Spinner' }}
      />
      <Stack.Screen 
        name="Dice" 
        component={DiceScreen} 
        options={{ title: 'Dice' }}
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

export default FortuneScreen;
