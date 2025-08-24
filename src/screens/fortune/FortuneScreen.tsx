import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, CustomHeader, useTheme } from '../../components';
import { useI18n } from '../../i18n';

// Fortune screens
import DiceScreen from './DiceScreen';
import SpinnerScreen from './SpinnerScreen';

const Stack = createNativeStackNavigator();

// Home screen for Fortune tab
const FortuneHomeScreen = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const { t } = useI18n();
  
  const fortuneOptions = [
    {
      title: t('spinner'),
      icon: 'refresh',
      description: t('spinToDecideBetweenOptions'),
      screen: 'Spinner',
      color: '#9C27B0',
    },
    {
      title: t('dice'),
      icon: 'casino',
      description: t('rollDiceForRandomNumbers'),
      screen: 'Dice',
      color: '#FF9800',
    },
  ];
  
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomHeader title={t('fortune')} />
      
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
        options={{ headerShown: false, animation: 'none' }}
      />
      <Stack.Screen 
        name="Spinner" 
        component={SpinnerScreen} 
        options={{ headerShown: false, animation: 'none' }}
      />
      <Stack.Screen 
        name="Dice" 
        component={DiceScreen} 
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
    padding: 16,
    paddingHorizontal: 24,
  },
});

export default FortuneScreen;
