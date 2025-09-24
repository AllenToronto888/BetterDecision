import { getTrackingPermissionsAsync, requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { Platform } from 'react-native';


export interface ATTPermissionResult {
  granted: boolean;
  status: 'granted' | 'denied' | 'restricted' | 'undetermined';
  source: 'immediate' | 'delayed' | 'retry' | 'cached';
}

//for iPadOS compatibility
export const requestATTPermissionWithTimeout = async (
  timeoutMs: number = 5000,
  maxRetries: number = 2
): Promise<ATTPermissionResult> => {
  
  // First check if we already have permission
  try {
    const existingPermission = await getTrackingPermissionsAsync();
    if (existingPermission.status !== 'undetermined') {
      console.log(`ATT permission already determined: ${existingPermission.status}`);
      return {
        granted: existingPermission.granted,
        status: existingPermission.status as any,
        source: 'cached'
      };
    }
  } catch (error) {
    console.log('⚠️ Error checking existing ATT permission:', error);
  }

  // Request permission with timeout and retry logic
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {      
      const permissionPromise = requestTrackingPermissionsAsync();
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('ATT_TIMEOUT')), timeoutMs);
      });

      // Race between permission request and timeout
      const result = await Promise.race([permissionPromise, timeoutPromise]);
      
      console.log(`✅ ATT permission granted: ${result.granted}, status: ${result.status}`);
      return {
        granted: result.granted,
        status: result.status as any,
        source: attempt === 0 ? 'immediate' : 'retry'
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`ATT permission attempt ${attempt + 1} failed:`, errorMessage);
      
      if (errorMessage === 'ATT_TIMEOUT') {
        console.log('ATT permission request timed out');
        if (attempt < maxRetries) {
          console.log(`Retrying ATT permission request in 1 second...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
      }
      
      // If this is the last attempt, return denied
      if (attempt === maxRetries) {
        console.log('❌ All ATT permission attempts failed, defaulting to denied');
        return {
          granted: false,
          status: 'denied',
          source: 'retry'
        };
      }
    }
  }

  // Fallback (should never reach here)
  return {
    granted: false,
    status: 'denied',
    source: 'retry'
  };
};


export const isIPadOS = (): boolean => {
  return Platform.OS === 'ios' && Platform.isPad === true;
};

export const getATTTimeout = (): number => {
  if (isIPadOS()) {
    return 3000; // 3 seconds
  }
  return 5000; // 5 seconds for iPhone
};

export const requestImmediateATTPermission = async (): Promise<ATTPermissionResult> => {
  console.log('🚀 Requesting immediate ATT permission for Apple review compliance...');
  
  const timeout = getATTTimeout();
  const maxRetries = isIPadOS() ? 1 : 2; // Less retries on iPadOS to avoid delays
  
  const result = await requestATTPermissionWithTimeout(timeout, maxRetries);
  
  if (isIPadOS()) {
    console.log('📱 iPadOS detected - ATT permission requested with optimized timing');
  }
  
  return result;
};

export const requestDelayedATTPermission = async (): Promise<ATTPermissionResult | null> => {
  console.log('Checking if delayed ATT permission request is needed...');
  
  try {
    const existingPermission = await getTrackingPermissionsAsync();
    
    if (existingPermission.status === 'undetermined') {
      console.log('ATT permission still undetermined, requesting after onboarding...');
      return await requestATTPermissionWithTimeout(5000, 1);
    } else {
      console.log(`ATT permission already determined: ${existingPermission.status}`);
      return {
        granted: existingPermission.granted,
        status: existingPermission.status as any,
        source: 'cached'
      };
    }
  } catch (error) {
    console.log('Error in delayed ATT permission request:', error);
    return null;
  }
};


