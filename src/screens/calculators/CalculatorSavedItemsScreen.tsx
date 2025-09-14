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
import { Button, CustomHeader, Icon, Share, Typography, useSavedItems, useTheme } from '../../components';

interface SavedItem {
  id: string;
  name: string;
  data: any;
  type: string;
  createdAt: string;
  updatedAt: string;
}

const CalculatorSavedItemsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const {
    savedItems,
    isLoading,
    loadSavedItems,
    deleteSavedItem,
  } = useSavedItems('calculation');

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSavedItems();
    }, [])
  );

  const handleDeleteItem = (item: SavedItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSavedItem(item.id);
              Alert.alert('Deleted', 'Item removed successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    if (savedItems.length === 0) {
      Alert.alert('No Items', 'There are no saved calculations to clear.');
      return;
    }

    Alert.alert(
      'Clear All Calculations',
      `Are you sure you want to delete all ${savedItems.length} saved calculations? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete all items one by one
              for (const item of savedItems) {
                await deleteSavedItem(item.id);
              }
              Alert.alert('Success', 'All calculations cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear all calculations');
            }
          },
        },
      ]
    );
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

  const formatPreviewData = (item: SavedItem): string => {
    // Handle total cost calculations
    if (item.data.calculationType === 'total_cost') {
      const productName = item.data.productName || 'Product';
      const totalCost = item.data.totalCost || 0;
      const additionalCosts = item.data.additionalCosts || [];
      const costCount = additionalCosts.filter((cost: any) => cost.value && parseFloat(cost.value) > 0).length;
      
      if (item.data.compareEnabled && item.data.comparisonTotalCost !== undefined) {
        const comparisonTotal = item.data.comparisonTotalCost || 0;
        const difference = Math.abs(totalCost - comparisonTotal);
        if (totalCost === comparisonTotal) {
          return `${productName} vs comparison - Equal at $${totalCost.toFixed(2)}`;
        } else if (totalCost > comparisonTotal) {
          return `${productName} - $${difference.toFixed(2)} more than comparison`;
        } else {
          return `${productName} - $${difference.toFixed(2)} less than comparison`;
        }
      }
      
      return `${productName} - $${totalCost.toFixed(2)} (${costCount} extra costs)`;
    }
    
    // Handle unit price calculations
    if (item.data.products?.length) {
      const productCount = item.data.products.length;
      // Handle both old bestProductIndex and new bestProductIndexes
      const bestIndexes = item.data.bestProductIndexes || (item.data.bestProductIndex !== null ? [item.data.bestProductIndex] : []);
      
      if (bestIndexes.length === 0) {
        return `${productCount} products compared`;
      } else if (bestIndexes.length === 1) {
        const bestIndex = bestIndexes[0];
        const bestProduct = item.data.products[bestIndex];
        return `${productCount} products compared. 🏆 Best: ${bestProduct?.name || 'Product ' + (bestIndex + 1)}`;
      } else {
        // Multiple products tied for best
        const bestNames = bestIndexes.map((index: number) => 
          item.data.products[index]?.name || `Product ${index + 1}`
        );
        return `${productCount} products compared. 🤝 Tied: ${bestNames.join(', ')}`;
      }
    }
    return 'Calculation data';
  };

  const formatDetailedData = (item: SavedItem): string => {
    // Handle total cost calculations
    if (item.data.calculationType === 'total_cost') {
      let details = '';
      
      // Product information
      const productName = item.data.productName || 'Unnamed Product';
      const basePrice = parseFloat(item.data.basePrice || '0');
      details += `Product: ${productName}\n`;
      details += `Base Price: $${basePrice.toFixed(2)}\n`;
      
      // Additional costs
      const additionalCosts = item.data.additionalCosts || [];
      if (additionalCosts.length > 0) {
        details += '\nExtra Costs:\n';
        additionalCosts.forEach((cost: any) => {
          const value = parseFloat(cost.value || '0');
          if (value > 0) {
            const symbol = cost.isPercentage ? '%' : '$';
            const prefix = cost.isPercentage ? '' : '$';
            details += `• ${cost.label}: ${prefix}${value.toFixed(2)}${cost.isPercentage ? '%' : ''}\n`;
          }
        });
      }
      
      // Total cost
      const totalCost = item.data.totalCost || 0;
      details += `\nTotal Cost: $${totalCost.toFixed(2)}`;
      
      // Handle comparison data if available
      if (item.data.compareEnabled && item.data.comparisonTotalCost !== undefined) {
        details += '\n\n--- Comparison ---\n';
        
        const comparisonName = item.data.comparisonName || 'Item 2';
        const comparisonBasePrice = parseFloat(item.data.comparisonPrice || '0');
        details += `Product: ${comparisonName}\n`;
        details += `Base Price: $${comparisonBasePrice.toFixed(2)}\n`;
        
        // Comparison additional costs
        const comparisonCosts = item.data.comparisonAdditionalCosts || [];
        if (comparisonCosts.length > 0) {
          details += '\nExtra Costs:\n';
          comparisonCosts.forEach((cost: any) => {
            const value = parseFloat(cost.value || '0');
            if (value > 0) {
              const prefix = cost.isPercentage ? '' : '$';
              details += `• ${cost.label}: ${prefix}${value.toFixed(2)}${cost.isPercentage ? '%' : ''}\n`;
            }
          });
        }
        
        // Comparison total
        const comparisonTotal = item.data.comparisonTotalCost || 0;
        details += `\nTotal Cost: $${comparisonTotal.toFixed(2)}`;
        
        // Difference
        const difference = Math.abs(totalCost - comparisonTotal);
        const item1Name = item.data.productName || 'Item 1';
        details += '\n\n--- Result ---\n';
        if (totalCost === comparisonTotal) {
          details += 'Both items cost the same';
        } else if (totalCost > comparisonTotal) {
          details += `${item1Name} is more by $${difference.toFixed(2)}`;
        } else {
          details += `${item1Name} is less by $${difference.toFixed(2)}`;
        }
      }
      
      return details;
    }
    
    // Handle unit price calculations
    if (item.data.products?.length) {
      let details = 'Products:\n';
      
      // Recalculate best products based on actual unit prices to handle saved data correctly
      const productsWithValidPrices = item.data.products.filter((p: any) => p.unitPrice && p.unitPrice > 0);
      let actualBestIndexes: number[] = [];
      
      if (productsWithValidPrices.length > 0) {
        const lowestPrice = Math.min(...productsWithValidPrices.map((p: any) => p.unitPrice));
        actualBestIndexes = item.data.products
          .map((product: any, index: number) => ({ product, index }))
          .filter(({ product }: any) => product.unitPrice === lowestPrice)
          .map(({ index }: any) => index);
      }
      
      item.data.products.forEach((product: any, index: number) => {
        const isBest = actualBestIndexes.includes(index);
        let prefix = '• ';
        if (isBest && actualBestIndexes.length === 1) {
          prefix = '🏆 ';
        } else if (isBest && actualBestIndexes.length > 1) {
          prefix = '🤝 ';
        }
        details += `${prefix}${product.name || `Product ${index + 1}`}\n`;
        details += `   $${product.price} for ${product.quantity}${product.unit}\n`;
        if (product.unitPrice) {
          details += `   Unit Price: $${product.unitPrice.toFixed(2)}\n`;
        }
        // Only add spacing between products, not after the last one
        if (index < item.data.products.length - 1) {
          details += '\n';
        }
      });
      return details;
    }
    
    return JSON.stringify(item.data, null, 2);
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
          
          <Icon
            name={isExpanded ? 'expand-less' : 'expand-more'}
            size={24}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.itemContent}>
            <View style={[styles.itemDetails, { backgroundColor: theme.colors.background }]}>
              <Typography variant="body2" color="text" style={styles.itemDetailsText}>
                {formatDetailedData(item)}
              </Typography>
            </View>

            {/* Action Buttons */}
            <View style={styles.itemActions}>
              <Share
                data={item.data}
                dataType="calculation"
                title={item.name}
                variant="icon"
                onShareSuccess={() => console.log('Shared:', item.name)}
              />
              
              <Button
                title="Delete"
                variant="danger"
                icon="delete"
                size="small"
                onPress={() => handleDeleteItem(item)}
                style={styles.deleteButton}
              />
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon
        name="calculate"
        size={64}
        color={theme.colors.tabBarInactive}
      />
      <Typography variant="h4" color="textSecondary" style={styles.emptyTitle}>
        No Saved Calculations
      </Typography>
      <Typography variant="body2" color="textSecondary" style={styles.emptyDescription}>
        When you save calculations, they'll appear here for easy access.
      </Typography>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header - Same style as UnitCalculatorScreen */}
      <CustomHeader
        title="Saved Calculations"
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
        data={savedItems}
        keyExtractor={(item) => item.id}
        renderItem={renderSavedItem}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadSavedItems}
            tintColor={theme.colors.primary}
          />
        }
        contentContainerStyle={[
          styles.listContainer,
          savedItems.length === 0 && styles.listContainerEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
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
    padding: 24,
    paddingHorizontal: 24,
  },
  listContainerEmpty: {
    flex: 1,
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
  itemPreview: {
    marginTop: 4,
  },
  itemContent: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  itemDetails: {
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 0,
    borderRadius: 8,
  },
  itemDetailsText: {

    lineHeight: 20,
  },
  itemActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    justifyContent: 'flex-end',
  },
  deleteButton: {
    minWidth: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: 'center',
    maxWidth: 250,
  },
});

export default CalculatorSavedItemsScreen;
