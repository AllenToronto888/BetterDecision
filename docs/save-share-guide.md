# Save & Share Components Guide

## Save Component

The Save component allows users to save their calculations, comparisons, and decisions locally for later use.

### Features
- **Local Storage**: Uses AsyncStorage for persistent data storage
- **Duplicate Detection**: Prevents saving items with duplicate names
- **Auto-naming**: Generates default names with timestamps
- **Validation**: Ensures valid data before saving
- **Success/Error Callbacks**: Provides feedback on save operations

### Usage

#### Basic Save Button
```typescript
import { Save } from '../../components';

<Save
  data={calculationData}
  dataType="calculation"
  defaultName="My Calculation"
  onSaveSuccess={(name) => console.log('Saved:', name)}
  onSaveError={(error) => console.error('Save failed:', error)}
/>
```

#### Icon Variant
```typescript
<Save
  data={data}
  dataType="calculation"
  variant="icon"
  showInput={false}  // Quick save without naming dialog
/>
```

#### With Custom Naming
```typescript
<Save
  data={comparisonData}
  dataType="comparison"
  showInput={true}    // Shows naming dialog
  defaultName="Product Comparison"
/>
```

### Props
- `data`: The data to save (any format)
- `dataType`: 'calculation' | 'comparison' | 'decision' | 'custom'
- `defaultName?`: Default name for the saved item
- `variant?`: 'button' | 'icon' (default: 'button')
- `showInput?`: Whether to show naming dialog (default: true)
- `onSaveSuccess?`: Callback when save succeeds
- `onSaveError?`: Callback when save fails

### Managing Saved Items

```typescript
import { useSavedItems } from '../../components';

const { savedItems, loadSavedItems, deleteSavedItem, getSavedItem } = useSavedItems('calculation');

// Load items
useEffect(() => {
  loadSavedItems();
}, []);

// Delete an item
const handleDelete = async (id: string) => {
  try {
    await deleteSavedItem(id);
    Alert.alert('Deleted', 'Item removed successfully');
  } catch (error) {
    Alert.alert('Error', 'Failed to delete item');
  }
};
```

## Share Component

The Share component enables users to share their results via native sharing options (messages, email, social media, etc.).

### Features
- **Smart Formatting**: Automatically formats data based on type
- **Native Sharing**: Uses React Native's built-in Share API
- **Multiple Variants**: Button or icon presentation
- **Copy to Clipboard**: Alternative sharing method
- **App Promotion**: Optional branding in shared content
- **Custom Messages**: Override default formatting

### Usage

#### Basic Share Button
```typescript
import { Share } from '../../components';

<Share
  data={calculationResults}
  dataType="calculation"
  title="My Calculation Results"
  onShareSuccess={() => console.log('Shared!')}
/>
```

#### Icon Variant
```typescript
<Share
  data={data}
  dataType="comparison"
  variant="icon"
  includeAppPromo={true}
/>
```

#### Custom Message
```typescript
<Share
  data={prosConsData}
  dataType="decision"
  customMessage="Here's my decision analysis..."
  title="Decision Results"
/>
```

### Props
- `data`: The data to share
- `dataType`: 'calculation' | 'comparison' | 'decision' | 'custom'
- `title?`: Title for the shared content
- `customMessage?`: Override default formatting
- `variant?`: 'button' | 'icon' (default: 'button')
- `includeAppPromo?`: Add app branding (default: true)
- `onShareSuccess?`: Callback when sharing succeeds
- `onShareError?`: Callback when sharing fails

### Quick Share Utility

```typescript
import { quickShare } from '../../components';

const handleQuickShare = () => {
  quickShare(
    'My Results',
    'Check out these calculation results!',
    {
      includeAppPromo: true,
      onSuccess: () => console.log('Shared'),
      onError: (error) => console.error(error),
    }
  );
};
```

## Data Formatting

The Share component automatically formats different data types:

### Calculation Data
```typescript
// Unit Calculator
{
  products: [
    { name: 'Product A', price: '10', quantity: '500', unit: 'g', unitPrice: 0.02 }
  ],
  bestProductIndex: 0
}

// Formatted Output:
"🧮 Unit Price Comparison:
⭐ Product A
   Price: $10 for 500g
   Unit Price: $0.0200 per unit"
```

### Comparison Data
```typescript
// Pros & Cons
{
  title: 'Should I take this job?',
  pros: [{ text: 'Good salary', weight: 8 }],
  cons: [{ text: 'Long commute', weight: 4 }],
  totalProsWeight: 8,
  totalConsWeight: 4
}

// Formatted Output:
"⚖️ Should I take this job?:
📈 PROS (Score: 8):
• Good salary (Weight: 8)
📉 CONS (Score: 4):
• Long commute (Weight: 4)
🏆 Result: PROS WIN!"
```

## Integration Examples

### Calculator Screens
```typescript
// Show Save & Share when user has entered data
{hasValidData && (
  <View style={styles.actionButtons}>
    <Save
      data={calculationData}
      dataType="calculation"
      defaultName={`Calculation - ${new Date().toLocaleDateString()}`}
    />
    <Share
      data={calculationData}
      dataType="calculation"
      title="Calculation Results"
    />
  </View>
)}
```

### Comparison Screens
```typescript
// Add to header as icons
<Header
  title="Pros & Cons"
  rightActions={[
    {
      icon: 'save',
      onPress: () => saveData()
    },
    {
      icon: 'share',
      onPress: () => shareResults()
    }
  ]}
/>
```

### Decision Screens
```typescript
// Show after decision is made
{result && (
  <View style={styles.resultActions}>
    <Save
      data={{ result, options, timestamp: Date.now() }}
      dataType="decision"
      variant="icon"
    />
    <Share
      data={{ result }}
      dataType="decision"
      title="Decision Made!"
      variant="icon"
    />
  </View>
)}
```

## Storage Structure

Saved items are stored with this structure:
```typescript
interface SavedItem {
  id: string;              // Unique identifier
  name: string;           // User-provided name
  data: any;              // The actual saved data
  type: string;           // Data type category
  createdAt: string;      // ISO timestamp
  updatedAt: string;      // ISO timestamp
}
```

Storage keys:
- `saved_calculations` - Calculator results
- `saved_comparisons` - Comparison results  
- `saved_decisions` - Decision results
- `saved_customs` - Custom data

## Best Practices

1. **Show conditionally**: Only show Save/Share when there's meaningful data
2. **Provide feedback**: Use callbacks to show success/error messages
3. **Smart defaults**: Generate helpful default names
4. **Icon placement**: Use icon variants in headers/toolbars
5. **Button placement**: Use button variants in content areas
6. **Data validation**: Ensure data is complete before allowing save/share

## Error Handling

Both components include comprehensive error handling:
- Invalid data detection
- Storage quota exceeded
- Network issues (sharing)
- User cancellation
- Permission errors

Always implement the error callbacks to provide user feedback.
