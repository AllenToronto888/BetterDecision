import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
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
import { CustomHeader, Save, SectionTitle, Share, SwipableRow, useAutoSave, useTheme } from '../../components';
import { useI18n } from '../../i18n';

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
  status: 'yes' | 'no' | 'partial';
}

const QuickComparisonScreen = () => {
  const { theme } = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation();
  const [title, setTitle] = useState(t('quickComparison'));
  const [criteria, setCriteria] = useState<Criterion[]>([
    { id: '1', text: `${t('criteria')} 1` },
    { id: '2', text: `${t('criteria')} 2` },
  ]);
  const [options, setOptions] = useState<Option[]>([
    { id: '1', name: `${t('option')} 1` },
    { id: '2', name: `${t('option')} 2` },
  ]);
  const [notes, setNotes] = useState('');
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'pending' | 'saving' | 'saved' | 'error'>('idle');
  const [comparisonData, setComparisonData] = useState<ComparisonCell[]>([
    { criterionId: '1', optionId: '1', status: 'yes' },
    { criterionId: '1', optionId: '2', status: 'no' },
    { criterionId: '2', optionId: '1', status: 'yes' },
    { criterionId: '2', optionId: '2', status: 'partial' },
  ]);
  const [rowHeights, setRowHeights] = useState<{[key: string]: number}>({});

  // Auto-save data with processed criteria/options
  const autoSaveData = {
    criteria: criteria.map(c => ({
      ...c,
      text: c.text.trim() || `${t('criteria')} ${c.id}`
    })),
    options: options.map(o => ({
      ...o,
      name: o.name.trim() || `${t('option')} ${o.id}`
    })),
    comparisonData,
    notes,
    title,
  };

  // Auto-save functionality
  useAutoSave({
    data: autoSaveData,
    dataType: 'quick_comparison',
    enabled: Boolean(
      criteria.some(criterion => criterion.text.trim()) ||
      options.some(option => option.name.trim()) ||
      notes.trim()
    ),
    delay: 5000,
    autoSavePrefix: t('autoSaved'),
    onSave: (name) => {
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    },
    onError: (error) => {
      console.error('Auto-save error:', error);
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus('idle'), 3000);
    },
    onStatusChange: (status) => {
      setAutoSaveStatus(status);
    },
  });
  
  // Update translations when language changes
  useEffect(() => {
    // Only reset title if it's currently a default/translated title
    setTitle(prevTitle => {
      // If previous title was a default title in any language, update it
      const defaultTitles = [
        'Quick Comparison', 'Comparación Rápida', 'Comparaison Rapide', 
        '快速比较', '快速比較', 'クイック比較'
      ];
      return defaultTitles.includes(prevTitle) ? t('quickComparison') : prevTitle;
    });
    setCriteria(prevCriteria => 
      prevCriteria.map((criterion, index) => ({
        ...criterion,
        text: criterion.text.startsWith('Criteria') || 
              criterion.text.startsWith('标准') || 
              criterion.text.startsWith('標準') || 
              criterion.text.startsWith('Critères') || 
              criterion.text.startsWith('条件') || 
              criterion.text.includes('Criteria') ? 
              `${t('criteria')} ${index + 1}` : criterion.text
      }))
    );
    setOptions(prevOptions => 
      prevOptions.map((option, index) => ({
        ...option,
        name: option.name.startsWith('Option') || 
              option.name.startsWith('选项') || 
              option.name.startsWith('選項') || 
              option.name.startsWith('Option') || 
              option.name.startsWith('オプション') || 
              option.name.includes('Option') ? 
              `${t('option')} ${index + 1}` : option.name
      }))
    );
  }, [t]);
  
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
      status: 'no' as 'yes' | 'no' | 'partial',
    }));
    
    setComparisonData([...comparisonData, ...newCells]);
  };
  
  const addOption = () => {
    const newId = options.length > 0 
      ? (Math.max(...options.map(item => parseInt(item.id))) + 1).toString()
      : '1';
    
    const newOption = { id: newId, name: `${t('option')} ${newId}` };
    setOptions([...options, newOption]);
    
    // Add cells for the new option
    const newCells = criteria.map(criterion => ({
      criterionId: criterion.id,
      optionId: newId,
      status: 'no' as 'yes' | 'no' | 'partial',
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

  const clearAllCriteria = () => {
    if (criteria.length > 0) {
      // Keep only the first criterion and clear its text
      const firstCriterion = { ...criteria[0], text: '' };
      setCriteria([firstCriterion]);
      
      // Remove all comparison data and create new cells for the first criterion
      const newCells = options.map(option => ({
        criterionId: firstCriterion.id,
        optionId: option.id,
        status: 'no' as 'yes' | 'no' | 'partial',
      }));
      
      setComparisonData(newCells);
      setNotes('');
      setNotesExpanded(false);
      // Reset title back to default
      setTitle(t('quickComparison'));
    }
  };
  
  const toggleCellStatus = (criterionId: string, optionId: string) => {
    const cell = comparisonData.find(
      cell => cell.criterionId === criterionId && cell.optionId === optionId
    );
    
    if (cell) {
      let newStatus: 'yes' | 'no' | 'partial';
      
      switch (cell.status) {
        case 'no':
          newStatus = 'partial';
          break;
        case 'partial':
          newStatus = 'yes';
          break;
        case 'yes':
          newStatus = 'no';
          break;
        default:
          newStatus = 'no';
      }
      
      const updatedData = comparisonData.map(cell => {
        if (cell.criterionId === criterionId && cell.optionId === optionId) {
          return { ...cell, status: newStatus };
        }
        return cell;
      });
      
      setComparisonData(updatedData);
    }
  };
  
  const getCellStatus = (criterionId: string, optionId: string) => {
    const cell = comparisonData.find(
      cell => cell.criterionId === criterionId && cell.optionId === optionId
    );
    
    return cell ? cell.status : 'no';
  };
  
  const getCellIcon = (status: 'yes' | 'no' | 'partial') => {
    switch (status) {
      case 'yes':
        return <MaterialIcons name="check-circle" size={24} color="#4CAF50" />;
      case 'no':
        return <MaterialIcons name="cancel" size={24} color="#F44336" />;
      case 'partial':
        return <MaterialIcons name="remove-circle" size={24} color="#FFC107" />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomHeader
        title={t('quickComparison')}
        leftAction={{
          icon: "chevron-left",
          onPress: () => navigation.goBack()
        }}
        rightAction={{
          icon: "history",
          onPress: () => navigation.navigate('QuickComparisonSavedItems' as never)
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={[styles.container, { backgroundColor: theme.colors.background }]}
          contentContainerStyle={styles.contentContainer}
          automaticallyAdjustKeyboardInsets={true}
          keyboardDismissMode="on-drag"
        >
          <SectionTitle
            title={title}
            onTitleChange={setTitle}
            editable={true}
            maxLength={100}
            defaultTitles={[t('quickComparison')]}
            actions={
              <>
                <Save
                  data={{
                    title,
                    criteria: criteria.map(c => ({
                      ...c,
                      text: c.text.trim() || `${t('criteria')} ${c.id}`
                    })),
                    options: options.map(o => ({
                      ...o,
                      name: o.name.trim() || `${t('option')} ${o.id}`
                    })),
                    comparisonData,
                    notes,
                    comparisonType: 'quick_comparison',
                  }}
                  dataType="quick_comparison"
                  variant="icon"
                  showInput={false}
                  onSaveSuccess={(name: string) => console.log('Saved as:', name)}
                />
                <Share
                  data={{
                    title,
                    criteria,
                    options,
                    cells: comparisonData,
                    notes,
                  }}
                  dataType="quick_comparison"
                  title={t('quickComparisonResult')}
                  variant="icon"
                  onShareSuccess={() => console.log('Shared successfully')}
                />
              </>
            }
          />
        
        <View style={styles.tableContainer}>
          {/* Fixed Criteria Column */}
          <View style={styles.criteriaColumn}>
            <View 
              style={[styles.criterionHeaderCell, { backgroundColor: theme.colors.card }]}

            >
              <Text style={[styles.headerText, { color: theme.colors.text }]}>{t('criteria')}</Text>
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
                  <View style={[
                    styles.criterionCell, 
                    { 
                      backgroundColor: theme.colors.card,
                      borderColor: focusedInput === `criterion-${criterion.id}` ? theme.colors.primary : theme.colors.border,
                      borderWidth: focusedInput === `criterion-${criterion.id}` ? 2 : 1
                    }
                  ]}>
                    <TextInput
                      style={[
                        styles.criterionInput, 
                        { color: theme.colors.text }
                      ]}
                      value={criterion.text.includes(t('criteria')) ? '' : criterion.text}
                      placeholder={criterion.text.includes(t('criteria')) ? criterion.text : t('enterCriterion')}
                      onChangeText={(text) => updateCriterion(criterion.id, text)}
                      placeholderTextColor={theme.colors.tabBarInactive}
                      multiline={true}
                      textAlignVertical="top"
                      onFocus={() => {
                        setFocusedInput(`criterion-${criterion.id}`);
                      }}
                      onBlur={() => {
                        setFocusedInput(null);
                        // Revert to default if empty
                        if (criterion.text.trim() === '') {
                          updateCriterion(criterion.id, `${t('criteria')} ${parseInt(criterion.id)}`);
                        }
                      }}
                    />
                  </View>
                </SwipableRow>
              </View>
            ))}
            
            <View style={styles.clearAllContainer}>
              <TouchableOpacity
                style={[styles.clearAllButton, { borderColor: theme.colors.primary }]}
                onPress={clearAllCriteria}
              >
                <MaterialIcons name="delete-sweep" size={20} color={theme.colors.primary} />
                <Text style={[styles.clearAllButtonText, { color: theme.colors.primary }]}>{t('clearAll')}</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Scrollable Options Column */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScrollView}>
            <View>
              <View style={styles.optionsHeader}>
                {options.map((option, index) => (
                  <View 
                    key={option.id} 
                    style={[
                      styles.optionHeaderCell, 
                      { 
                        backgroundColor: theme.colors.card,
                        borderColor: focusedInput === `option-${option.id}` ? theme.colors.primary : theme.colors.border,
                        borderWidth: focusedInput === `option-${option.id}` ? 2 : 1
                      }
                    ]}

                  >
                    <TextInput
                      style={[
                        styles.optionInput, 
                        { color: theme.colors.text }
                      ]}
                      value={option.name.includes(t('option')) ? '' : option.name}
                      placeholder={option.name.includes(t('option')) ? option.name : `${t('option')} ${index + 1}`}
                      onChangeText={(text) => updateOption(option.id, text)}
                      placeholderTextColor={theme.colors.tabBarInactive}
                      onFocus={() => {
                        setFocusedInput(`option-${option.id}`);
                      }}
                      onBlur={() => {
                        setFocusedInput(null);
                        // Revert to default if empty
                        if (option.name.trim() === '') {
                          updateOption(option.id, `${t('option')} ${parseInt(option.id)}`);
                        }
                      }}
                      multiline={true}
                      textAlignVertical="top"
                      scrollEnabled={true}
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
                  <MaterialIcons name="add" size={20} color="#FFFFFF" />
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
                  {options.map((option, optionIndex) => (
                    <TouchableOpacity
                      key={`${criterion.id}-${option.id}`}
                      style={[styles.comparisonCell, { backgroundColor: theme.colors.card }]}
                      onPress={() => toggleCellStatus(criterion.id, option.id)}

                    >
                      {getCellIcon(getCellStatus(criterion.id, option.id))}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
              
              <TouchableOpacity
                style={[styles.addCriterionButton, { backgroundColor: theme.colors.primary }]}
                onPress={addCriterion}
              >
                <MaterialIcons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>{t('addCriterion')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Notes Section */}
        <View style={[styles.notesSection, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <TouchableOpacity
            style={styles.notesHeader}
            onPress={() => setNotesExpanded(!notesExpanded)}
          >
            <View style={styles.notesHeaderLeft}>
              <MaterialIcons name="note" size={20} color={theme.colors.primary} />
              <Text style={[styles.notesTitle, { color: theme.colors.text }]}>{t('notes')}</Text>
              {notes.trim() && !notesExpanded && (
                <View style={[styles.notesBadge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.notesBadgeText}>•</Text>
                </View>
              )}
            </View>
            <MaterialIcons
              name={notesExpanded ? "expand-less" : "expand-more"}
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          
          {notesExpanded && (
            <View style={styles.notesContent}>
              <TextInput
                style={[
                  styles.notesInput, 
                  { 
                    backgroundColor: theme.colors.background, 
                    color: theme.colors.text,
                    borderColor: focusedInput === 'notes' ? theme.colors.primary : theme.colors.border,
                    borderWidth: focusedInput === 'notes' ? 2 : 1
                  }
                ]}
                value={notes}
                onChangeText={setNotes}
                placeholder={t('addNotesAboutComparison')}
                placeholderTextColor={theme.colors.tabBarInactive}
                multiline
                textAlignVertical="top"
                onFocus={() => setFocusedInput('notes')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          )}
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
    paddingBottom: 300,
  },
  tableContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  criteriaColumn: {
    width: 150,
    marginRight: 8,
  },
  swipeableRowOverride: {
    marginBottom: 8,
    borderRadius: 4,
  },
  swipeableContentOverride: {
    borderRadius: 4,
  },
  criterionHeaderCell: {
    height: 60,
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
  optionsScrollView: {
    flex: 1,
  },
  optionsHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: 'row',
  },
  optionHeaderCell: {
    width: 90,
    height: 60,
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
    height: 44,
    textAlignVertical: 'top',
    paddingTop: 4,
  },
  addCell: {
    width: 40,
    height: 60,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  criterionInput: {
    width: '100%',
    textAlignVertical: 'top',
    minHeight: 24,
    flex: 1,
    fontSize: 16,
  },
  comparisonCell: {
    width: 90,
    height: 60,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 14,
  },
  clearAllContainer: {
    minHeight: 48,
    paddingVertical: 8,
    justifyContent: 'center',
    flex: 1,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: 'transparent',
    width: '100%',
  },
  clearAllButtonText: {
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 14,
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 2,
  },
  
  // Notes Section Styles
  notesSection: {
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  notesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  notesBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  notesBadgeText: {
    fontSize: 0,
  },
  notesContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  notesInput: {
    minHeight: 80,
    maxHeight: 120,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    fontSize: 16,
    lineHeight: 20,
  },
});

export default QuickComparisonScreen;
