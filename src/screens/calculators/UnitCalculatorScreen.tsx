import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { AdMobBanner, Button, CustomHeader, Save, SectionTitle, Share, SwipableRow, Typography, useAutoSave, useTheme } from '../../components';
import { useI18n } from '../../i18n';

interface Product {
  name: string;
  price: string;
  quantity: string;
  unit: string;
  unitPrice: number;
}

const UnitCalculatorScreen = () => {
  const { theme } = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation();
  const [products, setProducts] = useState<Product[]>([
    { name: '', price: '', quantity: '', unit: 'g', unitPrice: 0 },
    { name: '', price: '', quantity: '', unit: 'g', unitPrice: 0 },
  ]);
  const [bestProductIndexes, setBestProductIndexes] = useState<number[]>([]);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'pending' | 'saving' | 'saved' | 'error'>('idle');
  const [calculatorTitle, setCalculatorTitle] = useState(t('unitPrice'));
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Update calculator title when language changes
  useEffect(() => {
    setCalculatorTitle(t('unitPrice'));
  }, [t]);

  // Auto-save functionality
  useAutoSave({
    data: {
      products,
      bestProductIndexes,
      calculationType: 'unit_price',
      title: calculatorTitle,
    },
    dataType: 'calculation',
    enabled: products.some(p => 
      p.price.trim() || 
      p.quantity.trim() ||
      p.name.trim()
    ),
    delay: 5000, // Auto-save after 5 seconds of inactivity
    autoSavePrefix: t('autoSaved'),
    onSave: (name) => {
      console.log('🟢 AUTO-SAVE SUCCESS:', name);
      setAutoSaveStatus('saved');
      // Force status to idle after delay
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    },
    onError: (error) => {
      console.error('🔴 AUTO-SAVE ERROR:', error);
      setAutoSaveStatus('error');
      // Force status back to idle after error
      setTimeout(() => setAutoSaveStatus('idle'), 3000);
    },
    onStatusChange: (status) => {
      console.log('🔄 AUTO-SAVE STATUS:', status);
      setAutoSaveStatus(status);
    },
  });

  // Unit categories with original values and translated labels
  const weightUnits = ['g', 'kg', 'oz', 'lb'];
  const volumeUnits = ['ml', 'l'];
  const countUnits = ['each'];
  
  // Unit translation mapping
  const getUnitLabel = (unit: string) => {
    const unitMap: Record<string, string> = {
      'g': t('gram'),
      'kg': t('kilogram'),
      'oz': t('ounce'),
      'lb': t('pound'),
      'ml': t('milliliter'),
      'l': t('liter'),
      'each': t('each')
    };
    return unitMap[unit] || unit;
  };
  
  // Dynamic unit filtering - Product A shows all units, Product B+ are filtered
  const getAvailableUnits = (productIndex: number) => {
    // Product A (index 0) can always choose any unit
    if (productIndex === 0) {
      return ['g', 'kg', 'ml', 'l', 'oz', 'lb', 'each'];
    }
    
    // For Product B+, filter based on Product A's unit category
    const firstProduct = products[0];
    if (!firstProduct || !firstProduct.unit || firstProduct.unit.trim() === '') {
      return ['g', 'kg', 'ml', 'l', 'oz', 'lb', 'each']; // Show all if Product A has no unit yet
    }
    
    if (weightUnits.includes(firstProduct.unit)) {
      return weightUnits;
    } else if (volumeUnits.includes(firstProduct.unit)) {
      return volumeUnits;
    } else if (countUnits.includes(firstProduct.unit)) {
      return countUnits;
    }
    
    return ['g', 'kg', 'ml', 'l', 'oz', 'lb', 'each']; // Fallback
  };

  // Removed problematic timeout that was interfering with auto-save



  const calculateUnitPrices = useCallback(() => {
    const updatedProducts = products.map((product) => {
      const price = parseFloat(product.price) || 0;
      const quantity = parseFloat(product.quantity) || 1;
      
      // Calculate unit price in the original unit (for display)
      const unitPrice = quantity > 0 ? price / quantity : 0;
      return { ...product, unitPrice };
    });
    
    // Only update if there are actual changes to avoid infinite loop
    const hasChanges = updatedProducts.some((product, index) => 
      product.unitPrice !== products[index].unitPrice
    );
    
    if (hasChanges) {
      setProducts(updatedProducts);
    }
    
    // Check if we have AT LEAST 2 products with valid unit prices (price > 0 and quantity > 0)
    const validProducts = updatedProducts.filter((product) => {
      const price = parseFloat(product.price) || 0;
      const quantity = parseFloat(product.quantity) || 0;
      return price > 0 && quantity > 0;
    });
    
    // Find the best products if we have at least 2 valid products
    if (validProducts.length >= 2) {
      let lowestStandardizedPrice = Infinity;
      
      // First pass: find the lowest standardized unit price for comparison (only valid products)
      validProducts.forEach((product) => {
        const price = parseFloat(product.price) || 0;
        const quantity = parseFloat(product.quantity) || 1;
        let standardizedQuantity = quantity;
        
        // Convert to standard units (g or ml) for fair comparison
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
        
        const standardizedPrice = standardizedQuantity > 0 ? price / standardizedQuantity : 0;
        if (standardizedPrice > 0 && standardizedPrice < lowestStandardizedPrice) {
          lowestStandardizedPrice = standardizedPrice;
        }
      });
      
      // Second pass: find all products with the lowest standardized price (check all products, but only highlight valid ones)
      const bestIndexes: number[] = [];
      updatedProducts.forEach((product, index) => {
        const price = parseFloat(product.price) || 0;
        const quantity = parseFloat(product.quantity) || 1;
        
        // Only consider products with valid data
        if (price > 0 && quantity > 0) {
          let standardizedQuantity = quantity;
          
          // Convert to standard units (g or ml) for fair comparison
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
          
          const standardizedPrice = standardizedQuantity > 0 ? price / standardizedQuantity : 0;
          if (standardizedPrice > 0 && standardizedPrice === lowestStandardizedPrice) {
            bestIndexes.push(index);
          }
        }
      });
      
      setBestProductIndexes(bestIndexes);
    } else {
      // Clear the best products if not all products have valid prices
      setBestProductIndexes([]);
    }
  }, [products, setProducts, setBestProductIndexes]);

  useEffect(() => {
    calculateUnitPrices();
  }, [calculateUnitPrices]);

  const updateProduct = (index: number, field: keyof Product, value: string) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setProducts(updatedProducts);
  };

  const cycleUnit = (index: number) => {
    const availableUnits = getAvailableUnits(index);
    const currentUnitIndex = availableUnits.indexOf(products[index].unit);
    const nextUnitIndex = (currentUnitIndex + 1) % availableUnits.length;
    updateProduct(index, 'unit', availableUnits[nextUnitIndex]);
  };

  const addProduct = () => {
    const newProductIndex = products.length;
    const availableUnits = getAvailableUnits(newProductIndex);
    const defaultUnit = availableUnits[0]; // Use first available unit in the category
    setProducts([...products, { name: '', price: '', quantity: '', unit: defaultUnit, unitPrice: 0 }]);
  };

  // Removed loadHistoryData function as HistoryButton is no longer used in the component

  const clearAllProducts = () => {
    setProducts([
      { name: '', price: '', quantity: '', unit: 'g', unitPrice: 0 },
      { name: '', price: '', quantity: '', unit: 'g', unitPrice: 0 },
    ]);
    setBestProductIndexes([]);
    // Reset title back to default
    setCalculatorTitle(t('unitPrice'));
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
            placeholder={`${t('item')} ${index + 1}`}
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
              placeholder={t('price')}
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
              placeholder={t('quantity')}
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
              <Typography variant="button" style={styles.unitButtonText}>{getUnitLabel(product.unit)}</Typography>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.resultContainer}>
          <View style={styles.unitPriceLabelRow}>
            <Typography variant="body2" color="textSecondary" style={styles.unitPriceLabel}>
              {t('unitPrice')}:
            </Typography>
            {isBest && bestProductIndexes.length === 1 && (
              <View style={[styles.bestValueBadge, { backgroundColor: theme.colors.primary }]}>
                <Typography variant="caption" style={styles.bestValueText}>
                  {t('bestValue')}
                </Typography>
              </View>
            )}
            {isBest && bestProductIndexes.length > 1 && (
              <View style={[styles.sameBadge, { backgroundColor: theme.colors.warning || '#FF9500' }]}>
                <Typography variant="caption" style={styles.sameText}>
                  {t('same')}
                </Typography>
              </View>
            )}
          </View>
          <Typography 
            variant="body1" 
            color={isBest ? "primary" : "text"} 
            style={styles.unitPriceValue}
            weight="semibold"
          >
            ${product.unitPrice.toFixed(4)} / {getUnitLabel(product.unit)}
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
        title={t('unitCalculator')}
        leftAction={{
          icon: "chevron-left",
          onPress: () => navigation.goBack()
        }}
        rightAction={{
          icon: "history",
          onPress: () => navigation.navigate('UnitCalculatorSavedItems' as never)
        }}
      />

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={{ flex: 1, backgroundColor: theme.colors.background }}
          contentContainerStyle={{ 
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 300
          }}
          keyboardDismissMode="on-drag"
      >
        {/* Editable Title Section */}
        <SectionTitle
          title={calculatorTitle}
          onTitleChange={setCalculatorTitle}
          editable={true}
          maxLength={50}
          defaultTitles={[t('unitPrice')]}
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
                title={t('unitPriceComparison')}
                variant="icon"
                onShareSuccess={() => console.log('Copied/Shared successfully')}
              />
            </>
          }
        />

        {products.map(renderProduct)}
        
        <View style={styles.actionButtonsContainer}>
          <Button
            title={t('addProduct')}
            variant="primary"
            icon="add"
            size="large"
            onPress={addProduct}
            style={styles.actionButton}
          />
          
          {products.some(p => p.price.trim() || p.quantity.trim() || p.name.trim()) && (
            <Button
              title={t('clearAll')}
              variant="outline"
              icon="clear"
              size="large"
              onPress={clearAllProducts}
              style={styles.actionButton}
            />
          )}
        </View>

        {/* AdMob Banner Ad */}
        <AdMobBanner style={styles.adContainer} />

      </ScrollView>
      </KeyboardAvoidingView>
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
    flex: 1.3, // Increased from 1 to 1.3 to give quantity more space
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
  unitPriceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unitPriceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bestValueBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestValueText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  sameBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sameText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },


  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 8,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  autoSaveStatus: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  autoSaveText: {
    fontStyle: 'italic',
  },
  adContainer: {
    alignItems: 'center',
    marginVertical: 8, // 8px + AdMobBanner's built-in 8px = 16px total
    paddingHorizontal: 16,
  },
});

export default UnitCalculatorScreen;
