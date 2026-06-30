import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import ROUTES from '../shared/constants/routes';
import COLORS from '../shared/constants/colors';
import HomeScreen from '../features/home/screens/HomeScreen';
import PostsScreen from '../features/posts/screens/PostsScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import WritePostScreen from '../features/posts/screens/WritePostScreen';
import { HomeIcon, FeedIcon, WriteIcon } from '../shared/components/Icons';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          if (route.name === ROUTES.HOME) {
            return <HomeIcon color={color} size={size - 2} />;
          } else if (route.name === ROUTES.POSTS) {
            return <FeedIcon color={color} size={size - 2} />;
          } else if (route.name === ROUTES.WRITE) {
            return <WriteIcon color={color} size={size - 2} />;
          }
          return null;
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: 4,
        },
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: COLORS.textLightSecondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.borderLight,
          backgroundColor: COLORS.white,
          height: 56,
          paddingTop: 6,
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
