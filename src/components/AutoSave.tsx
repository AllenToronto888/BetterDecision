import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef } from 'react';

interface AutoSaveOptions {
  data: any;
  dataType: 'calculation' | 'comparison' | 'decision' | 'quick_comparison' | 'detail_comparison';
  enabled?: boolean;
  delay?: number; // milliseconds to wait before saving
  onSave?: (savedName: string) => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: 'idle' | 'pending' | 'saving' | 'saved' | 'error') => void;
  autoSavePrefix?: string; // Translation for "Auto-saved"
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
  autoSavePrefix = 'Auto-saved',
}: AutoSaveOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');
  const isSavingRef = useRef<boolean>(false);
  const sessionAutoSaveIdRef = useRef<string | null>(null);

  const generateAutoSaveName = (dataToSave: any): string => {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Extract title from data if available
    let userTitle = '';
    if (dataToSave?.title && typeof dataToSave.title === 'string' && dataToSave.title.trim()) {
      userTitle = ` - ${dataToSave.title.trim()}`;
    }
    
    return `${autoSavePrefix}${userTitle} - ${date} ${time}`;
  };

  const shouldSaveData = (currentData: any): boolean => {
    if (!currentData) return false;

    // Check if data has meaningful content
    switch (dataType) {
      case 'calculation':
        // Handle Unit Calculator (has products array)
        if (currentData.products && Array.isArray(currentData.products)) {
          return currentData.products.some((p: any) => 
            (p.price && p.price.trim()) || 
            (p.quantity && p.quantity.trim()) || 
            (p.name && p.name.trim())
          );
        }
        
        // Handle Total Cost Calculator (has basePrice, productName, etc.)
        if (currentData.calculationType === 'total_cost') {
          return Boolean(
            (currentData.basePrice && currentData.basePrice.trim()) ||
            (currentData.productName && currentData.productName.trim()) ||
            (currentData.additionalCosts && currentData.additionalCosts.some((cost: any) => cost.value && cost.value.trim())) ||
            (currentData.compareEnabled && (
              (currentData.comparisonPrice && currentData.comparisonPrice.trim()) ||
              (currentData.comparisonName && currentData.comparisonName.trim()) ||
              (currentData.comparisonAdditionalCosts && currentData.comparisonAdditionalCosts.some((cost: any) => cost.value && cost.value.trim()))
            ))
          );
        }
        
        return false;

      case 'comparison':
      case 'quick_comparison':
      case 'detail_comparison':
        // Let the screen's 'enabled' parameter handle validation logic
        // since each comparison screen has different data structures and requirements
        return true;

      case 'decision':
        // For pros & cons decisions, check if there's meaningful content
        return Boolean(
          (currentData.pros && currentData.pros.some((p: any) => p.text && p.text.trim())) ||
          (currentData.cons && currentData.cons.some((c: any) => c.text && c.text.trim())) ||
          (currentData.notes && currentData.notes.trim())
        );

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

      const now = new Date().toISOString();
      let savedItem: SavedItem;
      let updatedItems: SavedItem[];

      // Check if we have a session auto-save ID (means we're updating existing)
      if (sessionAutoSaveIdRef.current) {
        // Find and update existing session auto-save
        const existingIndex = existingItems.findIndex(item => 
          item.id === sessionAutoSaveIdRef.current
        );

        if (existingIndex >= 0) {
          // Update existing session auto-save
          savedItem = {
            ...existingItems[existingIndex],
            data: dataToSave,
            updatedAt: now,
          };
          updatedItems = [...existingItems];
          updatedItems[existingIndex] = savedItem;
        } else {
          // Session ID exists but item not found, create new one
          sessionAutoSaveIdRef.current = Date.now().toString();
          savedItem = {
            id: sessionAutoSaveIdRef.current,
            name: generateAutoSaveName(dataToSave),
            data: dataToSave,
            type: dataType,
            createdAt: now,
            updatedAt: now,
            isAutoSaved: true,
          };
          updatedItems = [savedItem, ...existingItems];
        }
      } else {
        // No session ID, create new auto-save for this session
        sessionAutoSaveIdRef.current = Date.now().toString();
        savedItem = {
          id: sessionAutoSaveIdRef.current,
          name: generateAutoSaveName(dataToSave),
          data: dataToSave,
          type: dataType,
          createdAt: now,
          updatedAt: now,
          isAutoSaved: true,
        };
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
    if (currentDataString === lastSavedDataRef.current) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Show pending status
    onStatusChange?.('pending');

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      // Update the ref here, right before saving
      lastSavedDataRef.current = JSON.stringify(data);
      autoSave(data);
    }, delay);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, delay]);

  // Cleanup on unmount - reset session when user leaves screen
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Reset session auto-save ID when component unmounts (user leaves screen)
      sessionAutoSaveIdRef.current = null;
    };
  }, []);
};

// Manual save function that can be used alongside auto-save
export const saveManually = async (
  data: any,
  dataType: 'calculation' | 'comparison' | 'decision' | 'quick_comparison' | 'detail_comparison',
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