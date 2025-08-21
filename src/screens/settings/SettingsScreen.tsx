import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
        <Text style={[styles.headerSubtitle, { color: theme.tabBarInactive }]}>
          Customize your app experience
        </Text>
      </View>
      
      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Icon name="brightness-6" size={24} color={theme.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={theme.background}
          />
        </View>
        
        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Icon name="color-lens" size={24} color={theme.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Custom Theme</Text>
          </View>
          <Icon name="chevron-right" size={24} color={theme.tabBarInactive} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Data Management</Text>
        
        <TouchableOpacity style={styles.settingRow} onPress={clearCache}>
          <View style={styles.settingLabelContainer}>
            <Icon name="cleaning-services" size={24} color={theme.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Clear Cache</Text>
          </View>
          <Icon name="chevron-right" size={24} color={theme.tabBarInactive} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingRow} onPress={clearSavedComparisons}>
          <View style={styles.settingLabelContainer}>
            <Icon name="delete" size={24} color={theme.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Clear Saved Comparisons</Text>
          </View>
          <Icon name="chevron-right" size={24} color={theme.tabBarInactive} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>App</Text>
        
        <TouchableOpacity style={styles.settingRow} onPress={rateApp}>
          <View style={styles.settingLabelContainer}>
            <Icon name="star" size={24} color={theme.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Rate App</Text>
          </View>
          <Icon name="chevron-right" size={24} color={theme.tabBarInactive} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingRow} onPress={openPrivacyPolicy}>
          <View style={styles.settingLabelContainer}>
            <Icon name="privacy-tip" size={24} color={theme.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Privacy Policy</Text>
          </View>
          <Icon name="chevron-right" size={24} color={theme.tabBarInactive} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingRow} onPress={openTermsOfService}>
          <View style={styles.settingLabelContainer}>
            <Icon name="description" size={24} color={theme.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Terms of Service</Text>
          </View>
          <Icon name="chevron-right" size={24} color={theme.tabBarInactive} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingRow} onPress={contactUs}>
          <View style={styles.settingLabelContainer}>
            <Icon name="mail" size={24} color={theme.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Contact Us</Text>
          </View>
          <Icon name="chevron-right" size={24} color={theme.tabBarInactive} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: theme.tabBarInactive }]}>
          Better Decision v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
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
