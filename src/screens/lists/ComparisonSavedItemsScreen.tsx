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
import { Button, CustomHeader, Share, Typography, useTheme } from '../../components';
import { deleteQuickComparison, getQuickComparisons } from '../../utils/storage';

interface SavedItem {
  id: string;
  name: string;
  data: any;
  type: string;
  createdAt: string;
  updatedAt: string;
}

const ComparisonSavedItemsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSavedItems = async () => {
    try {
      setIsLoading(true);
      const quickComparisons = await getQuickComparisons();
      // Convert to the expected format for the UI
      const formattedItems = quickComparisons.map(comparison => ({
        id: comparison.id,
        name: comparison.title,
        data: {
          title: comparison.title,
          criteria: comparison.criteria,
          options: comparison.options,
          comparisonData: comparison.comparisonData,
        },
        type: 'comparison',
        createdAt: comparison.date,
        updatedAt: comparison.date,
      }));
      setSavedItems(formattedItems);
    } catch (error) {
      console.error('Failed to load saved comparisons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSavedItem = async (id: string) => {
    try {
      await deleteQuickComparison(id);
      await loadSavedItems(); // Reload the list
    } catch (error) {
      console.error('Failed to delete comparison:', error);
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
    if (item.data.pros && item.data.cons) {
      return `${item.data.pros.length} pros, ${item.data.cons.length} cons`;
    } else if (item.data.options && item.data.criteria) {
      return `${item.data.options.length} options, ${item.data.criteria.length} criteria`;
    }
    return 'Comparison data';
  };

  const formatDetailedData = (item: SavedItem): string => {
    if (item.data.pros && item.data.cons) {
      let details = `📈 PROS (${item.data.pros.length}):\n`;
      item.data.pros.forEach((pro: any) => {
        details += `• ${pro.text} (Weight: ${pro.weight})\n`;
      });
      details += `\n📉 CONS (${item.data.cons.length}):\n`;
      item.data.cons.forEach((con: any) => {
        details += `• ${con.text} (Weight: ${con.weight})\n`;
      });
      if (item.data.totalProsWeight !== undefined && item.data.totalConsWeight !== undefined) {
        details += `\n📊 SUMMARY:\n`;
        details += `Total Pros: ${item.data.totalProsWeight}\n`;
        details += `Total Cons: ${item.data.totalConsWeight}\n`;
        details += `Result: ${item.data.totalProsWeight > item.data.totalConsWeight ? 'Pros Win 😊' : 
                            item.data.totalProsWeight < item.data.totalConsWeight ? 'Cons Win 😕' : 'Tie 😐'}`;
      }
      return details;
    } else if (item.data.options && item.data.criteria) {
      let details = `📋 OPTIONS (${item.data.options.length}):\n`;
      item.data.options.forEach((option: any, index: number) => {
        details += `${index + 1}. ${option.name || `Option ${index + 1}`}\n`;
      });
      
      details += `\n📏 CRITERIA (${item.data.criteria.length}):\n`;
      item.data.criteria.forEach((criterion: any, index: number) => {
        details += `${index + 1}. ${criterion.text || `Criterion ${index + 1}`}\n`;
      });
      
      // Show comparison results
      if (item.data.comparisonData && item.data.comparisonData.length > 0) {
        details += `\n📊 COMPARISON RESULTS:\n`;
        item.data.options.forEach((option: any) => {
          details += `\n${option.name}:\n`;
          item.data.criteria.forEach((criterion: any) => {
            const cell = item.data.comparisonData.find((cell: any) => 
              cell.criterionId === criterion.id && cell.optionId === option.id
            );
            const status = cell ? cell.status : 'no';
            const emoji = status === 'yes' ? '✅' : status === 'partial' ? '⚠️' : '❌';
            details += `  ${emoji} ${criterion.text}\n`;
          });
        });
      }
      
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
                dataType="comparison"
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
      <MaterialIcons
        name="compare"
        size={64}
        color={theme.colors.tabBarInactive}
      />
      <Typography variant="h4" color="textSecondary" style={styles.emptyTitle}>
        No Saved Comparisons
      </Typography>
      <Typography variant="body2" color="textSecondary" style={styles.emptyDescription}>
        When you save comparisons, they'll appear here for easy access.
      </Typography>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header - Same style as other screens */}
      <CustomHeader
        title="Saved Pros and Cons"
        leftAction={{
          icon: "chevron-left",
          onPress: () => navigation.goBack()
        }}
      />

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingVertical: 16,
          paddingHorizontal: 24,
          paddingBottom: 80,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadSavedItems}
            tintColor={theme.colors.primary}
          />
        }
      >
        <FlatList
          data={savedItems}
          keyExtractor={(item) => item.id}
          renderItem={renderSavedItem}
          contentContainerStyle={[
            styles.listContainer,
            savedItems.length === 0 && styles.listContainerEmpty,
          ]}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 0,
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

export default ComparisonSavedItemsScreen;
