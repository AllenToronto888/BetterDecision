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
import { getProsConsLists } from '../../utils/storage';

interface SavedItem {
  id: string;
  name: string;
  data: any;
  type: string;
  comparisonType: 'pros_cons';
  createdAt: string;
  updatedAt: string;
}

const ProsConsSavedItemsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSavedItems = async () => {
    try {
      setIsLoading(true);
      
      // Load only pros & cons lists
      const prosConsLists = await getProsConsLists();
      
      // Format pros & cons lists
      const formattedItems = prosConsLists.map(list => ({
        id: list.id,
        name: list.title,
        data: {
          title: list.title,
          pros: list.pros,
          cons: list.cons,
          totalProsWeight: list.pros?.reduce((sum: number, pro: any) => sum + (pro.weight || 1), 0) || 0,
          totalConsWeight: list.cons?.reduce((sum: number, con: any) => sum + (con.weight || 1), 0) || 0,
          notes: list.notes,
        },
        type: 'decision',
        comparisonType: 'pros_cons' as const,
        createdAt: list.date,
        updatedAt: list.date,
      }));
      
      // Sort by date (newest first)
      const sortedItems = formattedItems
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setSavedItems(sortedItems);
    } catch (error) {
      console.error('Failed to load saved pros & cons lists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSavedItem = async (id: string) => {
    try {
      // Use the storage method for pros & cons
      const { deleteProsConsList } = await import('../../utils/storage');
      await deleteProsConsList(id);
      await loadSavedItems(); // Reload the list
    } catch (error) {
      console.error('Failed to delete pros & cons list:', error);
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
      Alert.alert('No Items', 'There are no saved pros & cons lists to clear.');
      return;
    }

    Alert.alert(
      'Clear All Pros & Cons Lists',
      `Are you sure you want to delete all ${savedItems.length} saved pros & cons lists? This cannot be undone.`,
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
              Alert.alert('Success', 'All pros & cons lists cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear all pros & cons lists');
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
    
    if (item.data.pros && item.data.cons) {
      const totalProsWeight = item.data.totalProsWeight || 0;
      const totalConsWeight = item.data.totalConsWeight || 0;
      
      details += `Total Pros Score: ${totalProsWeight}\n`;
      details += `Total Cons Score: ${totalConsWeight}\n\n`;
      
      if (item.data.pros.length > 0) {
        details += 'PROS:\n';
        item.data.pros.forEach((pro: any) => {
          details += `• ${pro.text} (Weight: ${pro.weight || 1})\n`;
        });
      }
      
      if (item.data.cons.length > 0) {
        details += '\nCONS:\n';
        item.data.cons.forEach((con: any) => {
          details += `• ${con.text} (Weight: ${con.weight || 1})\n`;
        });
      }
      
      // Add notes if they exist
      if (item.data.notes && item.data.notes.trim()) {
        details += `\nNOTES:\n${item.data.notes.trim()}\n`;
      }
      
      details += `\nResult: ${totalProsWeight > totalConsWeight ? 'PROS WIN' : 
                              totalConsWeight > totalProsWeight ? 'CONS WIN' : 'TIE'}`;
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
        No Pros & Cons Lists Saved
      </Typography>
      <Typography variant="body2" color="textSecondary" style={styles.emptyDescription}>
        Your saved pros & cons lists will appear here.
      </Typography>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <CustomHeader
        title="Saved Pros & Cons"
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
