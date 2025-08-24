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

const ProsConsSavedItemsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const {
    savedItems,
    isLoading,
    loadSavedItems,
    deleteSavedItem,
  } = useSavedItems('decision');



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
      storageKey: 'saved_decisions'
    },
    onDeleteSuccess: loadSavedItems,
    alertConfig: {
      noItemsMessage: t('noProsConsListsSaved'),
      confirmTitle: t('clearAllProsConsLists'),
      itemTypePlural: t('savedProsConsLists'),
      successMessage: t('allProsConsListsCleared'),
      errorMessage: t('failedToClearAllProsConsLists')
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
    
    if (item.data.pros && item.data.cons) {
      // Calculate totals from the pros/cons arrays
      const totalProsWeight = item.data.pros.reduce((sum: number, pro: any) => sum + (pro.weight || 1), 0);
      const totalConsWeight = item.data.cons.reduce((sum: number, con: any) => sum + (con.weight || 1), 0);
      
      details += `${t('totalProsScore')}: ${totalProsWeight}\n`;
      details += `${t('totalConsScore')}: ${totalConsWeight}\n\n`;
      
      if (item.data.pros.length > 0) {
        details += `${t('pros').toUpperCase()}:\n`;
        item.data.pros.forEach((pro: any) => {
          details += `• ${pro.text} (${t('weight')}: ${pro.weight || 1})\n`;
        });
      }
      
      if (item.data.cons.length > 0) {
        details += `\n${t('cons').toUpperCase()}:\n`;
        item.data.cons.forEach((con: any) => {
          details += `• ${con.text} (${t('weight')}: ${con.weight || 1})\n`;
        });
      }
      
      // Add notes if they exist
      if (item.data.notes && item.data.notes.trim()) {
        details += `\n${t('notes').toUpperCase()}:\n${item.data.notes.trim()}\n`;
      }
      
      details += `\n${t('result')}: ${totalProsWeight > totalConsWeight ? t('prosWin') : 
        totalConsWeight > totalProsWeight ? t('consWin') : t('tie')}`;
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
        name="thumbs-up-down"
        size={64}
        color={theme.colors.tabBarInactive}
      />
      <Typography variant="h6" color="textSecondary" style={styles.emptyTitle}>
{t('noProsConsListsSaved')}
      </Typography>
      <Typography variant="body2" color="textSecondary" style={styles.emptyDescription}>
{t('prosConsListsWillAppearHere')}
      </Typography>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <CustomHeader
        title={t('savedProsAndCons')}
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

export default ProsConsSavedItemsScreen;
