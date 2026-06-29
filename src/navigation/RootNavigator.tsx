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

export const RootNavigator = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Dispatch thunk to restore credentials from AsyncStorage
    dispatch(restoreAuth());
  }, [dispatch]);

  if (isLoading) {
    return <Loader message="Verifying session..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
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
