import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
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

const SettingsScreen = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  
  const clearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all cached data? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // Clear cache logic would go here
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const openSavedItems = () => {
    // Note: In a real app, you'd navigate to SavedItemsScreen here
    Alert.alert(
      'Saved Items',
      'Access your saved calculations, comparisons, and decisions.',
      [
        { text: 'OK' },
        { text: 'Open Saved Items', onPress: () => console.log('Navigate to SavedItemsScreen') }
      ]
    );
  };
  
  const clearSavedComparisons = () => {
    Alert.alert(
      'Clear Saved Comparisons',
      'Are you sure you want to delete all saved comparisons? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Clear saved comparisons logic would go here
            Alert.alert('Success', 'Saved comparisons deleted successfully');
          },
        },
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
      <CustomHeader title="Settings" />
      
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
      
      <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Appearance</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="brightness-6" size={24} color={theme.colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Dark Mode</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.background}
          />
        </View>
        
        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="color-lens" size={24} color={theme.colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Custom Theme</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.tabBarInactive} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Data Management</Text>
        
        <TouchableOpacity style={styles.settingRow} onPress={openSavedItems}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="bookmark" size={24} color={theme.colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Saved Items</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.tabBarInactive} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingRow} onPress={clearCache}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="cleaning-services" size={24} color={theme.colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Clear Cache</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.tabBarInactive} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingRow} onPress={clearSavedComparisons}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="delete" size={24} color={theme.colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Clear Saved Comparisons</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.tabBarInactive} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>App</Text>
        
        <TouchableOpacity style={styles.settingRow} onPress={rateApp}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="star" size={24} color={theme.colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Rate App</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.tabBarInactive} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingRow} onPress={openPrivacyPolicy}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="privacy-tip" size={24} color={theme.colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Privacy Policy</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.tabBarInactive} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingRow} onPress={openTermsOfService}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="description" size={24} color={theme.colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Terms of Service</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.tabBarInactive} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingRow} onPress={contactUs}>
          <View style={styles.settingLabelContainer}>
            <MaterialIcons name="mail" size={24} color={theme.colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Contact Us</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.tabBarInactive} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: theme.colors.tabBarInactive }]}>
          Better Decision v1.0.0
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
