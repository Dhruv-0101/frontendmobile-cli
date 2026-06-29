import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { useAppDispatch } from '../../../store/hooks';
import { logoutState } from '../slice/authSlice';
import { storage } from '../../../services/storage';
import { queryClient } from '../../../app/queryClient';

import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const useLogout = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: async () => {
      // Clear credentials from storage
      await storage.clearAuthData();

      // Sign out of Google if signed in
      try {
        await GoogleSignin.signOut();
      } catch (err) {
        console.log('Google Sign-Out error or not signed in:', err);
      }

      // Invalidate redux state
      dispatch(logoutState());

      // Invalidate and clear Tanstack Query cache
      queryClient.clear();
    },
  });
};

export default useLogout;
