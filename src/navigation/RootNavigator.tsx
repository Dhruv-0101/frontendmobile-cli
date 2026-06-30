import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { restoreAuth } from '../features/auth/slice/authSlice';
import ROUTES from '../shared/constants/routes';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import SplashScreen from '../shared/components/SplashScreen/SplashScreen';

const Stack = createNativeStackNavigator();

// ============================================================================
// [APP EXECUTION FLOW - STEP 3: Root Navigator Routing]
// This component manages the highest level of screen routing.
// It decides whether to show the Loading screen, the Auth flow, or the App flow.
// ============================================================================
export const RootNavigator = () => {
  const dispatch = useAppDispatch();
  // Get authentication state from the Redux store
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    // ========================================================================
    // [APP EXECUTION FLOW - STEP 3A: Restore Session credentials]
    // On component mount, we fire restoreAuth() to check if the user is already logged in.
    // -> Next, execution goes to [authSlice.ts] to query AsyncStorage for keys.
    // ========================================================================
    dispatch(restoreAuth());

    // Keep splash screen visible for 2 seconds for a premium look
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [dispatch]);

  // ==========================================================================
  // [APP EXECUTION FLOW - STEP 3B: Loader Block]
  // While we are checking AsyncStorage for stored tokens or during startup animation,
  // we show the brand splash screen. This prevents visual flashes.
  // ==========================================================================
  if (isLoading || isSplashVisible) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* ===================================================================
            [APP EXECUTION FLOW - STEP 3C: Gatekeeper check]
            Once isLoading is false, we inspect isAuthenticated:
            - If true: Mount AppNavigator (goes to Home / Dashboard screens).
            - If false: Mount AuthNavigator (goes to Login / Register screens).
            =================================================================== */}
        {isAuthenticated ? (
          <Stack.Screen name={ROUTES.APP_STACK} component={AppNavigator} />
        ) : (
          <Stack.Screen name={ROUTES.AUTH_STACK} component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
