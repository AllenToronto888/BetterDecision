import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, CustomHeader, useTheme } from '../../components';
import { useI18n } from '../../i18n';

// List screens
import DetailComparisonSavedItemsScreen from './DetailComparisonSavedItemsScreen';
import DetailComparisonScreen from './DetailComparisonScreen';
import ProsConsSavedItemsScreen from './ProsConsSavedItemsScreen';
import ProsConsScreen from './ProsConsScreen';
import QuickComparisonSavedItemsScreen from './QuickComparisonSavedItemsScreen';
import QuickComparisonScreen from './QuickComparisonScreen';

// Placeholder removed - using real ProsConsScreen now

const Stack = createNativeStackNavigator();

// Home screen for Lists tab
const ListsHomeScreen = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const { t } = useI18n();
  
  const listOptions = [
    {
      title: t('prosAndCons'),
      icon: 'thumbs-up-down',
      description: t('weighPositivesAndNegatives'),
      screen: 'ProsCons',
      color: '#4CAF50',
    },
    {
      title: t('quickComparison'),
      icon: 'compare',
      description: t('simpleYesNoPartialComparison'),
      screen: 'QuickComparison',
      color: '#2196F3',
    },
    {
      title: t('detailComparison'),
      icon: 'table-chart',
      description: t('detailedTextComparisonTable'),
      screen: 'DetailComparison',
      color: '#9C27B0',
    },
  ];
  
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomHeader title={t('lists')} />
      
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
        name="QuickComparisonSavedItems" 
        component={QuickComparisonSavedItemsScreen} 
        options={{ headerShown: false, animation: 'none' }}
      />
      <Stack.Screen 
        name="DetailComparisonSavedItems" 
        component={DetailComparisonSavedItemsScreen} 
        options={{ headerShown: false, animation: 'none' }}
      />
      <Stack.Screen 
        name="ProsConsSavedItems" 
        component={ProsConsSavedItemsScreen} 
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
