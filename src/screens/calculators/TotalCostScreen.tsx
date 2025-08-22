import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button, CustomHeader, Save, SectionTitle, Share, useTheme } from '../../components';

interface CostItem {
  id: string;
  type: 'shipping' | 'tax' | 'fee' | 'custom';
  label: string;
  value: string;
  isPercentage: boolean;
}

const TotalCostScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [basePrice, setBasePrice] = useState('');
  const [productName, setProductName] = useState('');
  const [calculatorTitle, setCalculatorTitle] = useState('Total Cost Calculator');
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

  const clearAll = () => {
    setBasePrice('');
    setProductName('');
    setAdditionalCosts([
      { id: '1', type: 'shipping', label: 'Shipping', value: '', isPercentage: false },
      { id: '2', type: 'tax', label: 'Taxes', value: '', isPercentage: true },
    ]);
    setCompareEnabled(false);
    setTotalCost(0);
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
        style={[styles.costItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
      >
        <View style={styles.costItemHeader}>
          <View style={styles.costItemIcon}>
            <MaterialIcons name={getIconForCostType(item.type)} size={24} color={theme.colors.primary} />
          </View>
          <TextInput
            style={[styles.costItemLabel, { color: theme.colors.text }]}
            value={item.label}
            onChangeText={(value) => updateCostItem(item.id, 'label', value)}
            placeholder="Label"
            placeholderTextColor={theme.colors.tabBarInactive}
          />
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => removeCostItem(item.id)}
          >
            <MaterialIcons name="close" size={20} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.costItemContent}>
          <View style={styles.inputContainer}>
            {item.isPercentage ? (
              <Text style={[styles.inputPrefix, { color: theme.colors.text }]}>%</Text>
            ) : (
              <Text style={[styles.inputPrefix, { color: theme.colors.text }]}>$</Text>
            )}
            <TextInput
              style={[styles.costInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
              value={item.value}
              onChangeText={(value) => updateCostItem(item.id, 'value', value)}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={theme.colors.tabBarInactive}
            />
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={[styles.switchLabel, { color: theme.colors.text }]}>
              {item.isPercentage ? '%' : '$'}
            </Text>
            <Switch
              value={item.isPercentage}
              onValueChange={(value) => updateCostItem(item.id, 'isPercentage', value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.background}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomHeader
        title="Total Cost"
        leftAction={{
          icon: "chevron-left",
          onPress: () => navigation.goBack()
        }}
        rightAction={{
          icon: "history",
          onPress: () => {
            console.log('History pressed');
          }
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={[styles.container, { backgroundColor: theme.colors.background }]}
          contentContainerStyle={styles.contentContainer}
        >
          <SectionTitle
            title={calculatorTitle}
            onTitleChange={setCalculatorTitle}
            editable={true}
            maxLength={50}
            actions={
              <>
                <Save
                  data={{
                    basePrice,
                    productName,
                    additionalCosts,
                    totalCost,
                    calculationType: 'total_cost',
                    title: calculatorTitle,
                  }}
                  dataType="calculation"
                  variant="icon"
                  showInput={false}
                  onSaveSuccess={(name) => console.log('Saved as:', name)}
                />
                <Share
                  data={{
                    basePrice,
                    additionalCosts,
                    totalCost,
                    calculationType: 'total_cost',
                  }}
                  dataType="calculation"
                  title="Total Cost Calculation"
                  variant="icon"
                  onShareSuccess={() => console.log('Shared successfully')}
                />
              </>
            }
          />
        
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Purchase Price</Text>
          
          <TextInput
            style={[styles.nameInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
            value={productName}
            onChangeText={setProductName}
            placeholder="Product name (optional)"
            placeholderTextColor={theme.colors.tabBarInactive}
          />
          
          <View style={styles.basePriceContainer}>
            <Text style={[styles.currencySymbol, { color: theme.colors.text }]}>$</Text>
            <TextInput
              style={[styles.basePriceInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
              value={basePrice}
              onChangeText={setBasePrice}
              keyboardType="numeric"
              placeholder="Enter base price"
              placeholderTextColor={theme.colors.tabBarInactive}
            />
          </View>
        </View>
        
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Extra Costs</Text>
          
          {additionalCosts.map(renderCostItem)}
          
          <Button
            title="Add Another Cost"
            variant="primary"
            icon="add"
            onPress={addCostItem}
            style={styles.addButton}
          />
        </View>
        
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.compareContainer}>
            <Text style={[styles.compareText, { color: theme.colors.text }]}>
              Compare With Another Item?
            </Text>
            <Switch
              value={compareEnabled}
              onValueChange={setCompareEnabled}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.background}
            />
          </View>
        </View>
        
        <Button
          title="Calculate"
          variant="primary"
          icon="calculate"
          style={styles.calculateButton}
          onPress={() => calculateTotalCost()}
        />
        
        <Button
          title="Clear All"
          variant="outline"
          style={styles.clearButton}
          onPress={clearAll}
        />
        
        <View style={[styles.resultSection, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.resultLabel, { color: theme.colors.tabBarInactive }]}>Total Cost</Text>
          <Text style={[styles.resultValue, { color: theme.colors.text }]}>
            ${totalCost.toFixed(2)}
          </Text>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 16,
  },
  section: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 24,
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
    marginHorizontal: 24,
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
    marginHorizontal: 24,
    borderWidth: 1,
  },
  clearButtonText: {
    fontSize: 16,
  },
  resultSection: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 24,
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
