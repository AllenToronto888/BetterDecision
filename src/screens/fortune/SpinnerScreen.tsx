import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Easing,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { CustomHeader, useTheme } from '../../components';

interface SpinnerOption {
  id: string;
  text: string;
  color: string;
}

const SpinnerScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [title, setTitle] = useState('Spin to Decide');
  const [options, setOptions] = useState<SpinnerOption[]>([
    { id: '1', text: 'Pizza', color: '#F44336' },
    { id: '2', text: 'Burger', color: '#2196F3' },
    { id: '3', text: 'Sushi', color: '#4CAF50' },
    { id: '4', text: 'Pasta', color: '#FF9800' },
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<SpinnerOption | null>(null);
  
  const rotationValue = useRef(new Animated.Value(0)).current;
  const rotationDegree = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  const colors = [
    '#F44336', // Red
    '#2196F3', // Blue
    '#4CAF50', // Green
    '#FF9800', // Orange
    '#9C27B0', // Purple
    '#00BCD4', // Cyan
    '#FFEB3B', // Yellow
    '#795548', // Brown
  ];
  
  const addOption = () => {
    const newId = options.length > 0 
      ? (Math.max(...options.map(item => parseInt(item.id))) + 1).toString()
      : '1';
    
    const colorIndex = options.length % colors.length;
    const newOption = { id: newId, text: '', color: colors[colorIndex] };
    setOptions([...options, newOption]);
  };
  
  const updateOption = (id: string, text: string) => {
    const updatedOptions = options.map(option => {
      if (option.id === id) {
        return { ...option, text };
      }
      return option;
    });
    
    setOptions(updatedOptions);
  };
  
  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter(option => option.id !== id));
    } else {
      Alert.alert('Cannot Remove', 'You need at least 2 options for the spinner.');
    }
  };
  
  const spinWheel = () => {
    // Check if all options have text
    const emptyOptions = options.filter(option => !option.text.trim());
    if (emptyOptions.length > 0) {
      Alert.alert('Empty Options', 'Please fill in all options before spinning.');
      return;
    }
    
    setIsSpinning(true);
    setResult(null);
    
    // Generate random number of full rotations (2-5) plus a random position
    const randomRotations = 2 + Math.random() * 3;
    const randomPosition = Math.random();
    const toValue = randomRotations + randomPosition;
    
    Animated.timing(rotationValue, {
      toValue,
      duration: 3000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      // Calculate which option was selected based on the final position
      const finalPosition = randomPosition;
      const optionIndex = Math.floor(finalPosition * options.length);
      const selectedOption = options[optionIndex];
      
      setResult(selectedOption);
      setIsSpinning(false);
      rotationValue.setValue(0);
    });
  };
  
  const renderSpinnerWheel = () => {
    const segmentAngle = 360 / options.length;
    
    return (
      <View style={styles.wheelContainer}>
        <Animated.View
          style={[
            styles.wheel,
            { transform: [{ rotate: rotationDegree }] },
          ]}
        >
          {options.map((option, index) => {
            const startAngle = index * segmentAngle;
            const endAngle = (index + 1) * segmentAngle;
            
            return (
              <View
                key={option.id}
                style={[
                  styles.segment,
                  {
                    backgroundColor: option.color,
                    transform: [
                      { rotate: `${startAngle}deg` },
                    ],
                  },
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { transform: [{ rotate: `${segmentAngle / 2}deg` }] },
                  ]}
                  numberOfLines={1}
                >
                  {option.text}
                </Text>
              </View>
            );
          })}
        </Animated.View>
        <View style={styles.wheelCenter}>
          <TouchableOpacity
            style={[styles.spinButton, { backgroundColor: theme.colors.primary }]}
            onPress={spinWheel}
            disabled={isSpinning}
          >
            <Text style={styles.spinButtonText}>SPIN</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.pointer} />
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomHeader
        title="Spinner"
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
        <View style={styles.titleContainer}>
          <TextInput
            style={[styles.titleInput, { color: theme.colors.text }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter title"
            placeholderTextColor={theme.colors.tabBarInactive}
          />
        </View>
        
        {renderSpinnerWheel()}
        
        {result && (
          <View style={[styles.resultContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.resultLabel, { color: theme.colors.tabBarInactive }]}>Result:</Text>
            <Text style={[styles.resultText, { color: theme.colors.text }]}>{result.text}</Text>
          </View>
        )}
        
        <View style={[styles.optionsContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.optionsTitle, { color: theme.colors.text }]}>Options</Text>
          
          {options.map((option) => (
            <View key={option.id} style={styles.optionRow}>
              <View 
                style={[
                  styles.colorIndicator, 
                  { backgroundColor: option.color }
                ]} 
              />
              <TextInput
                style={[styles.optionInput, { color: theme.colors.text, backgroundColor: theme.colors.background }]}
                value={option.text}
                onChangeText={(text) => updateOption(option.id, text)}
                placeholder="Enter option"
                placeholderTextColor={theme.colors.tabBarInactive}
              />
              {options.length > 2 && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeOption(option.id)}
                >
                  <MaterialIcons name="delete" size={20} color={theme.danger} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={addOption}
          >
            <MaterialIcons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Option</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
  },
  titleContainer: {
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  wheelContainer: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  wheel: {
    width: 300,
    height: 300,
    borderRadius: 150,
    overflow: 'hidden',
    position: 'relative',
  },
  segment: {
    position: 'absolute',
    width: 150,
    height: 300,
    left: 150,
    transformOrigin: 'left center',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 80,
  },
  segmentText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    width: 60,
    textAlign: 'center',
  },
  wheelCenter: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  spinButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  pointer: {
    position: 'absolute',
    top: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#000',
    transform: [{ translateY: -10 }],
  },
  resultContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  resultLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  optionsContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  optionInput: {
    flex: 1,
    height: 40,
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 4,
    marginTop: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default SpinnerScreen;
