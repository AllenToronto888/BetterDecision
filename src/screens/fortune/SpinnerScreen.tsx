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
import Svg, { G, Path, Text as SvgText, TSpan } from 'react-native-svg';
import { CustomHeader, SwipableRow, useTheme } from '../../components';
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
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  
  const rotationValue = useRef(new Animated.Value(0)).current;
  const rotationDegree = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  

  
  const getDynamicFontSize = (text: string): number => {
    const textLength = text.length;
    
    // Base font sizes for different text lengths
    if (textLength <= 4) return 18;      // Short text: large font
    if (textLength <= 8) return 16;      // Medium text: medium font
    if (textLength <= 12) return 14;     // Long text: smaller font
    return 12;                           // Very long text: smallest font
  };
  
  const addOption = () => {
    const colors = [
      '#F44336', '#2196F3', '#4CAF50', '#FF9800', 
      '#9C27B0', '#00BCD4', '#FFEB3B', '#795548'
    ];
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

  const clearAllOptions = () => {
    if (options.length > 0) {
      // Keep first two options but clear their text
      const defaultOptions = [
        { id: '1', text: '', color: '#F44336' },
        { id: '2', text: '', color: '#2196F3' }
      ];
      setOptions(defaultOptions);
      // Reset title back to default
      setTitle(t('spinToDecide'));
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
      // Just stop spinning - user can see result on wheel
      setIsSpinning(false);
    });
  };

  // Function to create SVG path for pie segment
  const createPieSlice = (startAngle: number, endAngle: number, radius: number, innerRadius: number = 0) => {
    const centerX = 155;
    const centerY = 155;
    
    const x1 = centerX + radius * Math.cos(startAngle * Math.PI / 180);
    const y1 = centerY + radius * Math.sin(startAngle * Math.PI / 180);
    const x2 = centerX + radius * Math.cos(endAngle * Math.PI / 180);
    const y2 = centerY + radius * Math.sin(endAngle * Math.PI / 180);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    if (innerRadius === 0) {
      // Simple pie slice
      return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    } else {
      // Donut slice (not used in this case)
      const x3 = centerX + innerRadius * Math.cos(endAngle * Math.PI / 180);
      const y3 = centerY + innerRadius * Math.sin(endAngle * Math.PI / 180);
      const x4 = centerX + innerRadius * Math.cos(startAngle * Math.PI / 180);
      const y4 = centerY + innerRadius * Math.sin(startAngle * Math.PI / 180);
      
      return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
    }
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
            style={[
              styles.titleInput, 
              { color: theme.colors.text },
              focusedInput === 'title' && { borderWidth: 2, borderColor: theme.colors.primary }
            ]}
            value={title === t('spinToDecide') ? '' : title}
            placeholder={title === t('spinToDecide') ? title : t('enterTitle')}
            onChangeText={setTitle}
            placeholderTextColor={theme.colors.tabBarInactive}
            onFocus={() => setFocusedInput('title')}
            onBlur={() => {
              setFocusedInput(null);
              // Revert to default if empty
              if (title.trim() === '') {
                setTitle(t('spinToDecide'));
              }
            }}
          />
        </View>
        
        <View style={styles.wheelContainer}>
          <Animated.View
            style={[
              styles.wheel,
              { transform: [{ rotate: rotationDegree }] },
            ]}
          >
            <Svg width="310" height="310" viewBox="0 0 310 310">
              <G origin="155, 155">
                {options.map((option, index) => {
                  const segmentAngle = 360 / options.length;
                  const startAngle = index * segmentAngle - 90; // Start from top
                  const endAngle = (index + 1) * segmentAngle - 90;
                  const midAngle = (startAngle + endAngle) / 2;
                  
                  // Text position (about 2/3 out from center)
                  const textRadius = 95;
                  const textX = 155 + textRadius * Math.cos(midAngle * Math.PI / 180);
                  const textY = 155 + textRadius * Math.sin(midAngle * Math.PI / 180);
                  
                  return (
                    <G key={option.id}>
                      <Path
                        d={createPieSlice(startAngle, endAngle, 145)}
                        fill={option.color}
                        stroke="#FFFFFF"
                        strokeWidth="3"
                      />
                      <SvgText
                        x={textX}
                        y={textY}
                        fontSize={Math.max(getDynamicFontSize(option.text) + 2, 14)}
                        fill="#FFFFFF"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        fontWeight="bold"
                      >
                        {option.text.length > 4 ? (
                          <>
                            <TSpan x={textX} dy="-0.3em">{option.text.substring(0, Math.ceil(option.text.length / 2))}</TSpan>
                            <TSpan x={textX} dy="1.2em">{option.text.substring(Math.ceil(option.text.length / 2))}</TSpan>
                          </>
                        ) : (
                          option.text
                        )}
                      </SvgText>
                    </G>
                  );
                })}
              </G>
            </Svg>
          </Animated.View>
          
          {/* Center button */}
          <View style={styles.wheelCenter}>
            <TouchableOpacity
              style={[styles.spinButton, { backgroundColor: theme.colors.primary }]}
              onPress={spinWheel}
              disabled={isSpinning}
            >
              <Text style={styles.spinButtonText}>
                {isSpinning ? t('spinning') : t('spin').toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Pointer */}
          <View style={[styles.pointer, { borderBottomColor: theme.colors.text }]} />
          
        </View>
        
        <View style={[styles.optionsContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.optionsTitle, { color: theme.colors.text }]}>{t('options')}</Text>
          
          {options.map((option) => (
            <SwipableRow
              key={option.id}
              rightActions={options.length > 2 ? [{
                icon: 'delete',
                color: theme.colors.danger,
                onPress: () => removeOption(option.id),
              }] : undefined}
              style={styles.swipeableRowOverride}
              contentStyle={styles.swipeableContentOverride}
            >
              <View style={styles.optionRow}>
                <View 
                  style={[
                    styles.colorIndicator, 
                    { backgroundColor: option.color }
                  ]} 
                />
                <TextInput
                  style={[
                    styles.optionInput, 
                    { color: theme.colors.text, backgroundColor: theme.colors.background },
                    focusedInput === `option-${option.id}` && { borderWidth: 2, borderColor: theme.colors.primary }
                  ]}
                  value={(() => {
                    const defaultTexts = [t('pizza'), t('burger'), t('sushi'), t('chineseFood')];
                    return defaultTexts.includes(option.text) ? '' : option.text;
                  })()}
                  placeholder={(() => {
                    const defaultTexts = [t('pizza'), t('burger'), t('sushi'), t('chineseFood')];
                    return defaultTexts.includes(option.text) ? option.text : t('enterOption');
                  })()}
                  onChangeText={(text) => updateOption(option.id, text)}
                  placeholderTextColor={theme.colors.tabBarInactive}
                  onFocus={() => setFocusedInput(`option-${option.id}`)}
                  onBlur={() => {
                    setFocusedInput(null);
                    // Revert to default if empty
                    if (option.text.trim() === '') {
                      const defaultTexts = [t('pizza'), t('burger'), t('sushi'), t('chineseFood')];
                      const index = parseInt(option.id) - 1;
                      if (index < defaultTexts.length) {
                        updateOption(option.id, defaultTexts[index]);
                      }
                    }
                  }}
                />
              </View>
            </SwipableRow>
          ))}
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              onPress={addOption}
            >
              <MaterialIcons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>{t('addOption')}</Text>
            </TouchableOpacity>
            
            {options.length > 2 && (
              <TouchableOpacity
                style={[styles.clearAllButton, { borderColor: theme.colors.primary }]}
                onPress={clearAllOptions}
              >
                <MaterialIcons name="delete-sweep" size={20} color={theme.colors.primary} />
                <Text style={[styles.clearAllButtonText, { color: theme.colors.primary }]}>{t('clearAll')}</Text>
              </TouchableOpacity>
            )}
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
    paddingBottom: 300,
    alignItems: 'center',
  },
  titleContainer: {
    width: '100%',
    marginBottom: 8,
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
    width: 330,
    height: 330,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 16,
    position: 'relative',
  },
  wheel: {
    width: 310,
    height: 310,
  },
  wheelCenter: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
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
    width: 74,
    height: 74,
    borderRadius: 37,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  pointer: {
    position: 'absolute',
    top: 10,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '180deg' }],
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
    height: 44,
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  optionInput: {
    flex: 1,
    height: 44,
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  swipeableRowOverride: {
    marginBottom: 12,
    borderRadius: 4,
    height: 44,
  },
  swipeableContentOverride: {
    borderRadius: 4,
    minHeight: 44,
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
    borderRadius: 8,
    flex: 1,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'transparent',
    flex: 1,
  },
  clearAllButtonText: {
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 16,
  },
});

export default SpinnerScreen;
