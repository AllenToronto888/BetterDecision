import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Easing,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { CustomHeader, useTheme } from '../../components';

interface DiceConfig {
  count: number;
  sides: number;
}

interface DiceResult {
  id: number;
  value: number;
  rotation: Animated.Value;
}

const DiceScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [config, setConfig] = useState<DiceConfig>({ count: 2, sides: 6 });
  const [results, setResults] = useState<DiceResult[]>([]);
  const [sum, setSum] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  
  const diceColors = useRef([
    '#F44336', // Red
    '#2196F3', // Blue
    '#4CAF50', // Green
    '#FF9800', // Orange
    '#9C27B0', // Purple
  ]).current;
  
  const sideOptions = [4, 6, 8, 10, 12, 20];
  
  const updateCount = (increment: boolean) => {
    const newCount = increment ? config.count + 1 : config.count - 1;
    if (newCount >= 1 && newCount <= 6) {
      setConfig({ ...config, count: newCount });
    }
  };
  
  const updateSides = (sides: number) => {
    setConfig({ ...config, sides });
  };
  
  const rollDice = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    
    // Create new dice results
    const newResults: DiceResult[] = [];
    let newSum = 0;
    
    for (let i = 0; i < config.count; i++) {
      const value = Math.floor(Math.random() * config.sides) + 1;
      newSum += value;
      
      newResults.push({
        id: i,
        value,
        rotation: new Animated.Value(0),
      });
    }
    
    // Animate dice roll
    const animations = newResults.map(result => {
      return Animated.timing(result.rotation, {
        toValue: 1,
        duration: 600 + Math.random() * 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });
    });
    
    Animated.stagger(100, animations).start(() => {
      setIsRolling(false);
    });
    
    setResults(newResults);
    setSum(newSum);
  };
  
  const renderDie = (result: DiceResult) => {
    const spin = result.rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '720deg'],
    });
    
    const scale = result.rotation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 1.2, 1],
    });
    
    const colorIndex = result.id % diceColors.length;
    const diceColor = diceColors[colorIndex];
    
    return (
      <Animated.View
        key={result.id}
        style={[
          styles.die,
          { 
            backgroundColor: diceColor,
            transform: [
              { rotate: spin },
              { scale },
            ],
          },
        ]}
      >
        <Text style={styles.dieText}>{result.value}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomHeader
        title="Dice"
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

      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >

      <View style={[styles.configCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.configTitle, { color: theme.colors.text }]}>Dice Configuration</Text>
        
        <View style={styles.configRow}>
          <Text style={[styles.configLabel, { color: theme.colors.text }]}>Number of Dice:</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity
              style={[
                styles.counterButton, 
                { 
                  backgroundColor: theme.colors.primary,
                  opacity: config.count <= 1 ? 0.5 : 1,
                }
              ]}
              onPress={() => updateCount(false)}
              disabled={config.count <= 1}
            >
              <MaterialIcons name="remove" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={[styles.counterText, { color: theme.colors.text }]}>{config.count}</Text>
            <TouchableOpacity
              style={[
                styles.counterButton, 
                { 
                  backgroundColor: theme.colors.primary,
                  opacity: config.count >= 6 ? 0.5 : 1,
                }
              ]}
              onPress={() => updateCount(true)}
              disabled={config.count >= 6}
            >
              <MaterialIcons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.configRow}>
          <Text style={[styles.configLabel, { color: theme.colors.text }]}>Sides per Die:</Text>
          <View style={styles.sidesContainer}>
            {sideOptions.map((sides) => (
              <TouchableOpacity
                key={sides}
                style={[
                  styles.sideButton,
                  { 
                    backgroundColor: config.sides === sides ? theme.colors.primary : theme.colors.background,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => updateSides(sides)}
              >
                <Text
                  style={[
                    styles.sideButtonText,
                    { color: config.sides === sides ? '#FFFFFF' : theme.colors.text },
                  ]}
                >
                  d{sides}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      
      <TouchableOpacity
        style={[styles.rollButton, { backgroundColor: theme.colors.primary }]}
        onPress={rollDice}
        disabled={isRolling}
      >
        <MaterialIcons name="casino" size={24} color="#FFFFFF" />
        <Text style={styles.rollButtonText}>Roll Dice</Text>
      </TouchableOpacity>
      
      {results.length > 0 && (
        <View style={[styles.resultCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.resultTitle, { color: theme.colors.text }]}>Results</Text>
          
          <View style={styles.diceContainer}>
            {results.map(renderDie)}
          </View>
          
          <View style={styles.sumContainer}>
            <Text style={[styles.sumLabel, { color: theme.colors.tabBarInactive }]}>Total:</Text>
            <Text style={[styles.sumValue, { color: theme.colors.text }]}>{sum}</Text>
          </View>
        </View>
      )}
      
      <View style={[styles.historyCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.historyTitle, { color: theme.colors.text }]}>History</Text>
        
        {/* This would be populated with historical rolls */}
        <Text style={[styles.emptyHistoryText, { color: theme.colors.tabBarInactive }]}>
          No previous rolls
        </Text>
      </View>
      </ScrollView>
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
  configCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 24,
    borderWidth: 1,
  },
  configTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  configLabel: {
    fontSize: 16,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  sidesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  sideButton: {
    width: 40,
    height: 40,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  sideButtonText: {
    fontWeight: 'bold',
  },
  rollButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 4,
    marginBottom: 16,
  },
  rollButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
  },
  resultCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  diceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  die: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
  },
  dieText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  sumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sumLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  sumValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  historyCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyHistoryText: {
    textAlign: 'center',
    padding: 16,
  },
});

export default DiceScreen;
