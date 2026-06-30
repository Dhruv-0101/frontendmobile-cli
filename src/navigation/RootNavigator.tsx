import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { restoreAuth } from '../features/auth/slice/authSlice';
import ROUTES from '../shared/constants/routes';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import Loader from '../shared/components/Loader/Loader';

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

  useEffect(() => {
    // ========================================================================
    // [APP EXECUTION FLOW - STEP 3A: Restore Session credentials]
    // On component mount, we fire restoreAuth() to check if the user is already logged in.
    // -> Next, execution goes to [authSlice.ts] to query AsyncStorage for keys.
    // ========================================================================
    dispatch(restoreAuth());
  }, [dispatch]);

  // ==========================================================================
  // [APP EXECUTION FLOW - STEP 3B: Loader Block]
  // While we are checking AsyncStorage for stored tokens, we freeze the UI
  // and display a loader. This prevents visual flashes of the Login page.
  // ==========================================================================
  if (isLoading) {
    return <Loader message="Verifying session..." />;
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
