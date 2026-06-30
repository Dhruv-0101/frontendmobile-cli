import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ROUTES from '../shared/constants/routes';
import BottomTabNavigator from './BottomTabNavigator';
import TwoFactorSetupScreen from '../features/auth/screens/TwoFactorSetupScreen';
import MyPostsScreen from '../features/profile/screens/MyPostsScreen';
import MyFollowersScreen from '../features/profile/screens/MyFollowersScreen';
import MyFollowingScreen from '../features/profile/screens/MyFollowingScreen';
import MyEarningsScreen from '../features/profile/screens/MyEarningsScreen';
import AdminPanelScreen from '../features/profile/screens/AdminPanelScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.BOTTOM_TABS} component={BottomTabNavigator} />
      <Stack.Screen 
        name={ROUTES.TWO_FACTOR_SETUP} 
        component={TwoFactorSetupScreen} 
        options={{ headerShown: true, title: 'Two-Factor Setup' }} 
      />
      <Stack.Screen 
        name={ROUTES.MY_POSTS} 
        component={MyPostsScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name={ROUTES.MY_FOLLOWERS} 
        component={MyFollowersScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name={ROUTES.MY_FOLLOWING} 
        component={MyFollowingScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name={ROUTES.MY_EARNINGS} 
        component={MyEarningsScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name={ROUTES.ADMIN_PANEL} 
        component={AdminPanelScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
