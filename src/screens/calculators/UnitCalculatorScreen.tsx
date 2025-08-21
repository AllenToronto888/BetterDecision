import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, HistoryButton, Save, Share, Typography, useAutoSave, useTheme } from '../../components';

interface Product {
  name: string;
  price: string;
  quantity: string;
  unit: string;
  unitPrice: number;
}

const UnitCalculatorScreen = () => {
  const { theme } = useTheme();
  const [products, setProducts] = useState<Product[]>([
    { name: '', price: '', quantity: '', unit: 'g', unitPrice: 0 },
    { name: '', price: '', quantity: '', unit: 'g', unitPrice: 0 },
  ]);
  const [bestProductIndex, setBestProductIndex] = useState<number | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'pending' | 'saving' | 'saved' | 'error'>('idle');
  const [calculatorTitle, setCalculatorTitle] = useState('Unit Price Calculator');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Auto-save functionality
  useAutoSave({
    data: {
      products,
      bestProductIndex,
      calculationType: 'unit_price',
    },
    dataType: 'calculation',
    enabled: products.some(p => p.price.trim() && p.quantity.trim()),
    delay: 3000, // Auto-save after 3 seconds of inactivity
    onSave: (name) => console.log('Auto-saved:', name),
    onError: (error) => console.error('Auto-save error:', error),
    onStatusChange: setAutoSaveStatus,
  });

  const unitOptions = ['g', 'kg', 'ml', 'l', 'oz', 'lb', 'each'];

  useEffect(() => {
    calculateUnitPrices();
  }, [products.map(p => `${p.price}-${p.quantity}-${p.unit}`).join(',')]);

  const calculateUnitPrices = () => {
    const updatedProducts = products.map((product) => {
      const price = parseFloat(product.price) || 0;
      const quantity = parseFloat(product.quantity) || 1;
      let standardizedQuantity = quantity;
      
      // Convert to standard units (g or ml)
      switch (product.unit) {
        case 'kg':
          standardizedQuantity = quantity * 1000;
          break;
        case 'l':
          standardizedQuantity = quantity * 1000;
          break;
        case 'lb':
          standardizedQuantity = quantity * 453.592;
          break;
        case 'oz':
          standardizedQuantity = quantity * 28.3495;
          break;
      }
      
      const unitPrice = standardizedQuantity > 0 ? price / standardizedQuantity : 0;
      return { ...product, unitPrice };
    });
    
    // Only update if there are actual changes to avoid infinite loop
    const hasChanges = updatedProducts.some((product, index) => 
      product.unitPrice !== products[index].unitPrice
    );
    
    if (hasChanges) {
      setProducts(updatedProducts);
    }
    
    // Find the best product (lowest unit price)
    let lowestIndex = null;
    let lowestUnitPrice = Infinity;
    
    updatedProducts.forEach((product, index) => {
      if (product.unitPrice > 0 && product.unitPrice < lowestUnitPrice) {
        lowestUnitPrice = product.unitPrice;
        lowestIndex = index;
      }
    });
    
    setBestProductIndex(lowestIndex);
  };

  const updateProduct = (index: number, field: keyof Product, value: string) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setProducts(updatedProducts);
  };

  const cycleUnit = (index: number) => {
    const currentUnitIndex = unitOptions.indexOf(products[index].unit);
    const nextUnitIndex = (currentUnitIndex + 1) % unitOptions.length;
    updateProduct(index, 'unit', unitOptions[nextUnitIndex]);
  };

  const addProduct = () => {
    setProducts([...products, { name: '', price: '', quantity: '', unit: 'g', unitPrice: 0 }]);
  };

  const loadHistoryData = (historyData: any) => {
    if (historyData.products && Array.isArray(historyData.products)) {
      setProducts(historyData.products);
      setBestProductIndex(historyData.bestProductIndex || null);
      // Also load title if saved
      if (historyData.title) {
        setCalculatorTitle(historyData.title);
      }
    }
  };

  const clearAllProducts = () => {
    setProducts([
      { name: '', price: '', quantity: '', unit: 'g', unitPrice: 0 },
      { name: '', price: '', quantity: '', unit: 'g', unitPrice: 0 },
    ]);
    setBestProductIndex(null);
  };

  const removeProduct = (index: number) => {
    if (products.length > 2) {
      const updatedProducts = [...products];
      updatedProducts.splice(index, 1);
      setProducts(updatedProducts);
    }
  };

  const renderProduct = (product: Product, index: number) => {
    const isBest = index === bestProductIndex && products.length > 1;
    const baseCardStyle = [
      styles.productCard,
      { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
    ];
    const cardStyle = isBest
      ? [...baseCardStyle, { borderColor: theme.colors.success, borderWidth: 2 }]
      : baseCardStyle;

    return (
      <View key={index} style={cardStyle}>
        {isBest && (
          <View style={[styles.bestBadge, { backgroundColor: theme.colors.success }]}>
            <MaterialIcons name="check" size={16} color="#FFFFFF" />
            <Typography variant="caption" style={styles.bestBadgeText}>Best!</Typography>
          </View>
        )}
        
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
            placeholder="Product name"
            placeholderTextColor={theme.colors.tabBarInactive}
            value={product.name}
            onChangeText={(value) => updateProduct(index, 'name', value)}
          />
        </View>
        
        <View style={styles.row}>
          <View style={styles.priceContainer}>
            <Typography variant="body1" color="text" style={styles.currencySymbol}>$</Typography>
            <TextInput
              style={[styles.priceInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
              placeholder="Price"
              placeholderTextColor={theme.colors.tabBarInactive}
              keyboardType="numeric"
              value={product.price}
              onChangeText={(value) => updateProduct(index, 'price', value)}
            />
          </View>
          
          <View style={styles.quantityContainer}>
            <TextInput
              style={[styles.quantityInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
              placeholder="Qty"
              placeholderTextColor={theme.colors.tabBarInactive}
              keyboardType="numeric"
              value={product.quantity}
              onChangeText={(value) => updateProduct(index, 'quantity', value)}
            />
            
            <TouchableOpacity
              style={[styles.unitButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => cycleUnit(index)}
            >
              <Typography variant="button" style={styles.unitButtonText}>{product.unit}</Typography>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.resultContainer}>
          <Typography variant="body2" color="textSecondary" style={styles.unitPriceLabel}>
            Unit Price:
          </Typography>
          <Typography 
            variant="body1" 
            color={isBest ? "success" : "text"} 
            style={styles.unitPriceValue}
            weight="semibold"
          >
            ${product.unitPrice.toFixed(4)} / {product.unit === 'kg' || product.unit === 'l' ? 
              (product.unit === 'kg' ? 'g' : 'ml') : 
              product.unit}
          </Typography>
        </View>
        
        {products.length > 2 && (
          <TouchableOpacity
            style={[styles.removeButton, { backgroundColor: theme.colors.danger }]}
            onPress={() => removeProduct(index)}
          >
            <MaterialIcons name="delete" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header with Editable Title */}
        <View style={styles.headerRow}>
          {isEditingTitle ? (
            <TextInput
              style={[styles.titleInput, { color: theme.colors.text, borderColor: theme.colors.primary }]}
              value={calculatorTitle}
              onChangeText={setCalculatorTitle}
              onBlur={() => setIsEditingTitle(false)}
              onSubmitEditing={() => setIsEditingTitle(false)}
              autoFocus
              maxLength={50}
            />
          ) : (
            <TouchableOpacity
              style={styles.titleContainer}
              onPress={() => setIsEditingTitle(true)}
            >
              <Typography variant="h3" color="text" style={styles.screenTitle}>
                {calculatorTitle}
              </Typography>
              <MaterialIcons name="edit" size={20} color={theme.colors.textSecondary} style={styles.editIcon} />
            </TouchableOpacity>
          )}
          <View style={styles.headerActions}>
            <Save
              data={{
                products,
                bestProductIndex,
                calculationType: 'unit_price',
                title: calculatorTitle,
              }}
              dataType="calculation"
              variant="icon"
              showInput={false}
              onSaveSuccess={(name) => console.log('Saved as:', name)}
            />
            <Share
              data={{
                products,
                bestProductIndex,
                calculationType: 'unit_price',
              }}
              dataType="calculation"
              title="Unit Price Comparison"
              variant="icon"
              onShareSuccess={() => console.log('Copied/Shared successfully')}
            />
            <HistoryButton
              dataType="calculation"
              onLoadItem={loadHistoryData}
              variant="icon"
            />
          </View>
        </View>

        {products.map(renderProduct)}
        
        <View style={styles.actionButtonsContainer}>
          <Button
            title="Add Product"
            variant="primary"
            icon="add"
            onPress={addProduct}
            style={styles.actionButton}
          />
          
          {products.some(p => p.price.trim() || p.quantity.trim() || p.name.trim()) && (
            <Button
              title="Clear All"
              variant="outline"
              icon="clear"
              onPress={clearAllProducts}
              style={styles.actionButton}
            />
          )}
        </View>

        {/* Auto-save Status */}
        {products.some(p => p.price.trim() && p.quantity.trim()) && autoSaveStatus !== 'idle' && (
          <View style={styles.autoSaveStatus}>
            <Typography variant="caption" color="textSecondary" style={styles.autoSaveText}>
              {autoSaveStatus === 'pending' && '⏳ Changes detected...'}
              {autoSaveStatus === 'saving' && '💾 Saving...'}
              {autoSaveStatus === 'saved' && '✅ Auto-saved!'}
              {autoSaveStatus === 'error' && '❌ Save failed'}
            </Typography>
          </View>
        )}
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
  productCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    position: 'relative',
  },
  bestBadge: {
    position: 'absolute',
    top: 0,
    left: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bestBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  priceContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  currencySymbol: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  priceInput: {
    flex: 1,
    height: 48,
    borderRadius: 4,
    paddingLeft: 24,
    paddingRight: 12,
  },
  quantityContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  quantityInput: {
    flex: 1,
    height: 48,
    borderRadius: 4,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  unitButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  unitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  resultContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitPriceLabel: {
    fontSize: 14,
  },
  unitPriceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  removeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  screenTitle: {
    flex: 1,
  },
  editIcon: {
    marginLeft: 8,
    opacity: 0.6,
  },
  titleInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  autoSaveStatus: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  autoSaveText: {
    fontStyle: 'italic',
  },
});

export default UnitCalculatorScreen;
