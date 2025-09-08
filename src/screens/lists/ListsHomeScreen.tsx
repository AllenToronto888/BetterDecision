import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, CustomHeader, useTheme } from '../../components';
import { useI18n } from '../../i18n';

const ListsHomeScreen = ({ navigation }: { navigation: any }) => {
  console.log('🔍 DEBUG: ListsHomeScreen - Component initializing');
  const { theme } = useTheme();
  const { t } = useI18n();
  console.log('🔍 DEBUG: ListsHomeScreen - Theme and i18n loaded');
  
  // Add layout debugging
  const handleLayout = (event: any) => {
    const { height, width } = event.nativeEvent.layout;
    console.log('🔍 DEBUG: ListsHomeScreen - Layout measured:', { height, width });
  };
  
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
    <View 
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      onLayout={handleLayout}
    >
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
});

export default ListsHomeScreen;
