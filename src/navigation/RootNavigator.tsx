import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { requestATTPermission } from '../App';
import { useATT } from '../context/ATTContext';
import { useTheme } from '../context/ThemeContext';
import OnboardingScreen1 from '../screens/onboarding/OnboardingScreen1';
import OnboardingScreen2 from '../screens/onboarding/OnboardingScreen2';
import OnboardingScreen3 from '../screens/onboarding/OnboardingScreen3';
import { isOnboardingCompleted, setOnboardingCompleted } from '../utils/onboarding';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { theme } = useTheme();
  const { updateATTPermission } = useATT();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await isOnboardingCompleted();
      setShowOnboarding(!completed);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to showing onboarding if there's an error
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await setOnboardingCompleted();
      
      // Request ATT permission after onboarding is completed
      const attGranted = await requestATTPermission();
      updateATTPermission(attGranted);
      
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const handleOnboardingCancel = () => {
    // User cancelled onboarding, go directly to main app
    setShowOnboarding(false);
  };

  // Show loading state while checking onboarding status
  if (showOnboarding === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {showOnboarding ? (
        <>
          <Stack.Screen name="OnboardingScreen1">
            {({ navigation }) => (
              <OnboardingScreen1
                onNext={() => navigation.navigate('OnboardingScreen2')}
                onCancel={handleOnboardingCancel}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="OnboardingScreen2">
            {({ navigation }) => (
              <OnboardingScreen2
                onNext={() => navigation.navigate('OnboardingScreen3')}
                onBack={() => navigation.goBack()}
                onCancel={handleOnboardingCancel}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="OnboardingScreen3">
            {({ navigation }) => (
              <OnboardingScreen3
                onGetStarted={handleOnboardingComplete}
                onBack={() => navigation.goBack()}
              />
            )}
          </Stack.Screen>
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          {/* Dev access to onboarding screens */}
          <Stack.Screen name="OnboardingScreen1">
            {({ navigation }) => (
              <OnboardingScreen1
                onNext={() => navigation.navigate('OnboardingScreen2')}
                onCancel={() => navigation.goBack()}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="OnboardingScreen2">
            {({ navigation }) => (
              <OnboardingScreen2
                onNext={() => navigation.navigate('OnboardingScreen3')}
                onBack={() => navigation.goBack()}
                onCancel={() => navigation.navigate('Main')}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="OnboardingScreen3">
            {({ navigation }) => (
              <OnboardingScreen3
                onGetStarted={() => navigation.navigate('Main')}
                onBack={() => navigation.goBack()}
              />
            )}
          </Stack.Screen>
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
