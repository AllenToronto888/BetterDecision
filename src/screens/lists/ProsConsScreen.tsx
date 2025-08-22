import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
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
import { CustomHeader, Save, SectionTitle, Share, Typography, useTheme } from '../../components';
// Import Button directly from its file to avoid "Cannot call a class as a function" error

interface Item {
  id: string;
  text: string;
  weight: number;
}

const ProsConsScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [title, setTitle] = useState('Should I take this job?');
  const [pros, setPros] = useState<Item[]>([
    { id: '1', text: 'Clear career path', weight: 5 },
    { id: '2', text: 'The salary is high', weight: 9 },
  ]);
  const [cons, setCons] = useState<Item[]>([
    { id: '1', text: 'The company is far from my house', weight: 3 },
  ]);
  const [isEditing, setIsEditing] = useState(false);
  
  const totalProsWeight = pros.reduce((sum, item) => sum + item.weight, 0);
  const totalConsWeight = cons.reduce((sum, item) => sum + item.weight, 0);
  
  const addItem = (isPro: boolean) => {
    const items = isPro ? pros : cons;
    const newId = items.length > 0 
      ? (Math.max(...items.map(item => parseInt(item.id))) + 1).toString()
      : '1';
    
    const newItem = { id: newId, text: '', weight: 1 };
    
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
      newWeight = Math.max(1, Math.min(10, newWeight));
      updateItem(isPro, id, 'weight', newWeight);
    }
  };
  
  const renderItem = (item: Item, isPro: boolean) => {
    return (
      <View 
        key={item.id} 
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
                  opacity: item.weight <= 1 ? 0.5 : 1
                }
              ]}
              onPress={() => changeWeight(isPro, item.id, false)}
              disabled={item.weight <= 1}
            >
              <MaterialIcons name="remove" size={16} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={[styles.weightText, { color: theme.text }]}>{item.weight}</Text>
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
              <MaterialIcons name="add" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => removeItem(isPro, item.id)}
          >
            <MaterialIcons name="delete" size={20} color={theme.colors.tabBarInactive} />
          </TouchableOpacity>
        </View>
        
        <TextInput
                      style={[styles.itemInput, { color: theme.colors.text }]}
          value={item.text}
          onChangeText={(value) => updateItem(isPro, item.id, 'text', value)}
          placeholder={isPro ? "Add a pro..." : "Add a con..."}
          placeholderTextColor={theme.colors.tabBarInactive}
          multiline
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomHeader
        title="Pros & Cons"
        leftAction={{
          icon: "chevron-left",
          onPress: () => navigation.goBack()
        }}
        rightAction={{
          icon: "history",
          onPress: () => {
            console.log('History pressed');
          }
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
                    comparisonType: 'pros_cons',
                  }}
                  dataType="comparison"
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
                  }}
                  dataType="comparison"
                  title="Pros & Cons Analysis"
                  variant="icon"
                  onShareSuccess={() => console.log('Shared successfully')}
                />
              </>
            }
          />
        
        <View style={styles.emojiContainer}>
          <Typography variant="h1" style={styles.emoji}>
            {totalProsWeight > totalConsWeight ? '😊' : totalProsWeight < totalConsWeight ? '😕' : '😐'}
          </Typography>
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
            <Typography variant="button" color="text" style={styles.scoreText}>{totalProsWeight}</Typography>
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
            <Typography variant="button" color="text" style={styles.scoreText}>{totalConsWeight}</Typography>
          </View>
        </View>
        
        <View style={styles.listsContainer}>
          <Typography variant="h5" color="text" style={styles.listTitle}>Pros</Typography>
          <Typography variant="h5" color="text" style={styles.listTitle}>Cons</Typography>
        </View>
        
        <View style={styles.buttonsContainer}>
          {/* Use TouchableOpacity instead of Button to avoid potential class error */}
          <TouchableOpacity
            style={[styles.customButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => addItem(true)}
          >
            <MaterialIcons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Add Pro</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.customButton, { backgroundColor: theme.colors.danger }]}
            onPress={() => addItem(false)}
          >
            <MaterialIcons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Add Con</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.itemsContainer}>
          <View style={styles.column}>
            {pros.map(item => renderItem(item, true))}
          </View>
          
          <View style={styles.column}>
            {cons.map(item => renderItem(item, false))}
          </View>
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
  },
  emojiContainer: {
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 24,
  },
  emoji: {
    fontSize: 48,
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
  scoreText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  listsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  listTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  addButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  customButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  itemsContainer: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
    marginHorizontal: 4,
  },
  itemContainer: {
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weightText: {
    marginHorizontal: 8,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 4,
  },
  itemInput: {
    minHeight: 40,
  },
});

export default ProsConsScreen;
