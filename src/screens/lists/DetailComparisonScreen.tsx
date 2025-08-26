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
  text: string;
}

const DetailComparisonScreen = () => {
  const { theme } = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation();
  const [title, setTitle] = useState(t('detailComparison'));
  const [criteria, setCriteria] = useState<Criterion[]>([
    { id: '1', text: t('price') },
    { id: '2', text: t('features') },
  ]);
  const [options, setOptions] = useState<Option[]>([
    { id: '1', name: `${t('product')} A` },
    { id: '2', name: `${t('product')} B` },
  ]);
  const [comparisonData, setComparisonData] = useState<ComparisonCell[]>([
    { criterionId: '1', optionId: '1', text: '$499' },
    { criterionId: '1', optionId: '2', text: '$599' },
    { criterionId: '2', optionId: '1', text: t('basic') },
    { criterionId: '2', optionId: '2', text: t('premium') },
  ]);
  const [notes, setNotes] = useState('');
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [rowHeights, setRowHeights] = useState<{[key: string]: number}>({});
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'pending' | 'saving' | 'saved' | 'error'>('idle');

  // Update translation when language changes
  useEffect(() => {
    setCriteria(prevCriteria => 
      prevCriteria.map((criterion, index) => ({
        ...criterion,
        text: criterion.text === 'Price' || 
              criterion.text === 'Precio' || 
              criterion.text === 'Prix' || 
              criterion.text === '价格' || 
              criterion.text === '價格' || 
              criterion.text === '価格' || 
              criterion.text.includes('price') ? 
              t('price') : (
                criterion.text === 'Features' || 
                criterion.text === 'Características' || 
                criterion.text === 'Fonctionnalités' || 
                criterion.text === '功能' || 
                criterion.text === '特徵' || 
                criterion.text === '機能' || 
                criterion.text.includes('features') ? 
                t('features') : criterion.text
              )
      }))
    );
    setOptions(prevOptions => 
      prevOptions.map((option, index) => ({
        ...option,
        name: option.name.includes('Product') || 
              option.name.includes('Producto') || 
              option.name.includes('Produit') || 
              option.name.includes('产品') || 
              option.name.includes('產品') || 
              option.name.includes('商品') ? 
              `${t('product')} ${String.fromCharCode(65 + index)}` : option.name
      }))
    );
    setComparisonData(prevData => 
      prevData.map(cell => ({
        ...cell,
        text: cell.text === 'Basic' || 
              cell.text === 'Básico' || 
              cell.text === 'De base' || 
              cell.text === '基础' || 
              cell.text === '基礎' || 
              cell.text === 'ベーシック' ? 
              t('basic') : (
                cell.text === 'Premium' || 
                cell.text === 'Prémium' || 
                cell.text === '高级' || 
                cell.text === '高級' || 
                cell.text === 'プレミアム' ? 
                t('premium') : cell.text
              )
      }))
    );
  }, [t]);

  // Auto-save functionality
  useAutoSave({
    data: {
      criteria,
      options,
      comparisonData,
      notes,
      title,
    },
    dataType: 'detail_comparison',
    enabled: Boolean(
      criteria.some(criterion => criterion.text.trim()) ||
      options.some(option => option.name.trim()) ||
      comparisonData.some(cell => cell.text.trim()) ||
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
    setTitle(t('detailComparison'));
    setCriteria(prevCriteria => 
      prevCriteria.map((criterion, index) => ({
        ...criterion,
        text: criterion.text === 'Price' || criterion.text === '价格' || criterion.text === '價格' || criterion.text === 'Prix' || criterion.text === 'Precio' ? t('price') :
              criterion.text === 'Features' || criterion.text === '功能' || criterion.text === '機能' || criterion.text === 'Caractéristiques' || criterion.text === 'Características' ? t('features') :
              criterion.text
      }))
    );
    setOptions(prevOptions => 
      prevOptions.map((option, index) => ({
        ...option,
        name: option.name.startsWith('Product') || option.name.startsWith('产品') || option.name.startsWith('產品') || option.name.startsWith('Produit') || option.name.startsWith('Producto') ? 
              `${t('product')} ${option.name.slice(-1)}` : option.name
      }))
    );
    setComparisonData(prevData => 
      prevData.map(cell => ({
        ...cell,
        text: cell.text === 'Basic' || cell.text === '基础' || cell.text === '基礎' || cell.text === 'Basique' || cell.text === 'Básico' ? t('basic') :
              cell.text === 'Premium' || cell.text === '高级' || cell.text === '高級' || cell.text === 'Premium' || cell.text === 'Premium' ? t('premium') :
              cell.text
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
      text: '',
    }));
    
    setComparisonData([...comparisonData, ...newCells]);
  };
  
  const addOption = () => {
    const newId = options.length > 0 
      ? (Math.max(...options.map(item => parseInt(item.id))) + 1).toString()
      : '1';
    
    const newOption = { id: newId, name: `${t('product')} ${newId}` };
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
      setNotes('');
      setNotesExpanded(false);
      // Reset title back to default
      setTitle(t('detailComparison'));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomHeader
        title={t('detailComparison')}
        leftAction={{
          icon: "chevron-left",
          onPress: () => navigation.goBack()
        }}
        rightAction={{
          icon: "history",
          onPress: () => navigation.navigate('DetailComparisonSavedItems' as never)
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
            defaultTitles={[t('detailComparison')]}
            actions={
              <>
                <Save
                  data={{
                    title,
                    criteria,
                    options,
                    comparisonData,
                    notes,
                    comparisonType: 'detail_comparison',
                  }}
                  dataType="detail_comparison"
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
                    notes,
                  }}
                  dataType="detail_comparison"
                  title={t('detailComparisonResult')}
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
                      value={(criterion.text === t('price') || criterion.text === t('features')) ? '' : criterion.text}
                      placeholder={(criterion.text === t('price') || criterion.text === t('features')) ? criterion.text : t('enterCriterion')}
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
                          const defaultText = parseInt(criterion.id) === 1 ? t('price') : t('features');
                          updateCriterion(criterion.id, defaultText);
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
                      value={option.name.includes(t('product')) ? '' : option.name}
                      placeholder={option.name.includes(t('product')) ? option.name : `${t('product')} ${index + 1}`}
                      onChangeText={(text) => updateOption(option.id, text)}
                      placeholderTextColor={theme.colors.tabBarInactive}
                      onFocus={() => {
                        setFocusedInput(`option-${option.id}`);
                      }}
                      onBlur={() => {
                        setFocusedInput(null);
                        // Revert to default if empty
                        if (option.name.trim() === '') {
                          const defaultName = `${t('product')} ${String.fromCharCode(64 + parseInt(option.id))}`;
                          updateOption(option.id, defaultName);
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
                  {options.map((option) => (
                    <View
                      key={`${criterion.id}-${option.id}`}
                      style={[
                        styles.comparisonCell, 
                        { 
                          backgroundColor: theme.colors.card,
                          borderColor: focusedInput === `cell-${criterion.id}-${option.id}` ? theme.colors.primary : theme.colors.border,
                          borderWidth: focusedInput === `cell-${criterion.id}-${option.id}` ? 2 : 1
                        }
                      ]}
                    >
                      <TextInput
                        style={[
                          styles.cellInput, 
                          { color: theme.colors.text }
                        ]}
                        value={(() => {
                          const currentText = getCellText(criterion.id, option.id);
                          return (currentText === '$499' || currentText === '$599' || currentText === t('basic') || currentText === t('premium')) ? '' : currentText;
                        })()}
                        placeholder={(() => {
                          const currentText = getCellText(criterion.id, option.id);
                          return (currentText === '$499' || currentText === '$599' || currentText === t('basic') || currentText === t('premium')) ? currentText : t('enterDetails');
                        })()}
                        onChangeText={(text) => updateCellText(criterion.id, option.id, text)}
                        placeholderTextColor={theme.colors.tabBarInactive}
                        multiline
                        onFocus={() => {
                          setFocusedInput(`cell-${criterion.id}-${option.id}`);
                        }}
                        onBlur={() => {
                          setFocusedInput(null);
                          // Revert to default if empty
                          const currentText = getCellText(criterion.id, option.id);
                          if (currentText.trim() === '') {
                            // Determine default based on criterion and option
                            let defaultText = '';
                            if (criterion.id === '1') { // Price criterion
                              defaultText = option.id === '1' ? '$499' : '$599';
                            } else if (criterion.id === '2') { // Features criterion  
                              defaultText = option.id === '1' ? t('basic') : t('premium');
                            }
                            if (defaultText) {
                              updateCellText(criterion.id, option.id, defaultText);
                            }
                          }
                        }}
                      />
                    </View>
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
  optionsScrollView: {
    flex: 1,
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
  optionsHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  optionHeaderCell: {
    width: 130,
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
  optionsRow: {
    flexDirection: 'row',
  },
  criterionInput: {
    color: 'inherit',
  },
  comparisonCell: {
    width: 130,
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
    fontSize: 14,
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

export default DetailComparisonScreen;
