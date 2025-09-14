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
import { CustomHeader, Icon, Typography, useDeleteAll, useSavedItems, useTheme } from '../../components';
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

const QuickComparisonSavedItemsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const {
    savedItems,
    isLoading,
    loadSavedItems,
    deleteSavedItem,
  } = useSavedItems('quick_comparison');



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

  const { handleClearAll } = useDeleteAll({
    items: savedItems,
    storageConfig: {
      type: 'clear',
      storageKey: 'saved_quick_comparisons'
    },
    onDeleteSuccess: loadSavedItems,
    alertConfig: {
      noItemsMessage: t('quickItemsWillAppearHere'),
      confirmTitle: t('clearAllQuick'),
      itemTypePlural: t('savedQuickItems'),
      successMessage: t('allQuickItemsCleared'),
      errorMessage: t('failedToClearAllQuickItems')
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
    let details = '';
    
    if (item.data.criteria && item.data.options && item.data.comparisonData) {
      const criteria = item.data.criteria;
      const options = item.data.options;
      const comparisonData = item.data.comparisonData;

      details += `${t('criteria')}: ${criteria.map((c: any) => {
        const text = c.text || c;
        return typeof text === 'string' ? text : (text || `${t('criteria')} ${c.id}`);
      }).join(', ')}\n`;
      details += `${t('options')}: ${options.map((o: any) => {
        const name = o.name || o;
        return typeof name === 'string' ? name : (name || `${t('options')} ${o.id}`);
      }).join(', ')}\n\n`;
      
      // Show comparison results
      details += `${t('comparisonResults')}:\n`;
      criteria.forEach((criterion: any, criterionIndex: number) => {
        const criterionText = typeof (criterion.text || criterion) === 'string' ? (criterion.text || criterion) : (criterion.text || `${t('criteria')} ${criterion.id}`);
        details += `\n${criterionText}:\n`;
        options.forEach((option: any, optionIndex: number) => {
          const optionName = typeof (option.name || option) === 'string' ? (option.name || option) : (option.name || `${t('options')} ${option.id}`);
          const cellData = comparisonData.find((cell: any) => 
            cell.criterionId === criterion.id && cell.optionId === option.id
          );
          const status = cellData?.status || 'no';
          const resultText = status === 'yes' ? `✓ ${t('yes')}` : status === 'no' ? `✗ ${t('no')}` : `◐ ${t('partial')}`;
          details += `  ${optionName}: ${resultText}\n`;
        });
      });
      
      // Add notes if they exist
      if (item.data.notes && item.data.notes.trim()) {
        details += `\n\n${t('notes').toUpperCase()}:\n${item.data.notes.trim()}`;
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
          <Icon
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
                <Icon name="share" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionIcon}
                onPress={() => handleDeleteItem(item)}
              >
                <Icon name="delete" size={20} color={theme.colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon
        name="compare"
        size={64}
        color={theme.colors.tabBarInactive}
      />
      <Typography variant="h6" color="textSecondary" style={styles.emptyTitle}>
{t('noQuickSaved')}
      </Typography>
      <Typography variant="body2" color="textSecondary" style={styles.emptyDescription}>
{t('quickItemsWillAppearHere')}
      </Typography>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <CustomHeader
        title={t('savedQuick')}
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

export default QuickComparisonSavedItemsScreen;
