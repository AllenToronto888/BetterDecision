import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View
} from 'react-native';
import { Button, CustomHeader, Save, SectionTitle, Share, SwipableRow, Typography, useTheme } from '../../components';

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
  const [calculatorTitle, setCalculatorTitle] = useState('Total Cost');
  const [additionalCosts, setAdditionalCosts] = useState<CostItem[]>([
    { id: '1', type: 'shipping', label: 'Shipping', value: '', isPercentage: false },
    { id: '2', type: 'tax', label: 'Taxes', value: '', isPercentage: true },
  ]);
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [comparisonPrice, setComparisonPrice] = useState('');
  const [comparisonName, setComparisonName] = useState('');
  const [comparisonAdditionalCosts, setComparisonAdditionalCosts] = useState<CostItem[]>([
    { id: 'c1', type: 'shipping', label: 'Shipping', value: '', isPercentage: false },
    { id: 'c2', type: 'tax', label: 'Taxes', value: '', isPercentage: true },
  ]);
  const [comparisonTotalCost, setComparisonTotalCost] = useState(0);

  useEffect(() => {
    calculateTotalCost();
  }, [basePrice, additionalCosts]);

  useEffect(() => {
    if (compareEnabled) {
      calculateComparisonTotalCost();
    }
  }, [comparisonPrice, comparisonAdditionalCosts, compareEnabled]);

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

  const calculateComparisonTotalCost = () => {
    const base = parseFloat(comparisonPrice) || 0;
    let total = base;

    comparisonAdditionalCosts.forEach((cost) => {
      const value = parseFloat(cost.value) || 0;
      if (cost.isPercentage) {
        total += base * (value / 100);
      } else {
        total += value;
      }
    });

    setComparisonTotalCost(total);
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

  const updateComparisonCostItem = (id: string, field: keyof CostItem, value: any) => {
    const updatedCosts = comparisonAdditionalCosts.map((cost) => {
      if (cost.id === id) {
        return { ...cost, [field]: value };
      }
      return cost;
    });
    setComparisonAdditionalCosts(updatedCosts);
  };

  const addComparisonCostItem = () => {
    const newId = 'c' + (Math.max(...comparisonAdditionalCosts.map((cost) => parseInt(cost.id.replace('c', '')))) + 1).toString();
    setComparisonAdditionalCosts([
      ...comparisonAdditionalCosts,
      { id: newId, type: 'custom', label: 'Other', value: '', isPercentage: false },
    ]);
  };

  const removeComparisonCostItem = (id: string) => {
    setComparisonAdditionalCosts(comparisonAdditionalCosts.filter((cost) => cost.id !== id));
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
    const costItemContent = (
      <View style={[styles.costItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
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
          {item.isPercentage && (
            <Text style={[styles.percentageHelper, { color: theme.colors.tabBarInactive }]}>
              % of base price
            </Text>
          )}
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

    return (
      <View key={item.id} style={styles.costItemRow}>
        <SwipableRow
          onDelete={() => removeCostItem(item.id)}
          disabled={additionalCosts.length <= 1}
        >
          {costItemContent}
        </SwipableRow>
      </View>
    );
  };

  const renderComparisonCostItem = (item: CostItem) => {
    const costItemContent = (
      <View style={[styles.costItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.costItemHeader}>
          <View style={styles.costItemIcon}>
            <MaterialIcons name={getIconForCostType(item.type)} size={24} color={theme.colors.primary} />
          </View>
          <TextInput
            style={[styles.costItemLabel, { color: theme.colors.text }]}
            value={item.label}
            onChangeText={(value) => updateComparisonCostItem(item.id, 'label', value)}
            placeholder="Label"
            placeholderTextColor={theme.colors.tabBarInactive}
          />
          {item.isPercentage && (
            <Text style={[styles.percentageHelper, { color: theme.colors.tabBarInactive }]}>
              % of base price
            </Text>
          )}
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
              onChangeText={(value) => updateComparisonCostItem(item.id, 'value', value)}
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
              onValueChange={(value) => updateComparisonCostItem(item.id, 'isPercentage', value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.background}
            />
          </View>
        </View>
      </View>
    );

    return (
      <View key={item.id} style={styles.costItemRow}>
        <SwipableRow
          onDelete={() => removeComparisonCostItem(item.id)}
          disabled={comparisonAdditionalCosts.length <= 1}
        >
          {costItemContent}
        </SwipableRow>
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
          onPress: () => navigation.navigate('SavedItems' as never)
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
                    compareEnabled,
                    comparisonName: compareEnabled ? comparisonName : undefined,
                    comparisonPrice: compareEnabled ? comparisonPrice : undefined,
                    comparisonAdditionalCosts: compareEnabled ? comparisonAdditionalCosts : undefined,
                    comparisonTotalCost: compareEnabled ? comparisonTotalCost : undefined,
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
        
          {/* Purchase Price Section */}
          <Typography variant="h5" color="text" style={styles.sectionTitle}>
            Purchase Price Item 1
          </Typography>
          
          <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
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
          
          {/* Extra Costs Section */}
          <Typography variant="h5" color="text" style={styles.sectionTitle}>
            Extra Costs
          </Typography>
          
          {additionalCosts.map(renderCostItem)}
          
          <View style={styles.actionButtonsContainer}>
            <Button
              title="Add Cost"
              variant="primary"
              icon="add"
              size="large"
              onPress={addCostItem}
              style={styles.actionButton}
            />
            
            {(basePrice.trim() || productName.trim() || additionalCosts.some(cost => cost.value.trim())) && (
              <Button
                title="Clear All"
                variant="outline"
                icon="clear"
                size="large"
                onPress={() => {
                  setBasePrice('');
                  setProductName('');
                  setAdditionalCosts([
                    { id: '1', type: 'shipping', label: 'Shipping', value: '', isPercentage: false },
                    { id: '2', type: 'tax', label: 'Taxes', value: '', isPercentage: true },
                  ]);
                  setTotalCost(0);
                }}
                style={styles.actionButton}
              />
            )}
          </View>
        

        
        {/* Result Section */}
        <View style={[styles.resultSection, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.resultLabel, { color: theme.colors.tabBarInactive }]}>Total Cost</Text>
          <Text style={[styles.resultValue, { color: theme.colors.text }]}>
            ${totalCost.toFixed(2)}
          </Text>
        </View>
        
        {/* Compare Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.compareContainer}>
            <Text style={[styles.compareText, { color: theme.colors.text }]}>
              Compare With Another Item?
            </Text>
            <Switch
              value={compareEnabled}
              onValueChange={(value) => {
                setCompareEnabled(value);
                if (value) {
                  calculateComparisonTotalCost();
                }
              }}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.background}
            />
          </View>
        </View>
        
        {/* Item 2 Comparison Section - Only show when compareEnabled is true */}
        {compareEnabled && (
          <>
            {/* Purchase Price Item 2 Section */}
            <Typography variant="h5" color="text" style={styles.sectionTitle}>
              Purchase Price Item 2
            </Typography>
            
            <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <TextInput
                style={[styles.nameInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                value={comparisonName}
                onChangeText={setComparisonName}
                placeholder="Product name (optional)"
                placeholderTextColor={theme.colors.tabBarInactive}
              />
              
              <View style={styles.basePriceContainer}>
                <Text style={[styles.currencySymbol, { color: theme.colors.text }]}>$</Text>
                <TextInput
                  style={[styles.basePriceInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                  value={comparisonPrice}
                  onChangeText={setComparisonPrice}
                  keyboardType="numeric"
                  placeholder="Enter base price"
                  placeholderTextColor={theme.colors.tabBarInactive}
                />
              </View>
            </View>
            
            {/* Extra Costs Item 2 Section */}
            <Typography variant="h5" color="text" style={styles.sectionTitle}>
              Extra Costs Item 2
            </Typography>
            
            {comparisonAdditionalCosts.map(renderComparisonCostItem)}
            
            <View style={styles.actionButtonsContainer}>
              <Button
                title="Add Cost"
                variant="primary"
                icon="add"
                size="large"
                onPress={addComparisonCostItem}
                style={styles.actionButton}
              />
              
              {(comparisonPrice.trim() || comparisonName.trim() || comparisonAdditionalCosts.some(cost => cost.value.trim())) && (
                <Button
                  title="Clear All"
                  variant="outline"
                  icon="clear"
                  size="large"
                  onPress={() => {
                    setComparisonPrice('');
                    setComparisonName('');
                    setComparisonAdditionalCosts([
                      { id: 'c1', type: 'shipping', label: 'Shipping', value: '', isPercentage: false },
                      { id: 'c2', type: 'tax', label: 'Taxes', value: '', isPercentage: true },
                    ]);
                    setComparisonTotalCost(0);
                  }}
                  style={styles.actionButton}
                />
              )}
            </View>
            

            
            {/* Item 2 Total Cost */}
            <View style={[styles.resultSection, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Text style={[styles.resultLabel, { color: theme.colors.tabBarInactive }]}>Total Cost</Text>
              <Text style={[styles.resultValue, { color: theme.colors.text }]}>
                ${comparisonTotalCost.toFixed(2)}
              </Text>
            </View>
            
            {/* Comparison Button */}
            <Button
              title="Compare"
              variant="secondary"
              icon="compare"
              style={[styles.buttonRow, { marginTop: 16, marginBottom: 16 }]}
              onPress={calculateComparisonTotalCost}
            />
            
            {/* Difference Section */}
            <View style={[styles.resultSection, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              {totalCost === comparisonTotalCost ? (
                <>
                  <Text style={[styles.resultLabel, { color: theme.colors.tabBarInactive }]}>
                    Both items cost the same
                  </Text>
                  <Text style={[styles.resultValue, { color: theme.colors.text }]}>
                    $0.00
                  </Text>
                </>
              ) : totalCost > comparisonTotalCost ? (
                <>
                  <Text style={[styles.resultLabel, { color: theme.colors.tabBarInactive }]}>
                    {productName || 'Item 1'} is{'\n'}more by
                  </Text>
                  <Text style={[styles.resultValue, { color: theme.colors.success }]}>
                    ${Math.abs(totalCost - comparisonTotalCost).toFixed(2)}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[styles.resultLabel, { color: theme.colors.tabBarInactive }]}>
                    {productName || 'Item 1'} is{'\n'}less by
                  </Text>
                  <Text style={[styles.resultValue, { color: theme.colors.danger }]}>
                    -${Math.abs(totalCost - comparisonTotalCost).toFixed(2)}
                  </Text>
                </>
              )}
            </View>
          </>
        )}
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
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  section: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  nameInput: {
    height: 48,
    borderRadius: 4,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 18,
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
    fontSize: 18,
  },
  costItemRow: {
    marginBottom: -8,
  },
  costItem: {
    borderRadius: 8,
    marginBottom: 0,
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
    fontSize: 18,
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
    fontSize: 18,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    marginRight: 8,
    fontSize: 16,
  },
  percentageHelper: {
    fontSize: 12,
    marginLeft: 'auto',
  },

  compareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compareText: {
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  halfButton: {
    flex: 1,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  resultSection: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 18,
    flex: 1,
  },
  resultValue: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  comparisonText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  comparisonResultText: {
    fontSize: 18,
    fontWeight: '500',
    paddingVertical: 16,
  },
});

export default TotalCostScreen;
