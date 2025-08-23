import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, CustomHeader, useTheme } from '../../components';

// List screens
import ComparisonSavedItemsScreen from './ComparisonSavedItemsScreen';
import DetailComparisonScreen from './DetailComparisonScreen';
import ProsConsScreen from './ProsConsScreen';
import QuickComparisonScreen from './QuickComparisonScreen';

// Placeholder removed - using real ProsConsScreen now

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
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomHeader title="Lists" />
      
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
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
    </View>
  );
};

// Main navigator for Lists tab
const ListsScreen = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ListsHome" 
        component={ListsHomeScreen} 
        options={{ headerShown: false, animation: 'none' }}
      />
      <Stack.Screen 
        name="ProsCons" 
        component={ProsConsScreen} 
        options={{ headerShown: false, animation: 'none' }}
      />
      <Stack.Screen 
        name="QuickComparison" 
        component={QuickComparisonScreen} 
        options={{ headerShown: false, animation: 'none' }}
      />
      <Stack.Screen 
        name="DetailComparison" 
        component={DetailComparisonScreen} 
        options={{ headerShown: false, animation: 'none' }}
      />
      <Stack.Screen 
        name="SavedItems" 
        component={ComparisonSavedItemsScreen} 
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

export default ListsScreen;
