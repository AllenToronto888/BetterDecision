import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Button, CustomHeader, Save, SectionTitle, Share, SwipableRow, Typography, useAutoSave, useTheme } from '../../components';

interface Product {
  name: string;
  price: string;
  quantity: string;
  unit: string;
  unitPrice: number;
}

const UnitCalculatorScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [products, setProducts] = useState<Product[]>([
    { name: '', price: '', quantity: '', unit: 'g', unitPrice: 0 },
    { name: '', price: '', quantity: '', unit: 'g', unitPrice: 0 },
  ]);
  const [bestProductIndexes, setBestProductIndexes] = useState<number[]>([]);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'pending' | 'saving' | 'saved' | 'error'>('idle');
  const [calculatorTitle, setCalculatorTitle] = useState('Unit Price');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Auto-save functionality
  useAutoSave({
    data: {
      products,
      bestProductIndexes,
      calculationType: 'unit_price',
    },
    dataType: 'calculation',
    enabled: products.some(p => p.price.trim() !== '' && p.quantity.trim() !== ''),
    delay: 1000, // Auto-save after 1 second of inactivity
    onSave: (name) => {
      console.log('Auto-saved:', name);
      // Force status to saved, then idle after a short delay
      setTimeout(() => setAutoSaveStatus('idle'), 1500);
    },
    onError: (error) => {
      console.error('Auto-save error:', error);
      // Force status back to idle after error
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    },
    onStatusChange: setAutoSaveStatus,
  });

  const unitOptions = ['g', 'kg', 'ml', 'l', 'oz', 'lb', 'each'];

  useEffect(() => {
    calculateUnitPrices();
  }, [products.map(p => `${p.price}-${p.quantity}-${p.unit}`).join(',')]);

  // Failsafe: Reset auto-save status if it gets stuck in pending for too long
  useEffect(() => {
    if (autoSaveStatus === 'pending') {
      const timeout = setTimeout(() => {
        console.log('Auto-save timeout - resetting to idle');
        setAutoSaveStatus('idle');
      }, 5000); // Reset after 5 seconds if stuck in pending
      
      return () => clearTimeout(timeout);
    }
  }, [autoSaveStatus]);



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
    
    // Check if ALL products have valid unit prices (price > 0 and quantity > 0)
    const allProductsHaveValidPrices = updatedProducts.every((product) => {
      const price = parseFloat(product.price) || 0;
      const quantity = parseFloat(product.quantity) || 0;
      return price > 0 && quantity > 0;
    });
    
    // Only find the best products if ALL products have valid prices
    if (allProductsHaveValidPrices && updatedProducts.length > 1) {
      let lowestUnitPrice = Infinity;
      
      // First pass: find the lowest unit price
      updatedProducts.forEach((product) => {
        if (product.unitPrice > 0 && product.unitPrice < lowestUnitPrice) {
          lowestUnitPrice = product.unitPrice;
        }
      });
      
      // Second pass: find all products with the lowest unit price (handle ties)
      const bestIndexes: number[] = [];
      updatedProducts.forEach((product, index) => {
        if (product.unitPrice > 0 && product.unitPrice === lowestUnitPrice) {
          bestIndexes.push(index);
        }
      });
      
      setBestProductIndexes(bestIndexes);
    } else {
      // Clear the best products if not all products have valid prices
      setBestProductIndexes([]);
    }
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

  // Removed loadHistoryData function as HistoryButton is no longer used in the component

  const clearAllProducts = () => {
    setProducts([
      { name: '', price: '', quantity: '', unit: 'g', unitPrice: 0 },
      { name: '', price: '', quantity: '', unit: 'g', unitPrice: 0 },
    ]);
    setBestProductIndexes([]);
  };

  const removeProduct = (index: number) => {
    if (products.length > 2) {
      const updatedProducts = [...products];
      updatedProducts.splice(index, 1);
      setProducts(updatedProducts);
    }
  };

  const renderProduct = (product: Product, index: number) => {
    const isBest = bestProductIndexes.includes(index) && products.length > 1;
    const baseCardStyle = [
      styles.productCard,
      { 
        backgroundColor: theme.colors.card, 
        borderColor: theme.colors.border,
      },
    ];
    const cardStyle = isBest
      ? [...baseCardStyle, { borderColor: theme.colors.primary, borderWidth: 2 }]
      : baseCardStyle;

    const cardContent = (
      <View style={cardStyle}>
        <View style={styles.row}>
          <TextInput
            style={[
              styles.input, 
              { backgroundColor: theme.colors.background, color: theme.colors.text },
              focusedInput === `name-${index}` && { borderWidth: 2, borderColor: theme.colors.primary }
            ]}
            placeholder="Product name"
            placeholderTextColor={theme.colors.tabBarInactive}
            value={product.name}
            onChangeText={(value) => updateProduct(index, 'name', value)}
            onFocus={() => setFocusedInput(`name-${index}`)}
            onBlur={() => setFocusedInput(null)}
          />
        </View>
        
        <View style={styles.row}>
          <View style={styles.priceContainer}>
            <Typography variant="body1" color="text" style={styles.currencySymbol}>$</Typography>
            <TextInput
              style={[
                styles.priceInput, 
                { backgroundColor: theme.colors.background, color: theme.colors.text },
                focusedInput === `price-${index}` && { borderWidth: 2, borderColor: theme.colors.primary }
              ]}
              placeholder="Price"
              placeholderTextColor={theme.colors.tabBarInactive}
              keyboardType="numeric"
              value={product.price}
              onChangeText={(value) => updateProduct(index, 'price', value)}
              onFocus={() => setFocusedInput(`price-${index}`)}
              onBlur={() => setFocusedInput(null)}
            />
          </View>
          
          <View style={styles.quantityContainer}>
            <TextInput
              style={[
                styles.quantityInput, 
                { backgroundColor: theme.colors.background, color: theme.colors.text },
                focusedInput === `quantity-${index}` && { borderWidth: 2, borderColor: theme.colors.primary }
              ]}
              placeholder="Qty"
              placeholderTextColor={theme.colors.tabBarInactive}
              keyboardType="numeric"
              value={product.quantity}
              onChangeText={(value) => updateProduct(index, 'quantity', value)}
              onFocus={() => setFocusedInput(`quantity-${index}`)}
              onBlur={() => setFocusedInput(null)}
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
            color={isBest ? "primary" : "text"} 
            style={styles.unitPriceValue}
            weight="semibold"
          >
            ${product.unitPrice.toFixed(2)} / {product.unit === 'kg' || product.unit === 'l' ? 
              (product.unit === 'kg' ? 'g' : 'ml') : 
              product.unit}
          </Typography>
        </View>
        
      </View>
    );

    return (
      <SwipableRow
        key={index}
        onDelete={products.length > 2 ? () => removeProduct(index) : undefined}
        disabled={products.length <= 2}
      >
        {cardContent}
      </SwipableRow>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomHeader
        title="Unit Calculator"
        leftAction={{
          icon: "chevron-left",
          onPress: () => navigation.goBack()
        }}
        rightAction={{
          icon: "history",
          onPress: () => navigation.navigate('SavedItems' as never)
        }}
      />

      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ 
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 100
        }}
      >
        {/* Editable Title Section */}
        <SectionTitle
          title={calculatorTitle}
          onTitleChange={setCalculatorTitle}
          editable={true}
          maxLength={50}
          actions={
            <>
              <Save
                data={{
                  products,
                  bestProductIndexes,
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
                  bestProductIndexes,
                  calculationType: 'unit_price',
                }}
                dataType="calculation"
                title="Unit Price Comparison"
                variant="icon"
                onShareSuccess={() => console.log('Copied/Shared successfully')}
              />
            </>
          }
        />

        {products.map(renderProduct)}
        
        <View style={styles.actionButtonsContainer}>
          <Button
            title="Add Product"
            variant="primary"
            icon="add"
            size="large"
            onPress={addProduct}
            style={styles.actionButton}
          />
          
          {products.some(p => p.price.trim() || p.quantity.trim() || p.name.trim()) && (
            <Button
              title="Clear All"
              variant="outline"
              icon="clear"
              size="large"
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
    </View>
  );
};

const styles = StyleSheet.create({
  productCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 0,
    borderWidth: 1,
    position: 'relative',
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
    fontSize: 18,
    borderWidth: 1,
    borderColor: 'transparent',
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
    fontSize: 18,
    borderWidth: 1,
    borderColor: 'transparent',
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
    fontSize: 18,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  unitButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 4,
    minWidth: 60,
    height: 48,
  },
  unitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  resultContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitPriceLabel: {
    fontSize: 18,
  },
  unitPriceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },


  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 8,
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
