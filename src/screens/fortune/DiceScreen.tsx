import { useNavigation } from '@react-navigation/native';
import { useRef, useState } from 'react';
import {
    Animated,
    Easing,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { CustomHeader, Icon, useTheme } from '../../components';
import { useI18n } from '../../i18n';

interface DiceConfig {
  count: number;
  sides: number;
}

interface DiceResult {
  id: number;
  value: number;
  rotation: Animated.Value;
}

interface HistoryEntry {
  id: string;
  timestamp: Date;
  config: DiceConfig;
  results: number[];
  sum: number;
}

const DiceScreen = () => {
  const { theme } = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation();
  const [config, setConfig] = useState<DiceConfig>({ count: 2, sides: 6 });
  const [results, setResults] = useState<DiceResult[]>([]);
  const [sum, setSum] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  
  const diceColors = useRef([
    '#F44336', // Red
    '#2196F3', // Blue
    '#4CAF50', // Green
    '#FF9800', // Orange
    '#9C27B0', // Purple
  ]).current;
  
  const sideOptions = [4, 6, 8, 12];
  
  const updateCount = (increment: boolean) => {
    const newCount = increment ? config.count + 1 : config.count - 1;
    if (newCount >= 1 && newCount <= 6) {
      setConfig({ ...config, count: newCount });
    }
  };
  
  const updateSides = (sides: number) => {
    setConfig({ ...config, sides });
  };
  
  const clearHistory = () => {
    setHistory([]);
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
      setSum(newSum); // Show total after animation completes
      
      // Add to history
      const historyEntry: HistoryEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        config: { ...config },
        results: newResults.map(r => r.value),
        sum: newSum,
      };
      setHistory(prev => [historyEntry, ...prev].slice(0, 20)); // Keep last 20 entries
    });
    
    setResults(newResults);
    setSum(0); // Hide total during animation
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
        title={t('dice')}
        leftAction={{
          icon: "chevron-left",
          onPress: () => navigation.goBack()
        }}
      />

      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >

      <View style={[styles.configCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.configTitle, { color: theme.colors.text }]}>{t('diceConfiguration')}</Text>
        
        <View style={styles.configRow}>
          <Text style={[styles.configLabel, { color: theme.colors.text }]}>{t('numberOfDice')}:</Text>
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
              <Icon name="remove" size={20} color="#FFFFFF" />
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
              <Icon name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.configRowLast}>
          <Text style={[styles.configLabel, { color: theme.colors.text }]}>{t('sidesPerDie')}:</Text>
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
                  {sides}
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
        <Icon name="casino" size={24} color="#FFFFFF" />
        <Text style={styles.rollButtonText}>{t('rollDice')}</Text>
      </TouchableOpacity>
      
      {results.length > 0 && (
        <View style={[styles.resultCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.resultTitle, { color: theme.colors.text }]}>{t('results')}</Text>
          
          <View style={styles.diceContainer}>
            {results.map(renderDie)}
          </View>
          
          <View style={styles.sumContainer}>
            <Text style={[styles.sumLabel, { color: theme.colors.tabBarInactive }]}>{t('total')}:</Text>
            <Text style={[styles.sumValue, { color: theme.colors.text }]}>{sum}</Text>
          </View>
        </View>
      )}
      
      <View style={[styles.historyCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.historyHeader}>
          <Text style={[styles.historyTitle, { color: theme.colors.text }]}>{t('history')}</Text>
          {history.length > 0 && (
            <TouchableOpacity
              style={[styles.clearButton, { borderColor: theme.colors.primary }]}
              onPress={clearHistory}
            >
              <Icon name="delete-sweep" size={16} color={theme.colors.primary} />
              <Text style={[styles.clearButtonText, { color: theme.colors.primary }]}>{t('clearAll')}</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {history.length === 0 ? (
          <Text style={[styles.emptyHistoryText, { color: theme.colors.tabBarInactive }]}>
            {t('noPreviousRolls')}
          </Text>
        ) : (
          history.map((entry) => (
            <View key={entry.id} style={[styles.historyEntry, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.historyEntryHeader}>
                <Text style={[styles.historyConfig, { color: theme.colors.text }]}>
                  {entry.config.count}x {entry.config.sides}-{t('sided')}
                </Text>
                <Text style={[styles.historyTime, { color: theme.colors.tabBarInactive }]}>
                  {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={styles.historyResults}>
                <Text style={[styles.historyDice, { color: theme.colors.tabBarInactive }]}>
                  [{entry.results.join(', ')}]
                </Text>
                <Text style={[styles.historySum, { color: theme.colors.text }]}>
                  {t('total')}: {entry.sum}
                </Text>
              </View>
            </View>
          ))
        )}
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
    paddingBottom: 100,
  },
  configCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
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
  configRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
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
    width: 32,
    height: 32,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 4,
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
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  emptyHistoryText: {
    textAlign: 'center',
    padding: 16,
  },
  historyEntry: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  historyEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyConfig: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyTime: {
    fontSize: 12,
  },
  historyResults: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDice: {
    fontSize: 12,

  },
  historySum: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default DiceScreen;
