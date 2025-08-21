import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Card } from '../../components';

// List screens
import DetailComparisonScreen from './DetailComparisonScreen';
import ProsConsScreen from './ProsConsScreen';
import QuickComparisonScreen from './QuickComparisonScreen';

const Stack = createNativeStackNavigator();

// Home screen for Lists tab
const ListsHomeScreen = ({ navigation }: { navigation: any }) => {
  const listOptions = [
    {
      title: 'Pros & Cons',
      icon: 'thumbs-up-down',
      description: 'Weigh the positives and negatives',
      screen: 'ProsCons',
      color: '#4CAF50',
    },
    {
      title: 'Quick Comparison',
      icon: 'compare',
      description: 'Simple yes/no/partial comparison',
      screen: 'QuickComparison',
      color: '#2196F3',
    },
    {
      title: 'Detail Comparison',
      icon: 'table-chart',
      description: 'Detailed text comparison table',
      screen: 'DetailComparison',
      color: '#9C27B0',
    },
  ];
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {listOptions.map((option, index) => (
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

// Main navigator for Lists tab
const ListsScreen = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ListsHome" 
        component={ListsHomeScreen} 
        options={{ title: 'Lists' }}
      />
      <Stack.Screen 
        name="ProsCons" 
        component={ProsConsScreen} 
        options={{ title: 'Pros & Cons' }}
      />
      <Stack.Screen 
        name="QuickComparison" 
        component={QuickComparisonScreen} 
        options={{ title: 'Quick Comparison' }}
      />
      <Stack.Screen 
        name="DetailComparison" 
        component={DetailComparisonScreen} 
        options={{ title: 'Detail Comparison' }}
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

export default ListsScreen;
