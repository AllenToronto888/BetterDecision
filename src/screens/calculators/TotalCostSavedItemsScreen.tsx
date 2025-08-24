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
}

const TotalCostSavedItemsScreen: React.FC = () => {
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

  // Filter only total cost calculator items
  const totalCostItems = savedItems.filter(item => 
    item.data.calculationType === 'total_cost'
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
    items: totalCostItems,
    storageConfig: {
      type: 'filter',
      storageKey: 'saved_calculations',
      calculationType: 'total_cost'
    },
    onDeleteSuccess: loadSavedItems,
    alertConfig: {
      noItemsMessage: t('noSavedCalculationsToClear'),
      confirmTitle: t('clearAllTotalCostCalculations'),
      itemTypePlural: t('savedTotalCostCalculations'),
      successMessage: t('allTotalCostCalculationsCleared'),
      errorMessage: t('failedToClearAllTotalCost')
    }
  });

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
    if (item.data.calculationType === 'total_cost') {
      let details = '';
      
      // Main Product information
      const productName = item.data.productName || `${t('item')} 1`;
      const basePrice = parseFloat(item.data.basePrice || '0');
      details += `${t('product')}: ${productName}\n`;
      details += `${t('basePrice')}: $${basePrice.toFixed(2)}\n`;
      
      // Main Product additional costs
      const additionalCosts = item.data.additionalCosts || [];
      if (additionalCosts.length > 0) {
        details += `\n${t('extraCosts')}:\n`;
        additionalCosts.forEach((cost: any) => {
          const value = parseFloat(cost.value || '0');
          if (value > 0) {
            const prefix = cost.isPercentage ? '' : '$';
            details += `• ${cost.label}: ${prefix}${value.toFixed(2)}${cost.isPercentage ? '%' : ''}\n`;
          }
        });
      }
      
      // Main Product total cost
      const totalCost = item.data.totalCost || 0;
      details += `\n${t('totalCost')}: $${totalCost.toFixed(2)}`;
      
      // Check if comparison mode was enabled
      const compareEnabled = item.data.compareEnabled;
      if (compareEnabled) {
        details += `\n\n--- ${t('itemComparison').toUpperCase()} ---\n`;
        
        // Comparison Product information
        const comparisonName = item.data.comparisonName || `${t('item')} 2`;
        const comparisonPrice = parseFloat(item.data.comparisonPrice || '0');
        details += `${t('product')}: ${comparisonName}\n`;
        details += `${t('basePrice')}: $${comparisonPrice.toFixed(2)}\n`;
        
        // Comparison Product additional costs
        const comparisonAdditionalCosts = item.data.comparisonAdditionalCosts || [];
        if (comparisonAdditionalCosts.length > 0) {
          details += `\n${t('extraCosts')}:\n`;
          comparisonAdditionalCosts.forEach((cost: any) => {
            const value = parseFloat(cost.value || '0');
            if (value > 0) {
              const prefix = cost.isPercentage ? '' : '$';
              details += `• ${cost.label}: ${prefix}${value.toFixed(2)}${cost.isPercentage ? '%' : ''}\n`;
            }
          });
        }
        
        // Comparison Product total cost
        const comparisonTotalCost = item.data.comparisonTotalCost || 0;
        details += `\n${t('totalCost')}: $${comparisonTotalCost.toFixed(2)}`;
        
        // Show comparison result exactly as on live screen
        if (totalCost > 0 && comparisonTotalCost > 0) {
          const difference = Math.abs(totalCost - comparisonTotalCost);
          if (totalCost > comparisonTotalCost) {
            details += `\n\n${productName} ${t('isMoreBy')} $${difference.toFixed(2)}`;
          } else if (totalCost < comparisonTotalCost) {
            details += `\n\n${productName} ${t('isLessBy')} $${difference.toFixed(2)}`;
          } else {
            details += `\n\n${t('bothItemsCostSame')}`;
          }
        }
      }
      
      return details;
    }
    
    return 'Total cost calculation data';
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
        name="attach-money"
        size={64}
        color={theme.colors.tabBarInactive}
      />
      <Typography variant="h6" color="textSecondary" style={styles.emptyTitle}>
{t('noTotalCostCalculationsSaved')}
      </Typography>
      <Typography variant="body2" color="textSecondary" style={styles.emptyDescription}>
{t('totalCostCalculationsWillAppearHere')}
      </Typography>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <CustomHeader
        title={t('savedTotalCost')}
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
        data={totalCostItems}
        keyExtractor={(item) => item.id}
        renderItem={renderSavedItem}
        contentContainerStyle={[
          styles.listContainer,
          totalCostItems.length === 0 && styles.listContainerEmpty,
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
    paddingBottom: 100,
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

export default TotalCostSavedItemsScreen;
