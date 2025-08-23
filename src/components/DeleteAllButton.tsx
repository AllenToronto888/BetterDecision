import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { useI18n } from '../i18n';

interface DeleteAllButtonProps {
  items: any[];
  storageConfig: {
    type: 'filter' | 'clear';
    storageKey: string;
    calculationType?: string; // For filter type
  };
  onDeleteSuccess: () => Promise<void>;
  alertConfig: {
    noItemsMessage: string;
    confirmTitle: string;
    itemTypePlural: string;
    successMessage: string;
    errorMessage: string;
  };
}

export const useDeleteAll = ({
  items,
  storageConfig,
  onDeleteSuccess,
  alertConfig,
}: DeleteAllButtonProps) => {
  const { t } = useI18n();

  const handleClearAll = () => {
    if (items.length === 0) {
      Alert.alert(t('noItems'), alertConfig.noItemsMessage);
      return;
    }

    Alert.alert(
      alertConfig.confirmTitle,
      `${t('areYouSureDeleteAll')} ${items.length} ${alertConfig.itemTypePlural}? ${t('thisCannotBeUndone')}`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('clearAll'),
          style: 'destructive',
          onPress: async () => {
            try {
              console.log(`🔍 DEBUG: Starting delete all ${storageConfig.calculationType || 'items'} process`);
              console.log('🔍 DEBUG: Items to delete:', items.length);

              if (storageConfig.type === 'filter') {
                // For calculator screens that share storage
                const allSavedItemsJson = await AsyncStorage.getItem(storageConfig.storageKey);
                const allSavedItems = allSavedItemsJson ? JSON.parse(allSavedItemsJson) : [];
                
                const remainingItems = allSavedItems.filter((item: any) => 
                  item.data.calculationType !== storageConfig.calculationType
                );
                
                console.log('🔍 DEBUG: Remaining items after filter:', remainingItems.length);
                await AsyncStorage.setItem(storageConfig.storageKey, JSON.stringify(remainingItems));
              } else {
                // For screens with dedicated storage
                console.log('🔍 DEBUG: Clearing storage directly');
                await AsyncStorage.setItem(storageConfig.storageKey, JSON.stringify([]));
              }

              console.log('🔍 DEBUG: Storage updated');
              
              // Refresh the data after deletion
              console.log('🔍 DEBUG: Refreshing data...');
              await onDeleteSuccess();
              
              console.log('🔍 DEBUG: Delete all completed successfully');
              Alert.alert(t('success'), alertConfig.successMessage);
            } catch (error) {
              console.error('🔍 DEBUG: Delete all failed:', error);
              Alert.alert(t('error'), alertConfig.errorMessage);
            }
          },
        },
      ]
    );
  };

  return { handleClearAll };
};

export default useDeleteAll;
