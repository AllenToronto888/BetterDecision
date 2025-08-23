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
import { CustomHeader, Typography, useTheme } from '../../components';
import { deleteDetailComparison, getDetailComparisons } from '../../utils/storage';

interface SavedItem {
  id: string;
  name: string;
  data: any;
  type: string;
  comparisonType: 'detail';
  createdAt: string;
  updatedAt: string;
}

const DetailComparisonSavedItemsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSavedItems = async () => {
    try {
      setIsLoading(true);
      
      // Load only detail comparisons
      const detailComparisons = await getDetailComparisons();
      console.log('DEBUG: Loaded detail comparisons:', detailComparisons.length, detailComparisons);
      
      // Format detail comparisons
      const formattedDetailItems = detailComparisons.map(comparison => ({
        id: comparison.id,
        name: comparison.title,
        data: {
          title: comparison.title,
          criteria: comparison.criteria,
          options: comparison.options,
          comparisonData: comparison.comparisonData,
          notes: comparison.notes,
        },
        type: 'comparison',
        comparisonType: 'detail' as const,
        createdAt: comparison.date,
        updatedAt: comparison.date,
      }));
      
      // Sort by date (newest first)
      const sortedItems = formattedDetailItems
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setSavedItems(sortedItems);
    } catch (error) {
      console.error('Failed to load saved detail comparisons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSavedItem = async (id: string) => {
    try {
      await deleteDetailComparison(id);
      await loadSavedItems(); // Reload the list
    } catch (error) {
      console.error('Failed to delete detail comparison:', error);
      throw error;
    }
  };

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
      Alert.alert('No Items', 'There are no saved detail items to clear.');
      return;
    }

    Alert.alert(
      'Clear All Detail',
      `Are you sure you want to delete all ${savedItems.length} saved detail items? This cannot be undone.`,
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
              Alert.alert('Success', 'All detail items cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear all detail comparisons');
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

  const formatDetailedData = (item: SavedItem): string => {
    let details = '';
    
    if (item.data.criteria && item.data.options && item.data.comparisonData) {
      const criteria = item.data.criteria;
      const options = item.data.options;
      const comparisonData = item.data.comparisonData;

      details += `Criteria: ${criteria.map((c: any) => c.text || c).join(', ')}\n`;
      details += `Options: ${options.map((o: any) => o.name || o).join(', ')}\n\n`;
      
      // Show comparison results in table format
      details += 'Comparison Table:\n';
      criteria.forEach((criterion: any) => {
        const criterionText = criterion.text || criterion;
        details += `\n${criterionText}:\n`;
        options.forEach((option: any) => {
          const optionName = option.name || option;
          const cellData = comparisonData.find((cell: any) => 
            (cell.criterionId === criterion.id || cell.criterionId === criterion) &&
            (cell.optionId === option.id || cell.optionId === option)
          );
          const cellText = cellData?.text || 'N/A';
          details += `  ${optionName}: ${cellText}\n`;
        });
      });
      
      // Add notes if they exist
      if (item.data.notes && item.data.notes.trim()) {
        details += `\n\nNOTES:\n${item.data.notes.trim()}`;
      }
    }
    
    return details.trim();
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
        name="table-chart"
        size={64}
        color={theme.colors.tabBarInactive}
      />
      <Typography variant="h6" color="textSecondary" style={styles.emptyTitle}>
        No Detail Saved
      </Typography>
      <Typography variant="body2" color="textSecondary" style={styles.emptyDescription}>
        Your saved detail items will appear here.
      </Typography>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <CustomHeader
        title="Saved Detail"
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
        contentContainerStyle={[
          styles.listContainer,
          savedItems.length === 0 && styles.listContainerEmpty,
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

export default DetailComparisonSavedItemsScreen;
