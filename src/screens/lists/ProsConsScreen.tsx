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
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Item {
  id: string;
  text: string;
  weight: number;
}

const ProsConsScreen = () => {
  const { theme } = useTheme();
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
            backgroundColor: theme.card, 
            borderColor: isPro ? theme.primary : theme.danger 
          }
        ]}
      >
        <View style={styles.itemHeader}>
          <View style={styles.weightControls}>
            <TouchableOpacity
              style={[
                styles.weightButton, 
                { 
                  backgroundColor: isPro ? theme.primary : theme.danger,
                  opacity: item.weight <= 1 ? 0.5 : 1
                }
              ]}
              onPress={() => changeWeight(isPro, item.id, false)}
              disabled={item.weight <= 1}
            >
              <Icon name="remove" size={16} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={[styles.weightText, { color: theme.text }]}>{item.weight}</Text>
            <TouchableOpacity
              style={[
                styles.weightButton, 
                { 
                  backgroundColor: isPro ? theme.primary : theme.danger,
                  opacity: item.weight >= 10 ? 0.5 : 1
                }
              ]}
              onPress={() => changeWeight(isPro, item.id, true)}
              disabled={item.weight >= 10}
            >
              <Icon name="add" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => removeItem(isPro, item.id)}
          >
            <Icon name="delete" size={20} color={theme.tabBarInactive} />
          </TouchableOpacity>
        </View>
        
        <TextInput
          style={[styles.itemInput, { color: theme.text }]}
          value={item.text}
          onChangeText={(value) => updateItem(isPro, item.id, 'text', value)}
          placeholder={isPro ? "Add a pro..." : "Add a con..."}
          placeholderTextColor={theme.tabBarInactive}
          multiline
        />
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
        <View style={styles.titleContainer}>
          <TextInput
            style={[styles.titleInput, { color: theme.text }]}
            value={title}
            onChangeText={setTitle}
            placeholder="What are you deciding?"
            placeholderTextColor={theme.tabBarInactive}
          />
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Icon name="edit" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>
            {totalProsWeight > totalConsWeight ? '😊' : totalProsWeight < totalConsWeight ? '😕' : '😐'}
          </Text>
        </View>
        
        <View style={styles.scoreContainer}>
          <View 
            style={[
              styles.scoreBar, 
              { 
                backgroundColor: theme.primary,
                flex: totalProsWeight,
              }
            ]}
          >
            <Text style={styles.scoreText}>{totalProsWeight}</Text>
          </View>
          <View 
            style={[
              styles.scoreBar, 
              { 
                backgroundColor: theme.danger,
                flex: totalConsWeight,
              }
            ]}
          >
            <Text style={styles.scoreText}>{totalConsWeight}</Text>
          </View>
        </View>
        
        <View style={styles.listsContainer}>
          <Text style={[styles.listTitle, { color: theme.text }]}>Pros</Text>
          <Text style={[styles.listTitle, { color: theme.text }]}>Cons</Text>
        </View>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={() => addItem(true)}
          >
            <Icon name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Pro</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.danger }]}
            onPress={() => addItem(false)}
          >
            <Icon name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Con</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  emojiContainer: {
    alignItems: 'center',
    marginBottom: 16,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  addButtonText: {
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
