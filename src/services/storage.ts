import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

export const storage = {
  getAccessToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (e) {
      console.error('Error reading access token from storage', e);
      return null;
    }
  },

  setAccessToken: async (token: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
    } catch (e) {
      console.error('Error writing access token to storage', e);
    }
  },

  getRefreshToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (e) {
      console.error('Error reading refresh token from storage', e);
      return null;
    }
  },

  setRefreshToken: async (token: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (e) {
      console.error('Error writing refresh token to storage', e);
    }
  },

  getUser: async (): Promise<any | null> => {
    try {
      const userStr = await AsyncStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('Error reading user from storage', e);
      return null;
    }
  },

  setUser: async (user: any): Promise<void> => {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error writing user to storage', e);
    }
  },

  clearAuthData: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
    } catch (e) {
      console.error('Error clearing auth data from storage', e);
    }
  },
};
