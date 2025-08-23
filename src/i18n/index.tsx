import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import * as Localization from 'expo-localization';
import { t, SupportedLanguage } from './translations';

// Get device language
export const getDeviceLanguage = (): SupportedLanguage => {
  try {
    const deviceLanguage = Localization.locale;
    console.log('🌍 [i18n] Device language detected:', deviceLanguage);
    
    // Map device locales to our supported languages
    const languageMap: { [key: string]: SupportedLanguage } = {
      'en': 'en',
      'en-US': 'en',
      'en-GB': 'en',
      'en-CA': 'en',
      'en-AU': 'en',
      'es': 'es',
      'es-ES': 'es',
      'es-MX': 'es',
      'es-AR': 'es',
      'es-CO': 'es',
      'fr': 'fr',
      'fr-FR': 'fr',
      'fr-CA': 'fr',
      'fr-BE': 'fr',
      'zh-CN': 'zh-Hans',
      'zh-SG': 'zh-Hans',
      'zh-Hans': 'zh-Hans',
      'zh-Hans-CN': 'zh-Hans',
      'zh-Hans-SG': 'zh-Hans',
      'zh-TW': 'zh-Hant',
      'zh-HK': 'zh-Hant',
      'zh-MO': 'zh-Hant',
      'zh-Hant': 'zh-Hant',
      'zh-Hant-TW': 'zh-Hant',
      'zh-Hant-HK': 'zh-Hant',
      'zh-Hant-MO': 'zh-Hant',
      'ja': 'ja',
      'ja-JP': 'ja',
    };
    
    // First try exact match, then try language code only
    const mappedLanguage = languageMap[deviceLanguage] || languageMap[deviceLanguage.split('-')[0]] || 'en';
    console.log(`🌍 [i18n] Language mapping: ${deviceLanguage} → ${mappedLanguage}`);
    return mappedLanguage;
  } catch (error) {
    console.log('🌍 [i18n] Could not detect device language, defaulting to English:', error);
    return 'en';
  }
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
