import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Card } from '../../components';

// Fortune screens
import DiceScreen from './DiceScreen';
import SpinnerScreen from './SpinnerScreen';

const Stack = createNativeStackNavigator();

// Home screen for Fortune tab
const FortuneHomeScreen = ({ navigation }: { navigation: any }) => {
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
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {fortuneOptions.map((option, index) => (
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
});

export default FortuneScreen;
