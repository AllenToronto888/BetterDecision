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
    View
} from 'react-native';
import { CustomHeader, Save, SectionTitle, Share, SwipableRow, Typography, useTheme } from '../../components';
import { useI18n } from '../../i18n';
// Import Button directly from its file to avoid "Cannot call a class as a function" error

interface Item {
  id: string;
  text: string;
  weight: number;
}

const ProsConsScreen = () => {
  const { theme } = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation();
  const [title, setTitle] = useState(t('prosAndCons'));
  const [pros, setPros] = useState<Item[]>([
    { id: '1', text: t('sampleText'), weight: 5 },
    { id: '2', text: t('sampleText'), weight: 9 },
  ]);
  const [cons, setCons] = useState<Item[]>([
    { id: '1', text: t('sampleText'), weight: 3 },
  ]);
  const [notes, setNotes] = useState('');
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Update translations when language changes
  useEffect(() => {
    setTitle(t('prosAndCons'));
    setPros(prevPros => 
      prevPros.map(pro => ({ ...pro, text: pro.text === 'sample text' ? t('sampleText') : pro.text }))
    );
    setCons(prevCons => 
      prevCons.map(con => ({ ...con, text: con.text === 'sample text' ? t('sampleText') : con.text }))
    );
  }, [t]);
  
  const totalProsWeight = pros.reduce((sum, item) => sum + item.weight, 0);
  const totalConsWeight = cons.reduce((sum, item) => sum + item.weight, 0);
  
  const addItem = (isPro: boolean) => {
    const items = isPro ? pros : cons;
    const newId = items.length > 0 
      ? (Math.max(...items.map(item => parseInt(item.id))) + 1).toString()
      : '1';
    
    const newItem = { id: newId, text: '', weight: 0 };
    
    if (isPro) {
      setPros([...pros, newItem]);
    } else {
      setCons([...cons, newItem]);
    }
  };
  
  const updateItem = (isPro: boolean, id: string, field: keyof Item, value: any) => {
    const items = isPro ? pros : cons;
    const updatedItems = items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    
    if (isPro) {
      setPros(updatedItems);
    } else {
      setCons(updatedItems);
    }
  };
  
  const removeItem = (isPro: boolean, id: string) => {
    const items = isPro ? pros : cons;
    const updatedItems = items.filter(item => item.id !== id);
    
    if (isPro) {
      setPros(updatedItems);
    } else {
      setCons(updatedItems);
    }
  };
  
  const changeWeight = (isPro: boolean, id: string, increment: boolean) => {
    const items = isPro ? pros : cons;
    const item = items.find(item => item.id === id);
    
    if (item) {
      let newWeight = increment ? item.weight + 1 : item.weight - 1;
      newWeight = Math.max(0, Math.min(10, newWeight));
      updateItem(isPro, id, 'weight', newWeight);
    }
  };
  
  const clearAll = () => {
    setPros([]);
    setCons([]);
    setNotes('');
    setNotesExpanded(false);
  };
  
  const renderItem = (item: Item, isPro: boolean) => {
    return (
      <SwipableRow
        key={item.id}
        leftActions={[{
          icon: 'delete',
          color: theme.colors.danger,
          onPress: () => removeItem(isPro, item.id),
        }]}
        rightActions={[{
          icon: 'delete',
          color: theme.colors.danger,
          onPress: () => removeItem(isPro, item.id),
        }]}
      >
        <View 
          style={[
            styles.itemContainer, 
            { 
              backgroundColor: theme.colors.card, 
              borderColor: isPro ? theme.colors.primary : theme.colors.danger 
            }
          ]}
        >
          <View style={styles.itemHeader}>
            <View style={styles.weightControls}>
              <TouchableOpacity
                style={[
                  styles.weightButton, 
                  { 
                    backgroundColor: isPro ? theme.colors.primary : theme.colors.danger,
                    opacity: item.weight <= 0 ? 0.5 : 1
                  }
                ]}
                onPress={() => changeWeight(isPro, item.id, false)}
                disabled={item.weight <= 0}
              >
                <MaterialIcons name="remove" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={[styles.weightText, { color: theme.colors.text }]}>{item.weight}</Text>
              <TouchableOpacity
                style={[
                  styles.weightButton, 
                  { 
                    backgroundColor: isPro ? theme.colors.primary : theme.colors.danger,
                    opacity: item.weight >= 10 ? 0.5 : 1
                  }
                ]}
                onPress={() => changeWeight(isPro, item.id, true)}
                disabled={item.weight >= 10}
              >
                <MaterialIcons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
          
          <TextInput
            style={[styles.itemInput, { color: theme.colors.text }]}
            value={item.text}
            onChangeText={(value) => updateItem(isPro, item.id, 'text', value)}
            placeholder={isPro ? t('addAPro') : t('addACon')}
            placeholderTextColor={theme.colors.tabBarInactive}
            multiline
          />
        </View>
      </SwipableRow>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomHeader
        title={t('prosAndCons')}
        leftAction={{
          icon: "chevron-left",
          onPress: () => navigation.goBack()
        }}
        rightAction={{
          icon: "history",
          onPress: () => navigation.navigate('ProsConsSavedItems' as never)
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
                    pros,
                    cons,
                    totalProsWeight,
                    totalConsWeight,
                    notes,
                    type: 'pros_cons',
                  }}
                  dataType="decision"
                  variant="icon"
                  showInput={false}
                  onSaveSuccess={(name) => console.log('Saved as:', name)}
                />
                <Share
                  data={{
                    title,
                    pros,
                    cons,
                    totalProsWeight,
                    totalConsWeight,
                    notes,
                  }}
                  dataType="comparison"
                  title={t('prosAndConsAnalysis')}
                  variant="icon"
                  onShareSuccess={() => console.log('Shared successfully')}
                />
              </>
            }
          />
        

        
        <View style={styles.labelsContainer}>
          <Typography variant="h5" color="text" style={styles.listTitle}>{t('pros')}</Typography>
          <Typography variant="h5" color="text" style={styles.listTitle}>{t('cons')}</Typography>
        </View>
        
        <View style={styles.scoreContainer}>
          <View 
            style={[
              styles.scoreBar, 
              { 
                backgroundColor: theme.colors.primary,
                flex: totalProsWeight,
              }
            ]}
          >
            <Typography variant="button" style={styles.scoreNumber}>{totalProsWeight}</Typography>
          </View>
          <View 
            style={[
              styles.scoreBar, 
              { 
                backgroundColor: theme.colors.danger,
                flex: totalConsWeight,
              }
            ]}
          >
            <Typography variant="button" style={styles.scoreNumber}>{totalConsWeight}</Typography>
          </View>
        </View>
        
        <View style={styles.itemsContainer}>
          <View style={styles.column}>
            {pros.map(item => renderItem(item, true))}
            <TouchableOpacity
              style={[styles.columnButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => addItem(true)}
            >
              <MaterialIcons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>{t('addPros')}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.column}>
            {cons.map(item => renderItem(item, false))}
            <TouchableOpacity
              style={[styles.columnButton, { backgroundColor: theme.colors.danger }]}
              onPress={() => addItem(false)}
            >
              <MaterialIcons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>{t('addCons')}</Text>
            </TouchableOpacity>
            
            {(pros.length > 0 || cons.length > 0) && (
              <TouchableOpacity
                style={[styles.clearAllButton, { borderColor: theme.colors.primary }]}
                onPress={clearAll}
              >
                <MaterialIcons name="clear" size={20} color={theme.colors.primary} />
                <Text style={[styles.clearAllText, { color: theme.colors.primary }]}>{t('clearAll')}</Text>
              </TouchableOpacity>
            )}
          </View>
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
                style={[styles.notesInput, { 
                  backgroundColor: theme.colors.background, 
                  color: theme.colors.text,
                  borderColor: theme.colors.border 
                }]}
                value={notes}
                onChangeText={setNotes}
                placeholder={t('addNotesAboutDecision')}
                placeholderTextColor={theme.colors.tabBarInactive}
                multiline
                textAlignVertical="top"
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
    paddingBottom: 100,
  },


  labelsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  listTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  scoreBar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },

  columnButton: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 14,
  },
  clearAllButton: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  clearAllText: {
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 14,
  },
  itemsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  column: {
    flex: 1,
  },
  itemContainer: {
    borderRadius: 4,
    padding: 8,
    borderLeftWidth: 4,
    marginBottom: 0, // Remove negative margin hack - let SwipableRow handle spacing
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weightButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weightText: {
    marginHorizontal: 12,
    fontWeight: 'bold',
    fontSize: 18,
    minWidth: 24,
    textAlign: 'center',
  },


  itemInput: {
    minHeight: 40,
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

export default ProsConsScreen;

