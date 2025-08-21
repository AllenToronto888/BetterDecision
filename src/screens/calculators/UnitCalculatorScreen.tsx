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
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

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

  const unitOptions = ['g', 'kg', 'ml', 'l', 'oz', 'lb', 'each'];

  useEffect(() => {
    calculateUnitPrices();
  }, [products]);

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
    
    setProducts(updatedProducts);
    
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
      { backgroundColor: theme.card, borderColor: theme.border },
    ];
    const cardStyle = isBest
      ? [...baseCardStyle, { borderColor: theme.success, borderWidth: 2 }]
      : baseCardStyle;

    return (
      <View key={index} style={cardStyle}>
        {isBest && (
          <View style={[styles.bestBadge, { backgroundColor: theme.success }]}>
            <Icon name="check" size={16} color="#FFFFFF" />
            <Text style={styles.bestBadgeText}>Best!</Text>
          </View>
        )}
        
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
            placeholder="Product name"
            placeholderTextColor={theme.tabBarInactive}
            value={product.name}
            onChangeText={(value) => updateProduct(index, 'name', value)}
          />
        </View>
        
        <View style={styles.row}>
          <View style={styles.priceContainer}>
            <Text style={[styles.currencySymbol, { color: theme.text }]}>$</Text>
            <TextInput
              style={[styles.priceInput, { backgroundColor: theme.background, color: theme.text }]}
              placeholder="Price"
              placeholderTextColor={theme.tabBarInactive}
              keyboardType="numeric"
              value={product.price}
              onChangeText={(value) => updateProduct(index, 'price', value)}
            />
          </View>
          
          <View style={styles.quantityContainer}>
            <TextInput
              style={[styles.quantityInput, { backgroundColor: theme.background, color: theme.text }]}
              placeholder="Qty"
              placeholderTextColor={theme.tabBarInactive}
              keyboardType="numeric"
              value={product.quantity}
              onChangeText={(value) => updateProduct(index, 'quantity', value)}
            />
            
            <TouchableOpacity
              style={[styles.unitButton, { backgroundColor: theme.primary }]}
              onPress={() => cycleUnit(index)}
            >
              <Text style={styles.unitButtonText}>{product.unit}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.resultContainer}>
          <Text style={[styles.unitPriceLabel, { color: theme.tabBarInactive }]}>
            Unit Price:
          </Text>
          <Text style={[styles.unitPriceValue, { color: isBest ? theme.success : theme.text }]}>
            ${product.unitPrice.toFixed(4)} / {product.unit === 'kg' || product.unit === 'l' ? 
              (product.unit === 'kg' ? 'g' : 'ml') : 
              product.unit}
          </Text>
        </View>
        
        {products.length > 2 && (
          <TouchableOpacity
            style={[styles.removeButton, { backgroundColor: theme.danger }]}
            onPress={() => removeProduct(index)}
          >
            <Icon name="delete" size={20} color="#FFFFFF" />
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
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        {products.map(renderProduct)}
        
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={addProduct}
        >
          <Icon name="add" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Product</Text>
        </TouchableOpacity>
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
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default UnitCalculatorScreen;
