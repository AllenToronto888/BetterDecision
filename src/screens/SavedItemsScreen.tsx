import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button, Share, Typography, useSavedItems, useTheme } from '../components';

interface SavedItem {
  id: string;
  name: string;
  data: any;
  type: string;
  createdAt: string;
  updatedAt: string;
}

interface SavedItemsScreenProps {
  route?: {
    params?: {
      dataType?: 'calculation' | 'comparison' | 'decision';
    };
  };
}

const SavedItemsScreen: React.FC<SavedItemsScreenProps> = ({ route }) => {
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState(route?.params?.dataType || 'calculation');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const {
    savedItems,
    isLoading,
    loadSavedItems,
    deleteSavedItem,
  } = useSavedItems(selectedTab);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSavedItems();
    }, [selectedTab])
  );

  // Reload when tab changes
  React.useEffect(() => {
    loadSavedItems();
  }, [selectedTab]);

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
    switch (item.type) {
      case 'calculation':
        if (item.data.products?.length) {
          const productCount = item.data.products.length;
          const bestProduct = item.data.products[item.data.bestProductIndex];
          return `${productCount} products compared${bestProduct ? `. Best: ${bestProduct.name || 'Product ' + (item.data.bestProductIndex + 1)}` : ''}`;
        }
        return 'Calculation data';
      
      case 'comparison':
        if (item.data.pros && item.data.cons) {
          return `${item.data.pros.length} pros, ${item.data.cons.length} cons`;
        } else if (item.data.options && item.data.criteria) {
          return `${item.data.options.length} options, ${item.data.criteria.length} criteria`;
        }
        return 'Comparison data';
      
      case 'decision':
        if (item.data.result) {
          return `Result: ${item.data.result}`;
        }
        return 'Decision data';
      
      default:
        return 'Saved data';
    }
  };

  const formatDetailedData = (item: SavedItem): string => {
    switch (item.type) {
      case 'calculation':
        if (item.data.products?.length) {
          let details = 'Products:\n';
          item.data.products.forEach((product: any, index: number) => {
            const isBest = index === item.data.bestProductIndex;
            details += `${isBest ? '⭐ ' : '• '}${product.name || `Product ${index + 1}`}\n`;
            details += `   $${product.price} for ${product.quantity}${product.unit}\n`;
            if (product.unitPrice) {
              details += `   Unit Price: $${product.unitPrice.toFixed(4)}\n`;
            }
            details += '\n';
          });
          return details;
        }
        break;
      
      case 'comparison':
        if (item.data.pros && item.data.cons) {
          let details = `📈 PROS (${item.data.pros.length}):\n`;
          item.data.pros.forEach((pro: any) => {
            details += `• ${pro.text} (Weight: ${pro.weight})\n`;
          });
          details += `\n📉 CONS (${item.data.cons.length}):\n`;
          item.data.cons.forEach((con: any) => {
            details += `• ${con.text} (Weight: ${con.weight})\n`;
          });
          return details;
        }
        break;
      
      case 'decision':
        if (item.data.result) {
          return `🎲 Decision: ${item.data.result}\n\nMade on ${new Date(item.createdAt).toLocaleDateString()}`;
        }
        break;
    }
    
    return JSON.stringify(item.data, null, 2);
  };

  const renderTabButton = (type: string, label: string, icon: string) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        {
          backgroundColor: selectedTab === type ? theme.colors.primary : 'transparent',
          borderColor: theme.colors.primary,
        },
      ]}
      onPress={() => setSelectedTab(type as any)}
    >
      <MaterialIcons
        name={icon as any}
        size={20}
        color={selectedTab === type ? '#FFFFFF' : theme.colors.primary}
      />
      <Text
        style={[
          styles.tabButtonText,
          {
            color: selectedTab === type ? '#FFFFFF' : theme.colors.primary,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

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
            <Typography variant="caption" color="textSecondary">
              {createdDate} at {createdTime}
            </Typography>
            <Typography variant="body2" color="textSecondary" style={styles.itemPreview}>
              {formatPreviewData(item)}
            </Typography>
          </View>
          
          <MaterialIcons
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
                dataType={item.type as any}
                title={item.name}
                variant="button"
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
      <MaterialIcons
        name={selectedTab === 'calculation' ? 'calculate' : selectedTab === 'comparison' ? 'compare' : 'casino'}
        size={64}
        color={theme.colors.tabBarInactive}
      />
      <Typography variant="h4" color="textSecondary" style={styles.emptyTitle}>
        No Saved {selectedTab === 'calculation' ? 'Calculations' : selectedTab === 'comparison' ? 'Comparisons' : 'Decisions'}
      </Typography>
      <Typography variant="body2" color="textSecondary" style={styles.emptyDescription}>
        When you save {selectedTab}s, they'll appear here for easy access.
      </Typography>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Typography variant="h3" color="text" style={styles.headerTitle}>
          Saved Items
        </Typography>
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: theme.colors.card }]}>
        {renderTabButton('calculation', 'Calculations', 'calculate')}
        {renderTabButton('comparison', 'Comparisons', 'compare')}
        {renderTabButton('decision', 'Decisions', 'casino')}
      </View>

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
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
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
    margin: 16,
    borderRadius: 8,
  },
  itemDetailsText: {
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  itemActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
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

export default SavedItemsScreen;
