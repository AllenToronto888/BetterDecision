import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef } from 'react';

interface AutoSaveOptions {
  data: any;
  dataType: 'calculation' | 'comparison' | 'decision';
  enabled?: boolean;
  delay?: number; // milliseconds to wait before saving
  onSave?: (savedName: string) => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: 'idle' | 'pending' | 'saving' | 'saved' | 'error') => void;
}

interface SavedItem {
  id: string;
  name: string;
  data: any;
  type: string;
  createdAt: string;
  updatedAt: string;
  isAutoSaved: boolean;
}

// Hook for auto-saving data
export const useAutoSave = ({
  data,
  dataType,
  enabled = true,
  delay = 2000,
  onSave,
  onError,
  onStatusChange,
}: AutoSaveOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');
  const isSavingRef = useRef<boolean>(false);

  const generateAutoSaveName = (): string => {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `Auto-saved - ${date} ${time}`;
  };

  const shouldSaveData = (currentData: any): boolean => {
    if (!currentData) return false;

    // Check if data has meaningful content
    switch (dataType) {
      case 'calculation':
        if (currentData.products && Array.isArray(currentData.products)) {
          return currentData.products.some((p: any) => 
            p.price && p.price.trim() && p.quantity && p.quantity.trim()
          );
        }
        return false;

      case 'comparison':
        if (currentData.pros && currentData.cons) {
          return currentData.pros.length > 0 || currentData.cons.length > 0;
        }
        if (currentData.criteria && currentData.options) {
          return currentData.criteria.length > 0 && currentData.options.length > 0;
        }
        return false;

      case 'decision':
        return !!currentData.result;

      default:
        return true;
    }
  };

  const autoSave = async (dataToSave: any) => {
    try {
      if (!shouldSaveData(dataToSave) || isSavingRef.current) return;

      isSavingRef.current = true;
      onStatusChange?.('saving');

      const storageKey = `saved_${dataType}s`;
      const existingData = await AsyncStorage.getItem(storageKey);
      const existingItems: SavedItem[] = existingData ? JSON.parse(existingData) : [];

      // Find existing auto-saved item for this dataType to update it
      const autoSavedIndex = existingItems.findIndex(item => 
        item.isAutoSaved && item.type === dataType
      );

      const autoSaveName = generateAutoSaveName();
      const now = new Date().toISOString();

      const savedItem: SavedItem = {
        id: autoSavedIndex >= 0 ? existingItems[autoSavedIndex].id : Date.now().toString(),
        name: autoSavedIndex >= 0 ? existingItems[autoSavedIndex].name : autoSaveName,
        data: dataToSave,
        type: dataType,
        createdAt: autoSavedIndex >= 0 ? existingItems[autoSavedIndex].createdAt : now,
        updatedAt: now,
        isAutoSaved: true,
      };

      let updatedItems: SavedItem[];
      if (autoSavedIndex >= 0) {
        // Update existing auto-saved item
        updatedItems = [...existingItems];
        updatedItems[autoSavedIndex] = savedItem;
      } else {
        // Add new auto-saved item at the beginning
        updatedItems = [savedItem, ...existingItems];
      }

      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedItems));
      
      isSavingRef.current = false;
      onStatusChange?.('saved');
      onSave?.(savedItem.name);
      
      // Reset to idle after 2 seconds
      setTimeout(() => onStatusChange?.('idle'), 2000);
    } catch (error) {
      isSavingRef.current = false;
      onStatusChange?.('error');
      const errorMessage = error instanceof Error ? error.message : 'Auto-save failed';
      onError?.(errorMessage);
      console.error('Auto-save error:', error);
      
      // Reset to idle after 3 seconds
      setTimeout(() => onStatusChange?.('idle'), 3000);
    }
  };

  useEffect(() => {
    if (!enabled || !data) {
      onStatusChange?.('idle');
      return;
    }

    const currentDataString = JSON.stringify(data);
    
    // Only save if data has changed
    if (currentDataString === lastSavedDataRef.current) return;
    
    lastSavedDataRef.current = currentDataString;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Show pending status
    onStatusChange?.('pending');

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      autoSave(data);
    }, delay);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
};

// Manual save function that can be used alongside auto-save
export const saveManually = async (
  data: any,
  dataType: 'calculation' | 'comparison' | 'decision',
  customName?: string
): Promise<void> => {
  try {
    const storageKey = `saved_${dataType}s`;
    const existingData = await AsyncStorage.getItem(storageKey);
    const existingItems: SavedItem[] = existingData ? JSON.parse(existingData) : [];

    const now = new Date();
    const defaultName = customName || `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} - ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    // Check for duplicate names (excluding auto-saved items)
    const nameExists = existingItems.some(item => 
      item.name.toLowerCase() === defaultName.toLowerCase() && !item.isAutoSaved
    );

    const finalName = nameExists ? `${defaultName} (Copy)` : defaultName;

    const newItem: SavedItem = {
      id: Date.now().toString(),
      name: finalName,
      data,
      type: dataType,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      isAutoSaved: false,
    };

    const updatedItems = [newItem, ...existingItems];
    await AsyncStorage.setItem(storageKey, JSON.stringify(updatedItems));
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to save');
  }
};
