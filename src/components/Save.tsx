import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../i18n';
import { Icon } from './Icon';

import { Button } from './Button';
import { Typography } from './Typography';

interface SaveComponentProps {
  data: any;
  dataType: 'calculation' | 'comparison' | 'decision' | 'quick_comparison' | 'detail_comparison' | 'custom';
  defaultName?: string;
  onSaveSuccess?: (savedName: string) => void;
  onSaveError?: (error: string) => void;
  variant?: 'button' | 'icon';
  showInput?: boolean;
}

interface SavedItem {
  id: string;
  name: string;
  data: any;
  type: string;
  createdAt: string;
  updatedAt: string;
  isAutoSaved?: boolean;
}

export const Save: React.FC<SaveComponentProps> = ({
  data,
  dataType,
  defaultName = '',
  onSaveSuccess,
  onSaveError,
  variant = 'button',
  showInput = true,
}) => {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [saveName, setSaveName] = useState(defaultName);
  const [isSaving, setIsSaving] = useState(false);

  const generateStorageKey = (type: string) => `saved_${type}s`;
  
  const generateDefaultName = () => {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timestamp = `${date} ${time}`;
    
    // Priority 1: Use title if available
    if (data?.title && data.title.trim()) {
      return `${data.title} - ${timestamp}`;
    }
    
    // Priority 2: Use product names if available
    if (dataType === 'calculation' && data?.products) {
      const products = data.products.filter((p: any) => p.name && p.name.trim());
      
      if (products.length >= 2) {
        return `${products[0].name} vs ${products[1].name} - ${timestamp}`;
      } else if (products.length === 1) {
        return `${products[0].name} vs Product B - ${timestamp}`;
      } else {
        return `Product A vs Product B - ${timestamp}`;
      }
    }
    
    // Fallback with timestamp
    return `Comparison - ${timestamp}`;
  };

  const saveData = async (name: string) => {
    try {
      setIsSaving(true);
      
      if (!name.trim()) {
        throw new Error('Please enter a name for your saved item');
      }



      // Use unified storage for all types to match auto-save behavior
      const storageKey = generateStorageKey(dataType);
      const existingData = await AsyncStorage.getItem(storageKey);
      const existingItems: SavedItem[] = existingData ? JSON.parse(existingData) : [];

      // Auto-generate unique name if duplicate exists
      let finalName = name.trim();
      let counter = 1;
      
      while (existingItems.some(item => item.name.toLowerCase() === finalName.toLowerCase())) {
        finalName = `${name.trim()} (${counter})`;
        counter++;
      }

      const newItem: SavedItem = {
        id: Date.now().toString(),
        name: finalName,
        data,
        type: dataType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isAutoSaved: false,
      };

      const updatedItems = [newItem, ...existingItems];
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedItems));
      
      // Use the final generated name for success callback
      onSaveSuccess?.(finalName);
      setIsModalVisible(false);
      setSaveName('');
      
      Alert.alert(
        t('savedSuccessfully'),
        `${t('calculationSavedAs')} "${finalName}".`
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save';
      onSaveError?.(errorMessage);
      Alert.alert('Save Failed', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickSave = () => {
    const autoName = generateDefaultName();
    
    if (!showInput) {
      // Direct save with auto name (no user input needed)
      saveData(autoName);
    } else {
      // Show modal for user to edit the auto name
      setIsModalVisible(true);
      setSaveName(autoName);
    }
  };

  const handleSaveWithName = () => {
    saveData(saveName);
  };

  const renderSaveModal = () => {
    if (!isModalVisible) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={[styles.modal, { backgroundColor: theme.colors.card }]}>
          <Typography variant="h4" color="text" style={styles.modalTitle}>
            Save {dataType.charAt(0).toUpperCase() + dataType.slice(1)}
          </Typography>
          
          <Typography variant="body2" color="textSecondary" style={styles.modalDescription}>
            Give your {dataType} a name so you can find it later.
          </Typography>

          <TextInput
            style={[styles.nameInput, { 
              backgroundColor: theme.colors.background, 
              color: theme.colors.text,
              borderColor: theme.colors.border,
            }]}
            value={saveName}
            onChangeText={setSaveName}
            placeholder={`Enter ${dataType} name...`}
            placeholderTextColor={theme.colors.tabBarInactive}
            autoFocus
            maxLength={50}
          />

          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => {
                setIsModalVisible(false);
                setSaveName('');
              }}
              style={styles.modalButton}
            />
            <Button
              title="Save"
              variant="primary"
              onPress={handleSaveWithName}
              loading={isSaving}
              disabled={!saveName.trim() || isSaving}
              style={styles.modalButton}
            />
          </View>
        </View>
      </View>
    );
  };

  if (variant === 'icon') {
    return (
      <>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleQuickSave}
          disabled={isSaving}
        >
          <Icon 
            name="save" 
            size={28} 
            color={isSaving ? theme.colors.tabBarInactive : theme.colors.primary} 
          />
        </TouchableOpacity>
        {renderSaveModal()}
      </>
    );
  }

  return (
    <>
      <Button
        title="Save"
        icon="save"
        variant="outline"
        onPress={handleQuickSave}
        loading={isSaving}
      />
      {renderSaveModal()}
    </>
  );
};

// Hook for managing saved items
export const useSavedItems = (dataType: string) => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSavedItems = async () => {
    try {
      setIsLoading(true);
      const storageKey = `saved_${dataType}s`;
      const data = await AsyncStorage.getItem(storageKey);
      const items: SavedItem[] = data ? JSON.parse(data) : [];
      setSavedItems(items);
    } catch (error) {
      console.error('Failed to load saved items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSavedItem = async (id: string) => {
    try {
      const storageKey = `saved_${dataType}s`;
      const updatedItems = savedItems.filter(item => item.id !== id);
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedItems));
      setSavedItems(updatedItems);
    } catch (error) {
      console.error('Failed to delete item:', error);
      throw error;
    }
  };

  const getSavedItem = (id: string) => {
    return savedItems.find(item => item.id === id);
  };

  return {
    savedItems,
    isLoading,
    loadSavedItems,
    deleteSavedItem,
    getSavedItem,
  };
};

const styles = StyleSheet.create({
  iconButton: {
    padding: 4,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    minWidth: 280,
    maxWidth: 340,
  },
  modalTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDescription: {
    marginBottom: 20,
    textAlign: 'center',
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
