import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import ROUTES from '../shared/constants/routes';
import COLORS from '../shared/constants/colors';
import HomeScreen from '../features/home/screens/HomeScreen';
import PostsScreen from '../features/posts/screens/PostsScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import WritePostScreen from '../features/posts/screens/WritePostScreen';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, size }) => {
          let iconText = '';
          if (route.name === ROUTES.HOME) {
            iconText = focused ? '🏠' : '🏡';
          } else if (route.name === ROUTES.POSTS) {
            iconText = focused ? '📰' : '🗞️';
          } else if (route.name === ROUTES.WRITE) {
            iconText = focused ? '✍️' : '✏️';
          }
          return <Text style={{ fontSize: size }}>{iconText}</Text>;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLightSecondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.borderLight,
          backgroundColor: COLORS.white,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      })}
    >
      <Tab.Screen name={ROUTES.HOME} component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name={ROUTES.POSTS} component={PostsScreen} options={{ title: 'Feed' }} />
      <Tab.Screen name={ROUTES.WRITE} component={WritePostScreen} options={{ title: 'Write' }} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
