import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, CustomHeader, useTheme } from '../../components';
import { useI18n } from '../../i18n';

const CalculatorsHomeScreen = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const { t } = useI18n();
  
  const calculatorOptions = [
    {
      title: t('unitCalculator'),
      icon: 'shopping-cart',
      description: t('compareProductsByUnitPrice'),
      screen: 'UnitCalculator',
      color: '#FF9800',
    },
    {
      title: t('totalCost'),
      icon: 'attach-money',
      description: t('calculateTrueCostWithFees'),
      screen: 'TotalCost',
      color: '#4CAF50',
    },
    {
      title: t('dayCounter'),
      icon: 'date-range',
      description: t('findDaysBetweenDates'),
      screen: 'DayCounter',
      color: '#2196F3',
    },
    {
      title: t('dayCountdown'),
      icon: 'access-time',
      description: t('countdownToSpecificDate'),
      screen: 'DayCountdown',
      color: '#9C27B0',
    },
  ];
  
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomHeader title={t('calculators')} />
      
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        {calculatorOptions.map((option, index) => (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
});

export default CalculatorsHomeScreen;
