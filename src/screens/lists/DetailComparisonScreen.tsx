import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { CustomHeader, Save, SectionTitle, Share, SwipableRow, useTheme } from '../../components';

interface Criterion {
  id: string;
  text: string;
}

interface Option {
  id: string;
  name: string;
}

interface ComparisonCell {
  criterionId: string;
  optionId: string;
  text: string;
}

const DetailComparisonScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [title, setTitle] = useState('Detail Comparison');
  const [criteria, setCriteria] = useState<Criterion[]>([
    { id: '1', text: 'Price' },
    { id: '2', text: 'Features' },
    { id: '3', text: 'Warranty' },
  ]);
  const [options, setOptions] = useState<Option[]>([
    { id: '1', name: 'Product A' },
    { id: '2', name: 'Product B' },
  ]);
  const [comparisonData, setComparisonData] = useState<ComparisonCell[]>([
    { criterionId: '1', optionId: '1', text: '$499' },
    { criterionId: '1', optionId: '2', text: '$599' },
    { criterionId: '2', optionId: '1', text: 'Basic' },
    { criterionId: '2', optionId: '2', text: 'Premium' },
    { criterionId: '3', optionId: '1', text: '1 year' },
    { criterionId: '3', optionId: '2', text: '2 years' },
  ]);
  const [rowHeights, setRowHeights] = useState<{[key: string]: number}>({});
  
  const addCriterion = () => {
    const newId = criteria.length > 0 
      ? (Math.max(...criteria.map(item => parseInt(item.id))) + 1).toString()
      : '1';
    
    const newCriterion = { id: newId, text: '' };
    setCriteria([...criteria, newCriterion]);
    
    // Add cells for the new criterion
    const newCells = options.map(option => ({
      criterionId: newId,
      optionId: option.id,
      text: '',
    }));
    
    setComparisonData([...comparisonData, ...newCells]);
  };
  
  const addOption = () => {
    const newId = options.length > 0 
      ? (Math.max(...options.map(item => parseInt(item.id))) + 1).toString()
      : '1';
    
    const newOption = { id: newId, name: `Product ${newId}` };
    setOptions([...options, newOption]);
    
    // Add cells for the new option
    const newCells = criteria.map(criterion => ({
      criterionId: criterion.id,
      optionId: newId,
      text: '',
    }));
    
    setComparisonData([...comparisonData, ...newCells]);
  };
  
  const updateCriterion = (id: string, text: string) => {
    const updatedCriteria = criteria.map(criterion => {
      if (criterion.id === id) {
        return { ...criterion, text };
      }
      return criterion;
    });
    
    setCriteria(updatedCriteria);
  };
  
  const updateOption = (id: string, name: string) => {
    const updatedOptions = options.map(option => {
      if (option.id === id) {
        return { ...option, name };
      }
      return option;
    });
    
    setOptions(updatedOptions);
  };
  
  const updateCellText = (criterionId: string, optionId: string, text: string) => {
    const updatedData = comparisonData.map(cell => {
      if (cell.criterionId === criterionId && cell.optionId === optionId) {
        return { ...cell, text };
      }
      return cell;
    });
    
    setComparisonData(updatedData);
  };
  
  const removeCriterion = (id: string) => {
    if (criteria.length > 1) {
      setCriteria(criteria.filter(criterion => criterion.id !== id));
      setComparisonData(comparisonData.filter(cell => cell.criterionId !== id));
    }
  };
  
  const removeOption = (id: string) => {
    if (options.length > 1) {
      setOptions(options.filter(option => option.id !== id));
      setComparisonData(comparisonData.filter(cell => cell.optionId !== id));
    }
  };
  
  const getCellText = (criterionId: string, optionId: string) => {
    const cell = comparisonData.find(
      cell => cell.criterionId === criterionId && cell.optionId === optionId
    );
    
    return cell ? cell.text : '';
  };

  const clearAllCriteria = () => {
    if (criteria.length > 0) {
      const firstCriterion = { ...criteria[0], text: '' };
      setCriteria([firstCriterion]);
      const newCells = options.map(option => ({
        criterionId: firstCriterion.id,
        optionId: option.id,
        text: '',
      }));
      setComparisonData(newCells);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomHeader
        title="Detail Comparison"
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
            title={title}
            onTitleChange={setTitle}
            editable={true}
            maxLength={100}
            actions={
              <>
                <Save
                  data={{
                    title,
                    criteria,
                    options,
                    comparisonData,
                    comparisonType: 'detail_comparison',
                  }}
                  dataType="comparison"
                  variant="icon"
                  showInput={false}
                  onSaveSuccess={(name: string) => console.log('Saved as:', name)}
                />
                <Share
                  data={{
                    title,
                    criteria,
                    options,
                    comparisonData,
                  }}
                  dataType="comparison"
                  title="Detail Comparison Result"
                  variant="icon"
                  onShareSuccess={() => console.log('Shared successfully')}
                />
              </>
            }
          />
        
          <View style={styles.tableContainer}>
            {/* Fixed Criteria Column */}
            <View style={styles.criteriaColumn}>
              <View style={[styles.criterionHeaderCell, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.headerText, { color: theme.colors.text }]}>Criteria</Text>
              </View>
            
            {criteria.map((criterion) => (
              <View
                key={criterion.id}
                onLayout={(event) => {
                  const { height } = event.nativeEvent.layout;
                  setRowHeights(prev => ({...prev, [criterion.id]: height}));
                }}
              >
                <SwipableRow
                  key={criterion.id}
                  onDelete={criteria.length > 1 ? () => removeCriterion(criterion.id) : undefined}
                  leftActions={criteria.length > 1 ? [{
                    icon: 'delete',
                    color: theme.colors.danger,
                    onPress: () => removeCriterion(criterion.id),
                  }] : undefined}
                  style={styles.swipeableRowOverride}
                  contentStyle={styles.swipeableContentOverride}
                >
                  <View style={[styles.criterionCell, { backgroundColor: theme.colors.card }]}>
                    <TextInput
                      style={[styles.criterionInput, { color: theme.colors.text }]}
                      value={criterion.text}
                      onChangeText={(text) => updateCriterion(criterion.id, text)}
                      placeholder="Enter criterion"
                      placeholderTextColor={theme.colors.tabBarInactive}
                      multiline={true}
                      textAlignVertical="top"
                    />
                  </View>
                </SwipableRow>
              </View>
            ))}
            
              <View style={styles.criterionCell}>
                <TouchableOpacity
                  style={[styles.clearAllButton, { borderColor: theme.colors.primary }]}
                  onPress={clearAllCriteria}
                >
                  <MaterialIcons name="clear" size={20} color={theme.colors.primary} />
                  <Text style={[styles.clearAllButtonText, { color: theme.colors.primary }]}>Clear All</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScrollView}>
            <View>
              <View style={styles.optionsHeader}>
                {options.map((option, index) => (
                  <View
                    key={option.id}
                    style={[styles.optionHeaderCell, { backgroundColor: theme.colors.card }]}
                  >
                    <TextInput
                      style={[styles.optionInput, { color: theme.colors.text }]}
                      value={option.name}
                      onChangeText={(text) => updateOption(option.id, text)}
                      placeholder={`Product ${index + 1}`}
                      placeholderTextColor={theme.colors.tabBarInactive}
                    />
                    {options.length > 1 && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => removeOption(option.id)}
                      >
                        <MaterialIcons name="close" size={16} color={theme.colors.danger} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                <TouchableOpacity
                  style={[styles.addCell, { backgroundColor: theme.colors.primary }]}
                  onPress={addOption}
                >
                  <MaterialIcons name="add" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              {criteria.map((criterion) => (
                <View
                  key={criterion.id}
                  style={[
                    styles.optionsRow,
                    { height: rowHeights[criterion.id] || 48 }
                  ]}
                >
                  {options.map((option) => (
                    <View
                      key={`${criterion.id}-${option.id}`}
                      style={[styles.comparisonCell, { backgroundColor: theme.colors.card }]}
                    >
                      <TextInput
                        style={[styles.cellInput, { color: theme.colors.text }]}
                        value={getCellText(criterion.id, option.id)}
                        onChangeText={(text) => updateCellText(criterion.id, option.id, text)}
                        placeholder="Enter details"
                        placeholderTextColor={theme.colors.tabBarInactive}
                        multiline
                      />
                    </View>
                  ))}
                </View>
              ))}
                <TouchableOpacity
                  style={[styles.addCriterionButton, { backgroundColor: theme.colors.primary }]}
                  onPress={addCriterion}
                >
                  <MaterialIcons name="add" size={24} color="#FFFFFF" />
                  <Text style={styles.addButtonText}>Add Criterion</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  tableContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  criteriaColumn: {
    width: 150,
    marginRight: 8,
  },
  optionsScrollView: {
    flex: 1,
  },
  criterionHeaderCell: {
    height: 48,
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
    justifyContent: 'center',
  },
  criterionCell: {
    minHeight: 48,
    padding: 8,
    borderRadius: 4,
    justifyContent: 'center',
    flex: 1,
  },
  optionsHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  optionHeaderCell: {
    width: 140,
    height: 48,
    padding: 8,
    borderRadius: 4,
    marginRight: 4,
    justifyContent: 'center',
  },
  headerText: {
    fontWeight: 'bold',
  },
  optionInput: {
    fontWeight: 'bold',
  },
  addCell: {
    width: 40,
    height: 40,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
  },
  criterionInput: {
    color: 'inherit',
  },
  comparisonCell: {
    width: 140,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 8,
    padding: 8,
  },
  cellInput: {
    flex: 1,
    textAlignVertical: 'top',
  },
  addCriterionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 2,
  },
  swipeableRowOverride: {
    marginBottom: 8,
    borderRadius: 4,
  },
  swipeableContentOverride: {
    borderRadius: 4,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
    borderWidth: 1,
    width: '100%',
  },
  clearAllButtonText: {
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 4,
    minWidth: 120,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default DetailComparisonScreen;
