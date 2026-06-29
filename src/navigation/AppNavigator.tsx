import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ROUTES from '../shared/constants/routes';
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.BOTTOM_TABS} component={BottomTabNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
