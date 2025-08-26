import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { CustomHeader, Typography, useDeleteAll, useSavedItems, useTheme } from '../../components';
import { useI18n } from '../../i18n';

interface SavedItem {
  id: string;
  name: string;
  data: any;
  type: string;
  createdAt: string;
  updatedAt: string;
  isAutoSaved?: boolean;
}

const UnitCalculatorSavedItemsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const {
    savedItems,
    isLoading,
    loadSavedItems,
    deleteSavedItem,
  } = useSavedItems('calculation');

  // Filter only unit calculator items
  const unitCalculatorItems = savedItems.filter(item => 
    item.data.calculationType === 'unit_price'
  );
  


  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSavedItems();
    }, [])
  );

  const handleDeleteItem = (item: SavedItem) => {
    Alert.alert(
      t('deleteItem'),
      `${t('areYouSureDeleteItem')} "${item.name}"?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSavedItem(item.id);
              // Refresh the data after deletion
              await loadSavedItems();
              Alert.alert(t('deleted'), t('itemRemovedSuccessfully'));
            } catch (error) {
              Alert.alert(t('error'), t('failedToDeleteItem'));
            }
          },
        },
      ]
    );
  };

  const { handleClearAll } = useDeleteAll({
    items: unitCalculatorItems,
    storageConfig: {
      type: 'filter',
      storageKey: 'saved_calculations',
      calculationType: 'unit_price'
    },
    onDeleteSuccess: loadSavedItems,
    alertConfig: {
      noItemsMessage: t('noSavedCalculationsToClear'),
      confirmTitle: t('clearAllUnitCalculations'),
      itemTypePlural: t('savedUnitCalculations'),
      successMessage: t('allUnitCalculationsCleared'),
      errorMessage: t('failedToClearAll')
    }
  });

  // Unit translation mapping
  const getUnitLabel = (unit: string) => {
    const unitMap: Record<string, string> = {
      'g': t('gram'),
      'kg': t('kilogram'),
      'oz': t('ounce'),
      'lb': t('pound'),
      'ml': t('milliliter'),
      'l': t('liter'),
      'each': t('each')
    };
    return unitMap[unit] || unit;
  };

  const toggleItemExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const formatDetailedData = (item: SavedItem): string => {
    if (item.data.calculationType === 'unit_price' && item.data.products) {
      let details = '';
      
      item.data.products.forEach((product: any, index: number) => {
        const isBest = item.data.bestProductIndexes?.includes(index);
        details += `${isBest ? '⭐ ' : ''}${product.name || `${t('item')} ${index + 1}`}\n`;
        details += `   ${t('price')}: $${product.price} for ${product.quantity}${getUnitLabel(product.unit)}\n`;
        details += `   ${t('unitPrice')}: $${product.unitPrice?.toFixed(4)}/`;
        
        // Show appropriate unit for display
        if (product.unit === 'kg' || product.unit === 'l') {
          details += getUnitLabel(product.unit === 'kg' ? 'g' : 'ml');
        } else {
          details += getUnitLabel(product.unit);
        }
        details += '\n\n';
      });
      
      return details.trim();
    }
    
    return t('unitPriceComparison');
  };

  const renderSavedItem = ({ item }: { item: SavedItem }) => {
    const isExpanded = expandedItems.has(item.id);
    const createdDate = new Date(item.createdAt).toLocaleDateString();
    const createdTime = new Date(item.createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={[styles.itemCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        {/* Header */}
        <TouchableOpacity
          style={styles.itemHeader}
          onPress={() => toggleItemExpansion(item.id)}
        >
          <View style={styles.itemHeaderLeft}>
            <Typography variant="h6" color="text" style={styles.itemName}>
              {item.name}
            </Typography>
          </View>
          <MaterialIcons
            name={isExpanded ? "expand-less" : "expand-more"}
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.itemContent}>
            <Typography variant="body2" color="text" style={styles.itemDetails}>
              {formatDetailedData(item)}
            </Typography>
            
            {/* Action Icons - Bottom Right */}
            <View style={styles.itemActions}>
              <TouchableOpacity
                style={styles.actionIcon}
                onPress={() => {
                  // Handle share
                  console.log('Shared:', item.name);
                }}
              >
                <MaterialIcons name="share" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionIcon}
                onPress={() => handleDeleteItem(item)}
              >
                <MaterialIcons name="delete" size={20} color={theme.colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons
        name="shopping-cart"
        size={64}
        color={theme.colors.tabBarInactive}
      />
      <Typography variant="h6" color="textSecondary" style={styles.emptyTitle}>
{t('noUnitCalculationsSaved')}
      </Typography>
      <Typography variant="body2" color="textSecondary" style={styles.emptyDescription}>
        {t('savedCalculationsWillAppearHere')}
      </Typography>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <CustomHeader
        title={t('savedUnitPrice')}
        leftAction={{
          icon: "chevron-left",
          onPress: () => navigation.goBack()
        }}
        rightAction={{
          icon: "delete-sweep",
          onPress: handleClearAll
        }}
      />

      {/* Content */}
      <FlatList
        data={unitCalculatorItems}
        keyExtractor={(item) => item.id}
        renderItem={renderSavedItem}
        contentContainerStyle={[
          styles.listContainer,
          unitCalculatorItems.length === 0 && styles.listContainerEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadSavedItems}
            tintColor={theme.colors.primary}
          />
        }
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 300,
  },
  listContainerEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  itemCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  itemHeaderLeft: {
    flex: 1,
  },
  itemName: {
    marginBottom: 4,
  },
  itemContent: {
    padding: 16,
    paddingTop: 0,
  },
  itemDetails: {
    marginBottom: 16,
    lineHeight: 20,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 8,
  },
  actionIcon: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default UnitCalculatorSavedItemsScreen;
