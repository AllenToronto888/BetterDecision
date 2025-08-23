import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { CustomHeader, useTheme } from '../../components';
import { useI18n } from '../../i18n';
import { clearAllData, clearFeatureData } from '../../utils/storage';

const SettingsScreen = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { t } = useI18n();
  
  const clearCache = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear ALL saved data? This includes all comparisons, calculations, and settings. This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert('Success', 'All data cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const openSavedItems = () => {
    Alert.alert(
      'Saved Items',
      'Choose which type of saved items to view:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Calculations', onPress: () => console.log('Navigate to SavedItemsScreen with calculations') },
        { text: 'Comparisons', onPress: () => console.log('Navigate to SavedItemsScreen with comparisons') },
        { text: 'Decisions', onPress: () => console.log('Navigate to SavedItemsScreen with decisions') }
      ]
    );
  };
  
  const clearSavedComparisons = () => {
    Alert.alert(
      'Clear Lists',
      'Choose which type of lists to clear:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Calculations', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearFeatureData('UNIT_COMPARISONS');
              await clearFeatureData('TOTAL_COST_COMPARISONS');
              Alert.alert('Success', 'All calculations cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear calculations');
            }
          }
        },
        { 
          text: 'Clear Comparisons',
          style: 'destructive', 
          onPress: async () => {
            try {
              await clearFeatureData('QUICK_COMPARISONS');
              await clearFeatureData('DETAIL_COMPARISONS');
              Alert.alert('Success', 'All comparisons cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear comparisons');
            }
          }
        },
        { 
          text: 'Clear Decisions',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearFeatureData('PROS_CONS_LISTS');
              Alert.alert('Success', 'All decisions cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear decisions');
            }
          }
        }
      ]
    );
  };
  
  const rateApp = () => {
    // This would link to the app store
    Alert.alert('Rate App', 'This would open the app store for rating.');
  };
  
  const openPrivacyPolicy = () => {
    Linking.openURL('https://example.com/privacy-policy');
  };
  
  const openTermsOfService = () => {
    Linking.openURL('https://example.com/terms-of-service');
  };
  
  const contactUs = () => {
    Linking.openURL('mailto:support@example.com');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomHeader title={t('settings')} />
      
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: 100 }]}
      >
      
      <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('appearance')}</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="brightness-6" size={24} color={theme.colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{t('darkMode')}</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.background}
          />
        </View>
        

      </View>
      
      <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('dataManagement')}</Text>
        
        <TouchableOpacity style={styles.settingRow} onPress={openSavedItems}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="bookmark" size={24} color={theme.colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{t('savedItems')}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.tabBarInactive} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingRow} onPress={clearCache}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="delete-forever" size={24} color={theme.colors.danger} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{t('clearAllData')}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.tabBarInactive} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingRow} onPress={clearSavedComparisons}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="delete-sweep" size={24} color={theme.colors.warning} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{t('clearLists')}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.tabBarInactive} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('app')}</Text>
        
        <TouchableOpacity style={styles.settingRow} onPress={rateApp}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="star" size={24} color={theme.colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{t('rateApp')}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.tabBarInactive} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingRow} onPress={openPrivacyPolicy}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="privacy-tip" size={24} color={theme.colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{t('privacyPolicy')}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.tabBarInactive} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingRow} onPress={openTermsOfService}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="description" size={24} color={theme.colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{t('termsOfService')}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.tabBarInactive} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingRow} onPress={contactUs}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="mail" size={24} color={theme.colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{t('contactUs')}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.tabBarInactive} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>
          {Constants.expoConfig?.name || 'Better Decision'} v{Constants.expoConfig?.version || '1.0.0'}
        </Text>
      </View>
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
  section: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CCCCCC',
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  versionText: {
    fontSize: 14,
  },
});

export default SettingsScreen;
