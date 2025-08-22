import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, CustomHeader, useTheme } from '../../components';

// Fortune screens
import DiceScreen from './DiceScreen';
import SpinnerScreen from './SpinnerScreen';

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
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomHeader title="Fortune" />
      
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
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
    </View>
  );
};

// Main navigator for Fortune tab
const FortuneScreen = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="FortuneHome" 
        component={FortuneHomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Spinner" 
        component={SpinnerScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Dice" 
        component={DiceScreen} 
        options={{ headerShown: false }}
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
    paddingHorizontal: 24,
  },
});

export default FortuneScreen;
