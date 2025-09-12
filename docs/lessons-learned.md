# React Native App Crash Debugging - Lessons Learned

## Issue Summary
Our React Native app (Better Decision) was crashing immediately on launch in production builds, despite working fine in development. The crash occurred before the splash screen appeared, making it difficult to diagnose.

## Root Causes Identified

### 1. Metro Configuration Issues
- **Problem**: Incorrect configuration for Hermes JavaScript engine
- **Solution**: Enable Hermes and New Architecture support properly
- **Code Fix**:
```javascript
// Enable Hermes and New Architecture support for React Native 0.79.5 + Expo SDK 53
// This is the modern recommended configuration for performance and compatibility
```

### 2. Language File Issues
- **Problem**: Duplicate translation keys in language files causing JavaScript runtime errors
- **Solution**: Fix duplicate keys and standardize naming conventions
- **Examples**:
  - `item` → `itemName`
  - Removed duplicate `error` and `cancel` keys

### 3. App Tracking Transparency Implementation
- **Problem**: Incorrect implementation of ATT permission request
- **Solution**: Proper implementation with delayed request
- **Code Fix**:
```javascript
// Request App Tracking Transparency permission on iOS
useEffect(() => {
  (async () => {
    setTimeout(async () => {
      const { granted } = await requestTrackingPermissionsAsync();
      if (granted) {
        console.log("Yay! I have user permission to track data");
      }
    }, 1000);
  })();
}, []);
```

### 4. Package Configuration
- **Problem**: Incorrect script commands in package.json
- **Solution**: Changed from `expo start` to `expo run`
- **Why**: Required for running with native modules in newer Expo versions

### 5. AdMob Implementation
- **Problem**: Dynamic require causing issues in production builds
- **Solution**: Proper static imports
- **Code Fix**:
```javascript
import * as admob from 'react-native-google-mobile-ads';
```

### 6. Build Number Management
- **Problem**: Manual build number management causing issues
- **Solution**: Added auto-increment for build numbers
- **Code Fix**:
```json
"autoIncrement": true
```

## Key Takeaways

1. **JavaScript Engine Configuration**: Properly configure Hermes for production builds
2. **Language Files**: Check for duplicate keys and proper formatting in translation files
3. **Permission Requests**: Implement with proper timing (delayed) and error handling
4. **Import Patterns**: Use static imports instead of dynamic requires in production
5. **Build Configuration**: Use auto-increment for build numbers
6. **Script Commands**: Use appropriate commands for native module support

## Debugging Approach for Future Issues

1. Check language files for duplicate keys
2. Verify metro configuration is appropriate for your React Native version
3. Ensure proper static imports for all native modules
4. Use proper timing for permission requests
5. Enable auto-increment for build numbers

## References
- [React Native New Architecture Documentation](https://reactnative.dev/docs/the-new-architecture/landing-page)
- [Expo Tracking Transparency Documentation](https://docs.expo.dev/versions/latest/sdk/tracking-transparency/)
- [Hermes Engine Documentation](https://reactnative.dev/docs/hermes)
