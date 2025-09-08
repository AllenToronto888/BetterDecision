import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, CustomHeader, useTheme } from '../../components';
import { useI18n } from '../../i18n';

const FortuneHomeScreen = ({ navigation }: { navigation: any }) => {
  console.log('🔍 DEBUG: FortuneHomeScreen - Component initializing');
  const { theme } = useTheme();
  const { t } = useI18n();
  console.log('🔍 DEBUG: FortuneHomeScreen - Theme and i18n loaded');
  
  // Add layout debugging
  const handleLayout = (event: any) => {
    const { height, width } = event.nativeEvent.layout;
    console.log('🔍 DEBUG: FortuneHomeScreen - Layout measured:', { height, width });
  };
  
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
    <View 
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      onLayout={handleLayout}
    >
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingHorizontal: 24,
  },
});

export default FortuneHomeScreen;
