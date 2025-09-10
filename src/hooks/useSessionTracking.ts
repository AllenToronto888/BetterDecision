import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const STORAGE_KEYS = {
  SESSION_COUNT: '@app_session_count',
  LAST_SESSION_DATE: '@app_last_session_date',
  RATE_US_SHOWN: '@app_rate_us_shown',
  RATE_US_DISMISSED: '@app_rate_us_dismissed',
};

const SESSIONS_BEFORE_RATE_POPUP = 10; // Show after 10 sessions (earlier engagement)
const MIN_DAYS_BETWEEN_POPUPS = 10; // Don't show again for 10 days if dismissed

interface SessionData {
  sessionCount: number;
  shouldShowRateUs: boolean;
  hasRated: boolean;
}

export const useSessionTracking = (): SessionData => {
  const [sessionCount, setSessionCount] = useState(0);
  const [shouldShowRateUs, setShouldShowRateUs] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      // Get current session data
      const storedSessionCount = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_COUNT);
      const lastSessionDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SESSION_DATE);
      const rateUsShown = await AsyncStorage.getItem(STORAGE_KEYS.RATE_US_SHOWN);
      const rateUsDismissed = await AsyncStorage.getItem(STORAGE_KEYS.RATE_US_DISMISSED);

      const currentDate = new Date().toDateString();
      const lastDate = lastSessionDate || '';
      
      let currentSessionCount = parseInt(storedSessionCount || '0', 10);
      
      // Only increment session if it's a new day (prevents multiple increments per day)
      if (lastDate !== currentDate) {
        currentSessionCount += 1;
        await AsyncStorage.setItem(STORAGE_KEYS.SESSION_COUNT, currentSessionCount.toString());
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_SESSION_DATE, currentDate);
        
        console.log(`📊 Session ${currentSessionCount} started on ${currentDate}`);
      }

      setSessionCount(currentSessionCount);

      // Check if we should show rate us popup
      const shouldShow = await shouldShowRateUsPopup(
        currentSessionCount,
        rateUsShown,
        rateUsDismissed
      );
      
      setShouldShowRateUs(shouldShow);
      setHasRated(rateUsShown === 'true');

    } catch (error) {
      console.error('Error initializing session:', error);
    }
  };

  const shouldShowRateUsPopup = async (
    sessionCount: number,
    rateUsShown: string | null,
    rateUsDismissed: string | null
  ): Promise<boolean> => {
    // Don't show if already rated or permanently dismissed
    if (rateUsShown === 'true' || rateUsShown === 'never_show_again') {
      return false;
    }

    // Don't show if not enough sessions
    if (sessionCount < SESSIONS_BEFORE_RATE_POPUP) {
      return false;
    }

    // Check if dismissed recently
    if (rateUsDismissed) {
      const dismissedDate = new Date(rateUsDismissed);
      const daysSinceDismissed = Math.floor(
        (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceDismissed < MIN_DAYS_BETWEEN_POPUPS) {
        return false;
      }
    }

    return true;
  };

  return {
    sessionCount,
    shouldShowRateUs,
    hasRated,
  };
};

// Helper functions for the RateUsComponent to use
export const markRateUsShown = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.RATE_US_SHOWN, 'true');
    console.log('📊 Rate us marked as shown/completed');
  } catch (error) {
    console.error('Error marking rate us as shown:', error);
  }
};

export const markRateUsDismissed = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.RATE_US_DISMISSED, new Date().toISOString());
    console.log('📊 Rate us marked as dismissed');
  } catch (error) {
    console.error('Error marking rate us as dismissed:', error);
  }
};


// Debug function to reset session data (for testing)
export const resetSessionData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.SESSION_COUNT,
      STORAGE_KEYS.LAST_SESSION_DATE,
      STORAGE_KEYS.RATE_US_SHOWN,
      STORAGE_KEYS.RATE_US_DISMISSED,
    ]);
    console.log('📊 Session data reset');
  } catch (error) {
    console.error('Error resetting session data:', error);
  }
};
