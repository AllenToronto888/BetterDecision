import React, { useState } from 'react';
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
  const [title, setTitle] = useState('');
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        <TextInput
          style={[styles.titleInput, { color: theme.text }]}
          value={title}
          onChangeText={setTitle}
          placeholder="Comparison Title"
          placeholderTextColor={theme.tabBarInactive}
        />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.tableHeader}>
              <View style={[styles.criterionCell, { backgroundColor: theme.card }]}>
                <Text style={[styles.headerText, { color: theme.text }]}>Criteria</Text>
              </View>
              
              {options.map((option, index) => (
                <View 
                  key={option.id} 
                  style={[styles.optionHeaderCell, { backgroundColor: theme.card }]}
                >
                  <TextInput
                    style={[styles.optionInput, { color: theme.text }]}
                    value={option.name}
                    onChangeText={(text) => updateOption(option.id, text)}
                    placeholder={`Product ${index + 1}`}
                    placeholderTextColor={theme.tabBarInactive}
                  />
                  
                  {options.length > 1 && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => removeOption(option.id)}
                    >
                      <Icon name="close" size={16} color={theme.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              
              <TouchableOpacity
                style={[styles.addCell, { backgroundColor: theme.primary }]}
                onPress={addOption}
              >
                <Icon name="add" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            {criteria.map((criterion) => (
              <View key={criterion.id} style={styles.tableRow}>
                <View style={[styles.criterionCell, { backgroundColor: theme.card }]}>
                  <TextInput
                    style={[styles.criterionInput, { color: theme.text }]}
                    value={criterion.text}
                    onChangeText={(text) => updateCriterion(criterion.id, text)}
                    placeholder="Enter criterion"
                    placeholderTextColor={theme.tabBarInactive}
                  />
                  
                  {criteria.length > 1 && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => removeCriterion(criterion.id)}
                    >
                      <Icon name="close" size={16} color={theme.danger} />
                    </TouchableOpacity>
                  )}
                </View>
                
                {options.map((option) => (
                  <View
                    key={`${criterion.id}-${option.id}`}
                    style={[styles.comparisonCell, { backgroundColor: theme.card }]}
                  >
                    <TextInput
                      style={[styles.cellInput, { color: theme.text }]}
                      value={getCellText(criterion.id, option.id)}
                      onChangeText={(text) => updateCellText(criterion.id, option.id, text)}
                      placeholder="Enter details"
                      placeholderTextColor={theme.tabBarInactive}
                      multiline
                    />
                  </View>
                ))}
              </View>
            ))}
            
            <View style={styles.tableRow}>
              <TouchableOpacity
                style={[styles.addCriterionButton, { backgroundColor: theme.primary }]}
                onPress={addCriterion}
              >
                <Icon name="add" size={24} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add Criterion</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
          >
            <Icon name="save" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Save</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.secondary }]}
          >
            <Icon name="share" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
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
  titleInput: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  criterionCell: {
    width: 150,
    padding: 8,
    borderRadius: 4,
    marginRight: 4,
    justifyContent: 'center',
  },
  optionHeaderCell: {
    width: 150,
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
  tableRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  criterionInput: {},
  comparisonCell: {
    width: 150,
    minHeight: 60,
    borderRadius: 4,
    marginRight: 4,
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
    flex: 1,
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
