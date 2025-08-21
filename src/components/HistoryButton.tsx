import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Button } from './Button';
import { useSavedItems } from './Save';
import { Share } from './Share';
import { Typography } from './Typography';

interface HistoryButtonProps {
  dataType: 'calculation' | 'comparison' | 'decision';
  onLoadItem?: (data: any) => void;
  variant?: 'button' | 'icon';
  style?: any;
}

interface SavedItem {
  id: string;
  name: string;
  data: any;
  type: string;
  createdAt: string;
  updatedAt: string;
  isAutoSaved?: boolean;
}

export const HistoryButton: React.FC<HistoryButtonProps> = ({
  dataType,
  onLoadItem,
  variant = 'icon',
  style,
}) => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const {
    savedItems,
    isLoading,
    loadSavedItems,
    deleteSavedItem,
  } = useSavedItems(dataType);

  const handleOpenHistory = () => {
    loadSavedItems();
    setModalVisible(true);
  };

  const handleLoadItem = (item: SavedItem) => {
    Alert.alert(
      'Load Item',
      `Load "${item.name}" into the current calculator?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Load',
          onPress: () => {
            onLoadItem?.(item.data);
            setModalVisible(false);
            Alert.alert('Loaded', 'Data loaded successfully');
          },
        },
      ]
    );
  };

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
          return `${productCount} products compared`;
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

  const renderHistoryItem = ({ item }: { item: SavedItem }) => {
    const isExpanded = expandedItems.has(item.id);
    const createdDate = new Date(item.createdAt).toLocaleDateString();
    const createdTime = new Date(item.createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={[styles.itemCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <TouchableOpacity
          style={styles.itemHeader}
          onPress={() => toggleItemExpansion(item.id)}
        >
          <View style={styles.itemHeaderLeft}>
            <View style={styles.itemNameRow}>
              <Typography variant="body1" color="text" weight="semibold">
                {item.name}
              </Typography>
              {item.isAutoSaved && (
                <View style={[styles.autoSaveBadge, { backgroundColor: theme.colors.warning }]}>
                  <Typography variant="caption" style={styles.autoSaveText}>
                    AUTO
                  </Typography>
                </View>
              )}
            </View>
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

        {isExpanded && (
          <View style={styles.itemActions}>
            <Button
              title="Load"
              variant="primary"
              icon="download"
              size="small"
              onPress={() => handleLoadItem(item)}
              style={styles.actionButton}
            />
            
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
              style={styles.actionButton}
            />
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons
        name="history"
        size={64}
        color={theme.colors.tabBarInactive}
      />
      <Typography variant="h4" color="textSecondary" style={styles.emptyTitle}>
        No History
      </Typography>
      <Typography variant="body2" color="textSecondary" style={styles.emptyDescription}>
        Your saved {dataType}s will appear here.
      </Typography>
    </View>
  );

  const renderButton = () => {
    if (variant === 'icon') {
      return (
        <TouchableOpacity
          style={[styles.iconButton, style]}
          onPress={handleOpenHistory}
        >
          <MaterialIcons 
            name="history" 
            size={24} 
            color={theme.colors.primary} 
          />
        </TouchableOpacity>
      );
    }

    return (
      <Button
        title="History"
        icon="history"
        variant="outline"
        onPress={handleOpenHistory}
        style={style}
      />
    );
  };

  return (
    <>
      {renderButton()}
      
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { backgroundColor: theme.colors.primary }]}>
            <Typography variant="h3" style={styles.modalTitle}>
              History
            </Typography>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <MaterialIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <FlatList
            data={savedItems}
            keyExtractor={(item) => item.id}
            renderItem={renderHistoryItem}
            refreshing={isLoading}
            onRefresh={loadSavedItems}
            contentContainerStyle={[
              styles.listContainer,
              savedItems.length === 0 && styles.listContainerEmpty,
            ]}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  listContainer: {
    padding: 16,
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
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  autoSaveBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  autoSaveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  itemPreview: {
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    flex: 1,
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
