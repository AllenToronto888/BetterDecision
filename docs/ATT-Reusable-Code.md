# ATT Implementation - Reusable Code Collection

This file contains all the code needed to implement App Tracking Transparency (ATT) in any React Native/Expo project. Copy and adapt these code snippets as needed.

## 1. ATT Context (src/context/ATTContext.tsx)

```typescript
import React, { createContext, ReactNode, useContext } from 'react';

interface ATTContextType {
  /** Whether ATT permission has been granted (null = not determined yet) */
  attPermissionGranted: boolean | null;
  /** Whether to show personalized ads based on ATT permission */
  showPersonalizedAds: boolean;
}

const ATTContext = createContext<ATTContextType | undefined>(undefined);

interface ATTProviderProps {
  children: ReactNode;
  attPermissionGranted: boolean | null;
}

export const ATTProvider: React.FC<ATTProviderProps> = ({ 
  children, 
  attPermissionGranted 
}) => {
  // Only show personalized ads if ATT permission is explicitly granted
  const showPersonalizedAds = attPermissionGranted === true;

  const value: ATTContextType = {
    attPermissionGranted,
    showPersonalizedAds,
  };

  return (
    <ATTContext.Provider value={value}>
      {children}
    </ATTContext.Provider>
  );
};

export const useATT = (): ATTContextType => {
  const context = useContext(ATTContext);
  if (context === undefined) {
    throw new Error('useATT must be used within an ATTProvider');
  }
  return context;
};
```

## 2. App.tsx Integration

```typescript
import React, { useEffect, useState } from "react";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import Constants from "expo-constants";
import { ATTProvider } from "./context/ATTContext";

// Conditionally import mobileAds to avoid Expo Go crashes
let mobileAds: any;
try {
  mobileAds = require("react-native-google-mobile-ads").default;
} catch (error) {
  console.log('AdMob module not available');
}

const App = () => {
  const [attPermissionGranted, setAttPermissionGranted] = useState<boolean | null>(null);

  // Request App Tracking Transparency permission FIRST, then initialize AdMob
  useEffect(() => {
    const initializeAppWithATT = async () => {
      try {
        // Check if we're running in Expo Go using Constants or if mobileAds is not available
        const isExpoGo = Constants.appOwnership === "expo";

        if (isExpoGo || !mobileAds) {
          console.log("AdMob not available, showing placeholder");
          setAttPermissionGranted(false);
          return;
        }

        // Request ATT permission FIRST before any data collection
        console.log("Requesting App Tracking Transparency permission...");
        const { granted } = await requestTrackingPermissionsAsync();
        setAttPermissionGranted(granted);
        
        if (granted) {
          console.log("✅ User granted tracking permission - initializing AdMob with personalized ads");
        } else {
          console.log("❌ User denied tracking permission - initializing AdMob with non-personalized ads only");
        }

        // Initialize AdMob SDK AFTER ATT permission is determined
        await mobileAds().initialize();
        console.log("AdMob SDK initialized successfully");
        
      } catch (error) {
        // Silently handle errors and default to non-personalized ads
        console.log(
          "ATT/AdMob initialization failed:",
          error instanceof Error ? error.message : String(error)
        );
        setAttPermissionGranted(false);
      }
    };

    initializeAppWithATT();
  }, []);

  return (
    <ATTProvider attPermissionGranted={attPermissionGranted}>
      {/* Your app content here */}
    </ATTProvider>
  );
};

export default App;
```

## 3. AdMob Banner Component (src/components/AdMobBanner.tsx)

```typescript
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useATT } from '../context/ATTContext';

// Conditionally import admob to avoid Expo Go crashes
let admob: any;
let BannerAd: any, BannerAdSize: any, TestIds: any;
let hasAdMob = false;

try {
  admob = require('react-native-google-mobile-ads');
  BannerAd = admob.BannerAd;
  BannerAdSize = admob.BannerAdSize;
  TestIds = admob.TestIds;
  hasAdMob = true;
} catch (error) {
  console.log('AdMob not available, showing placeholder');
}

interface AdMobBannerProps {
  /** Custom style for the container */
  style?: any;
  /** Banner size - defaults to FULL_BANNER */
  size?: any;
  /** Whether to show personalized ads - defaults to false for privacy compliance */
  showPersonalizedAds?: boolean;
  /** iOS Banner Ad Unit ID */
  iosUnitId?: string;
  /** Android Banner Ad Unit ID */
  androidUnitId?: string;
}

const AdMobBanner: React.FC<AdMobBannerProps> = ({
  style,
  size = hasAdMob ? BannerAdSize?.FULL_BANNER : 'FULL_BANNER',
  showPersonalizedAds: propShowPersonalizedAds,
  iosUnitId = "YOUR_IOS_AD_UNIT_ID", // Replace with your actual iOS ad unit ID
  androidUnitId = "YOUR_ANDROID_AD_UNIT_ID", // Replace with your actual Android ad unit ID
}) => {
  // Use ATT context to determine if personalized ads should be shown
  const { showPersonalizedAds: attShowPersonalizedAds } = useATT();
  
  // Use prop value if provided, otherwise use ATT context value
  const showPersonalizedAds = propShowPersonalizedAds !== undefined 
    ? propShowPersonalizedAds 
    : attShowPersonalizedAds;

  // Use test ads in development, real ads in production
  const getAdUnitId = () => {
    if (__DEV__ && hasAdMob) {
      return TestIds.BANNER;
    }
    return Platform.OS === 'ios' ? iosUnitId : androidUnitId;
  };

  // Show placeholder in Expo Go
  if (!hasAdMob) {
    return (
      <View style={[styles.container, styles.placeholder, style]}>
        <Text style={styles.placeholderText}>
          📱 AdMob Banner (Development Build Required)
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={getAdUnitId()}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: !showPersonalizedAds,
        }}
        onAdLoaded={() => {
          console.log('AdMob Banner loaded successfully');
        }}
        onAdFailedToLoad={(error) => {
          console.log('AdMob Banner Error:', error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  placeholder: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    paddingVertical: 20,
    paddingHorizontal: 16,
    minHeight: 50,
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default AdMobBanner;
```

## 4. Package.json Dependencies

```json
{
  "dependencies": {
    "expo-tracking-transparency": "~5.2.4",
    "react-native-google-mobile-ads": "^15.7.0"
  }
}
```

## 5. app.json Configuration

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "YOUR_ANDROID_APP_ID",
          "iosAppId": "YOUR_IOS_APP_ID"
        }
      ],
      [
        "expo-tracking-transparency",
        {
          "userTrackingPermission": "This identifier will be used to deliver personalized ads to you."
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSUserTrackingUsageDescription": "This identifier will be used to deliver personalized ads to you."
      }
    }
  }
}
```

## 6. Usage in Components

```typescript
import React from 'react';
import { View } from 'react-native';
import AdMobBanner from './components/AdMobBanner';

const MyScreen = () => {
  return (
    <View>
      {/* AdMobBanner will automatically respect ATT permission */}
      <AdMobBanner />
      
      {/* Or explicitly control personalized ads */}
      <AdMobBanner showPersonalizedAds={true} />
    </View>
  );
};

export default MyScreen;
```

## 7. Testing Commands

```bash
# Install dependencies
npm install expo-tracking-transparency react-native-google-mobile-ads

# Build development version (ATT doesn't work in Expo Go)
eas build --platform ios --profile development

# Or build for both platforms
eas build --platform all --profile development
```

## 8. Key Points for Implementation

1. **ATT Permission First**: Always request ATT permission before initializing any tracking SDK
2. **Context Pattern**: Use React Context to share ATT status across the app
3. **Default to Privacy**: Default to non-personalized ads for maximum privacy compliance
4. **Error Handling**: Gracefully handle cases where AdMob is not available
5. **Testing**: Test on physical devices, not simulators (ATT doesn't work in simulators)

## 9. Customization Notes

- Replace `YOUR_IOS_AD_UNIT_ID` and `YOUR_ANDROID_AD_UNIT_ID` with your actual AdMob ad unit IDs
- Replace `YOUR_IOS_APP_ID` and `YOUR_ANDROID_APP_ID` with your actual AdMob app IDs
- Customize the ATT permission message in `app.json` to match your app's purpose
- Adjust the AdMobBanner styling to match your app's design

## 10. Apple Store Compliance

This implementation ensures:
- ✅ ATT permission requested before any tracking data collection
- ✅ Proper NSUserTrackingUsageDescription configured
- ✅ AdMob initialization happens after ATT permission
- ✅ Non-personalized ads shown when permission denied
- ✅ Clear permission messaging for users
