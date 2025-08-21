import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

// List screens
import ProsConsScreen from './ProsConsScreen';
import QuickComparisonScreen from './QuickComparisonScreen';
import DetailComparisonScreen from './DetailComparisonScreen';

const Stack = createNativeStackNavigator();

// Home screen for Lists tab
const ListsHomeScreen = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  
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
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {listOptions.map((option, index) => (
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

export default ListsScreen;
