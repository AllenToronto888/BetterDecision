import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CostItem {
  id: string;
  type: 'shipping' | 'tax' | 'fee' | 'custom';
  label: string;
  value: string;
  isPercentage: boolean;
}

const TotalCostScreen = () => {
  const { theme } = useTheme();
  const [basePrice, setBasePrice] = useState('');
  const [productName, setProductName] = useState('');
  const [additionalCosts, setAdditionalCosts] = useState<CostItem[]>([
    { id: '1', type: 'shipping', label: 'Shipping', value: '', isPercentage: false },
    { id: '2', type: 'tax', label: 'Taxes', value: '', isPercentage: true },
  ]);
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    calculateTotalCost();
  }, [basePrice, additionalCosts]);

  const calculateTotalCost = () => {
    const base = parseFloat(basePrice) || 0;
    let total = base;

    additionalCosts.forEach((cost) => {
      const value = parseFloat(cost.value) || 0;
      if (cost.isPercentage) {
        total += base * (value / 100);
      } else {
        total += value;
      }
    });

    setTotalCost(total);
  };

  const updateCostItem = (id: string, field: keyof CostItem, value: any) => {
    const updatedCosts = additionalCosts.map((cost) => {
      if (cost.id === id) {
        return { ...cost, [field]: value };
      }
      return cost;
    });
    setAdditionalCosts(updatedCosts);
  };

  const addCostItem = () => {
    const newId = (Math.max(...additionalCosts.map((cost) => parseInt(cost.id))) + 1).toString();
    setAdditionalCosts([
      ...additionalCosts,
      { id: newId, type: 'custom', label: 'Other', value: '', isPercentage: false },
    ]);
  };

  const removeCostItem = (id: string) => {
    setAdditionalCosts(additionalCosts.filter((cost) => cost.id !== id));
  };

  const getIconForCostType = (type: string) => {
    switch (type) {
      case 'shipping':
        return 'local-shipping';
      case 'tax':
        return 'percent';
      case 'fee':
        return 'attach-money';
      default:
        return 'add-circle-outline';
    }
  };

  const renderCostItem = (item: CostItem) => {
    return (
      <View 
        key={item.id} 
        style={[styles.costItem, { backgroundColor: theme.card, borderColor: theme.border }]}
      >
        <View style={styles.costItemHeader}>
          <View style={styles.costItemIcon}>
            <Icon name={getIconForCostType(item.type)} size={24} color={theme.primary} />
          </View>
          <TextInput
            style={[styles.costItemLabel, { color: theme.text }]}
            value={item.label}
            onChangeText={(value) => updateCostItem(item.id, 'label', value)}
            placeholder="Label"
            placeholderTextColor={theme.tabBarInactive}
          />
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => removeCostItem(item.id)}
          >
            <Icon name="close" size={20} color={theme.danger} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.costItemContent}>
          <View style={styles.inputContainer}>
            {item.isPercentage ? (
              <Text style={[styles.inputPrefix, { color: theme.text }]}>%</Text>
            ) : (
              <Text style={[styles.inputPrefix, { color: theme.text }]}>$</Text>
            )}
            <TextInput
              style={[styles.costInput, { backgroundColor: theme.background, color: theme.text }]}
              value={item.value}
              onChangeText={(value) => updateCostItem(item.id, 'value', value)}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={theme.tabBarInactive}
            />
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={[styles.switchLabel, { color: theme.text }]}>
              {item.isPercentage ? '%' : '$'}
            </Text>
            <Switch
              value={item.isPercentage}
              onValueChange={(value) => updateCostItem(item.id, 'isPercentage', value)}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={theme.background}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Total Cost</Text>
          <Text style={[styles.headerSubtitle, { color: theme.tabBarInactive }]}>
            Find the real price before you buy
          </Text>
        </View>
        
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Purchase Price</Text>
          
          <TextInput
            style={[styles.nameInput, { backgroundColor: theme.background, color: theme.text }]}
            value={productName}
            onChangeText={setProductName}
            placeholder="Product name (optional)"
            placeholderTextColor={theme.tabBarInactive}
          />
          
          <View style={styles.basePriceContainer}>
            <Text style={[styles.currencySymbol, { color: theme.text }]}>$</Text>
            <TextInput
              style={[styles.basePriceInput, { backgroundColor: theme.background, color: theme.text }]}
              value={basePrice}
              onChangeText={setBasePrice}
              keyboardType="numeric"
              placeholder="Enter base price"
              placeholderTextColor={theme.tabBarInactive}
            />
          </View>
        </View>
        
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Extra Costs</Text>
          
          {additionalCosts.map(renderCostItem)}
          
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={addCostItem}
          >
            <Icon name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Another Cost</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.compareContainer}>
            <Text style={[styles.compareText, { color: theme.text }]}>
              Compare With Another Item?
            </Text>
            <Switch
              value={compareEnabled}
              onValueChange={setCompareEnabled}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={theme.background}
            />
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.calculateButton, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.calculateButtonText}>Calculate</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.clearButton, { borderColor: theme.border }]}
        >
          <Text style={[styles.clearButtonText, { color: theme.tabBarInactive }]}>Clear All</Text>
        </TouchableOpacity>
        
        <View style={[styles.resultSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.resultLabel, { color: theme.tabBarInactive }]}>Total Cost</Text>
          <Text style={[styles.resultValue, { color: theme.text }]}>
            ${totalCost.toFixed(2)}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
  },
  section: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  nameInput: {
    height: 48,
    borderRadius: 4,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  basePriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  currencySymbol: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  basePriceInput: {
    flex: 1,
    height: 48,
    borderRadius: 4,
    paddingLeft: 24,
    paddingRight: 12,
  },
  costItem: {
    borderRadius: 4,
    marginBottom: 12,
    borderWidth: 1,
  },
  costItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  costItemIcon: {
    marginRight: 8,
  },
  costItemLabel: {
    flex: 1,
    fontSize: 16,
  },
  deleteButton: {
    padding: 4,
  },
  costItemContent: {
    flexDirection: 'row',
    padding: 8,
    paddingTop: 0,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginRight: 8,
  },
  inputPrefix: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  costInput: {
    flex: 1,
    height: 40,
    borderRadius: 4,
    paddingLeft: 24,
    paddingRight: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    marginRight: 8,
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  compareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compareText: {
    fontSize: 16,
  },
  calculateButton: {
    padding: 16,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  clearButton: {
    padding: 16,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  clearButtonText: {
    fontSize: 16,
  },
  resultSection: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  resultLabel: {
    fontSize: 16,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
});

export default TotalCostScreen;
