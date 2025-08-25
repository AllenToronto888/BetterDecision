import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRef, useState } from 'react';
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
import { useI18n } from '../../i18n';

interface SpinnerOption {
  id: string;
  text: string;
  color: string;
}

const SpinnerScreen = () => {
  const { theme } = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation();
  const [title, setTitle] = useState(t('spinToDecide'));
  const [options, setOptions] = useState<SpinnerOption[]>([
    { id: '1', text: t('pizza'), color: '#F44336' },
    { id: '2', text: t('burger'), color: '#2196F3' },
    { id: '3', text: t('sushi'), color: '#4CAF50' },
    { id: '4', text: t('chineseFood'), color: '#FF9800' },
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  
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
      ? (Math.max(...options.map(item => parseInt(item.id) || 0)) + 1).toString()
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
      Alert.alert(t('cannotRemove'), t('needAtLeastTwoOptions'));
    }
  };
  
  const spinWheel = () => {
    // Check if all options have text
    const emptyOptions = options.filter(option => !option.text.trim());
    if (emptyOptions.length > 0) {
      Alert.alert(t('fillAllOptions'), t('pleaseEnterTextForAllOptions'));
      return;
    }
    
    setIsSpinning(true);
    
    // Reset rotation value to 0 before spinning for consistent velocity
    rotationValue.setValue(0);
    
    // Generate random number of full rotations (3-6) plus a random position
    const randomRotations = 3 + Math.random() * 3;
    const randomPosition = Math.random();
    const toValue = randomRotations + randomPosition;
    
    // Randomize duration between 3.5 to 5.5 seconds for variety
    const randomDuration = 3500 + Math.random() * 2000;
    
    Animated.timing(rotationValue, {
      toValue,
      duration: randomDuration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      // Just stop spinning - let user see where pointer lands
      setIsSpinning(false);
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
            
            // For segments <= 180 degrees, we need a different approach
            const isSmallSegment = segmentAngle <= 180;
            
            return (
              <View
                key={option.id}
                style={[
                  isSmallSegment ? styles.smallSegment : styles.segment,
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
            <Text style={styles.spinButtonText}>{t('spin').toUpperCase()}</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.pointer, { borderBottomColor: theme.colors.text }]} />
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomHeader
        title={t('spinner')}
        leftAction={{
          icon: "chevron-left",
          onPress: () => navigation.goBack()
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={[styles.container, { backgroundColor: theme.colors.background }]}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.titleContainer}>
          <TextInput
            style={[styles.titleInput, { color: theme.colors.text }]}
            value={title}
            onChangeText={setTitle}
            placeholder={t('enterTitle')}
            placeholderTextColor={theme.colors.tabBarInactive}
          />
        </View>
        
        {renderSpinnerWheel()}
        

        
        <View style={[styles.optionsContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.optionsTitle, { color: theme.colors.text }]}>{t('options')}</Text>
          
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
                  <MaterialIcons name="delete" size={20} color={theme.colors.danger} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={addOption}
          >
            <MaterialIcons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>{t('addOption')}</Text>
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
    paddingBottom: 100,
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
  smallSegment: {
    position: 'absolute',
    width: 150,
    height: 150,
    left: 150,
    top: 150,
    transformOrigin: 'left top',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
  },
  segmentText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
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
    borderBottomWidth: 35,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ translateY: -15 }, { rotate: '180deg' }],
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
