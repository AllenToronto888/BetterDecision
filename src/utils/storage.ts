import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  UNIT_COMPARISONS: 'better_decision_unit_comparisons',
  TOTAL_COST_COMPARISONS: 'better_decision_total_cost_comparisons',
  PROS_CONS_LISTS: 'better_decision_pros_cons_lists',
  QUICK_COMPARISONS: 'better_decision_quick_comparisons',
  DETAIL_COMPARISONS: 'better_decision_detail_comparisons',
  SPINNER_CONFIGS: 'better_decision_spinner_configs',
  DICE_CONFIGS: 'better_decision_dice_configs',
  APP_THEME: 'better_decision_app_theme',
};

// Generic storage functions
const storeData = async (key: string, value: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error('Error storing data:', error);
    throw error;
  }
};

const getData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) as T : null;
  } catch (error) {
    console.error('Error retrieving data:', error);
    throw error;
  }
};

const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing data:', error);
    throw error;
  }
};

// Specific storage functions for different features

// Unit Comparisons
export interface UnitComparison {
  id: string;
  name: string;
  date: string;
  products: Array<{
    name: string;
    price: string;
    quantity: string;
    unit: string;
    unitPrice: number;
  }>;
}

export const saveUnitComparison = async (comparison: UnitComparison): Promise<void> => {
  const savedComparisons = await getUnitComparisons();
  const updatedComparisons = [...savedComparisons.filter(c => c.id !== comparison.id), comparison];
  await storeData(STORAGE_KEYS.UNIT_COMPARISONS, updatedComparisons);
};

export const getUnitComparisons = async (): Promise<UnitComparison[]> => {
  return await getData<UnitComparison[]>(STORAGE_KEYS.UNIT_COMPARISONS) || [];
};

export const deleteUnitComparison = async (id: string): Promise<void> => {
  const savedComparisons = await getUnitComparisons();
  const updatedComparisons = savedComparisons.filter(c => c.id !== id);
  await storeData(STORAGE_KEYS.UNIT_COMPARISONS, updatedComparisons);
};

// Total Cost Comparisons
export interface TotalCostComparison {
  id: string;
  name: string;
  date: string;
  basePrice: string;
  additionalCosts: Array<{
    id: string;
    type: string;
    label: string;
    value: string;
    isPercentage: boolean;
  }>;
  totalCost: number;
}

export const saveTotalCostComparison = async (comparison: TotalCostComparison): Promise<void> => {
  const savedComparisons = await getTotalCostComparisons();
  const updatedComparisons = [...savedComparisons.filter(c => c.id !== comparison.id), comparison];
  await storeData(STORAGE_KEYS.TOTAL_COST_COMPARISONS, updatedComparisons);
};

export const getTotalCostComparisons = async (): Promise<TotalCostComparison[]> => {
  return await getData<TotalCostComparison[]>(STORAGE_KEYS.TOTAL_COST_COMPARISONS) || [];
};

export const deleteTotalCostComparison = async (id: string): Promise<void> => {
  const savedComparisons = await getTotalCostComparisons();
  const updatedComparisons = savedComparisons.filter(c => c.id !== id);
  await storeData(STORAGE_KEYS.TOTAL_COST_COMPARISONS, updatedComparisons);
};

// Pros & Cons Lists
export interface ProsConsList {
  id: string;
  title: string;
  date: string;
  pros: Array<{
    id: string;
    text: string;
    weight: number;
  }>;
  cons: Array<{
    id: string;
    text: string;
    weight: number;
  }>;
  notes?: string;
}

export const saveProConsList = async (list: ProsConsList): Promise<void> => {
  const savedLists = await getProsConsLists();
  const updatedLists = [...savedLists.filter(l => l.id !== list.id), list];
  await storeData(STORAGE_KEYS.PROS_CONS_LISTS, updatedLists);
};

export const getProsConsLists = async (): Promise<ProsConsList[]> => {
  return await getData<ProsConsList[]>(STORAGE_KEYS.PROS_CONS_LISTS) || [];
};

export const deleteProConsList = async (id: string): Promise<void> => {
  const savedLists = await getProsConsLists();
  const updatedLists = savedLists.filter(l => l.id !== id);
  await storeData(STORAGE_KEYS.PROS_CONS_LISTS, updatedLists);
};

// Quick Comparisons
export interface QuickComparison {
  id: string;
  title: string;
  date: string;
  criteria: Array<{
    id: string;
    text: string;
  }>;
  options: Array<{
    id: string;
    name: string;
  }>;
  comparisonData: Array<{
    criterionId: string;
    optionId: string;
    status: 'yes' | 'no' | 'partial';
  }>;
  notes?: string;
}

export const saveQuickComparison = async (comparison: QuickComparison): Promise<void> => {
  const savedComparisons = await getQuickComparisons();
  const updatedComparisons = [...savedComparisons.filter(c => c.id !== comparison.id), comparison];
  await storeData(STORAGE_KEYS.QUICK_COMPARISONS, updatedComparisons);
};

export const getQuickComparisons = async (): Promise<QuickComparison[]> => {
  return await getData<QuickComparison[]>(STORAGE_KEYS.QUICK_COMPARISONS) || [];
};

export const deleteQuickComparison = async (id: string): Promise<void> => {
  const savedComparisons = await getQuickComparisons();
  const updatedComparisons = savedComparisons.filter(c => c.id !== id);
  await storeData(STORAGE_KEYS.QUICK_COMPARISONS, updatedComparisons);
};

// Detail Comparisons
export interface DetailComparison {
  id: string;
  title: string;
  date: string;
  criteria: Array<{
    id: string;
    text: string;
  }>;
  options: Array<{
    id: string;
    name: string;
  }>;
  comparisonData: Array<{
    criterionId: string;
    optionId: string;
    text: string;
  }>;
  notes?: string;
}

export const saveDetailComparison = async (comparison: DetailComparison): Promise<void> => {
  const savedComparisons = await getDetailComparisons();
  const updatedComparisons = [...savedComparisons.filter(c => c.id !== comparison.id), comparison];
  await storeData(STORAGE_KEYS.DETAIL_COMPARISONS, updatedComparisons);
};

export const getDetailComparisons = async (): Promise<DetailComparison[]> => {
  return await getData<DetailComparison[]>(STORAGE_KEYS.DETAIL_COMPARISONS) || [];
};

export const deleteDetailComparison = async (id: string): Promise<void> => {
  const savedComparisons = await getDetailComparisons();
  const updatedComparisons = savedComparisons.filter(c => c.id !== id);
  await storeData(STORAGE_KEYS.DETAIL_COMPARISONS, updatedComparisons);
};

// App Theme
export interface AppTheme {
  isDarkMode: boolean;
}

export const saveAppTheme = async (theme: AppTheme): Promise<void> => {
  await storeData(STORAGE_KEYS.APP_THEME, theme);
};

export const getAppTheme = async (): Promise<AppTheme | null> => {
  return await getData<AppTheme>(STORAGE_KEYS.APP_THEME);
};

// Clear all data
export const clearAllData = async (): Promise<void> => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};

// Clear specific feature data
export const clearFeatureData = async (feature: keyof typeof STORAGE_KEYS): Promise<void> => {
  await removeData(STORAGE_KEYS[feature]);
};
