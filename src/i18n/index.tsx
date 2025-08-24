import * as Localization from 'expo-localization';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { SupportedLanguage, t } from './translations';

// Get device language
export const getDeviceLanguage = (): SupportedLanguage => {
  try {
    // Simple: Just get the device language
    const locales = Localization.getLocales();
    console.log('🌍 Device locales:', locales);
    
    if (locales && locales.length > 0) {
      const deviceLanguage = locales[0].languageTag;
      console.log('🌍 Device language detected:', deviceLanguage);
      return mapDeviceLanguage(deviceLanguage);
    }
    
    console.log('🌍 No language detected, defaulting to English');
    return 'en';
  } catch (error) {
    console.log('🌍 Language detection error:', error);
    return 'en';
  }
};

// Helper function to map device language codes to our supported languages
const mapDeviceLanguage = (deviceLanguage: string): SupportedLanguage => {
  console.log('🌍 Mapping:', deviceLanguage);
  
  // Simple mapping - check exact match first, then language code
  if (deviceLanguage.includes('zh-Hant') || deviceLanguage.includes('zh-TW') || deviceLanguage.includes('zh-HK')) {
    console.log('🌍 → Traditional Chinese');
    return 'zh-Hant';
  }
  
  if (deviceLanguage.includes('zh')) {
    console.log('🌍 → Simplified Chinese');
    return 'zh-Hans';
  }
  
  if (deviceLanguage.startsWith('es')) {
    console.log('🌍 → Spanish');
    return 'es';
  }
  
  if (deviceLanguage.startsWith('fr')) {
    console.log('🌍 → French');
    return 'fr';
  }
  
  if (deviceLanguage.startsWith('ja')) {
    console.log('🌍 → Japanese');
    return 'ja';
  }
  
  // Default to English
  console.log('🌍 → English (default)');
  return 'en';
};

// Language Context
interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  changeLanguage: (language: SupportedLanguage) => void;
  t: (key: string) => string;
  supportedLanguages: SupportedLanguage[];
  isInitialized: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Language Provider
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load device language on mount
  useEffect(() => {
    if (isInitialized) return;

    const deviceLang = getDeviceLanguage();
    console.log(`🌍 [i18n] Using device language: ${deviceLang}`);
    setCurrentLanguage(deviceLang);
    setIsInitialized(true);
  }, [isInitialized]);

  const translate = (key: string): string => {
    return t(key, currentLanguage);
  };

  const changeLanguage = (language: SupportedLanguage) => {
    console.log(`🛠️ [i18n] Changing language to ${language}`);
    setCurrentLanguage(language);
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t: translate,
    supportedLanguages: ['en', 'es', 'fr', 'zh-Hans', 'zh-Hant', 'ja'] as SupportedLanguage[],
    isInitialized
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

// Custom hook for i18n
export const useI18n = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within a LanguageProvider');
  }
  return context;
};

export { t };
export type { SupportedLanguage };

