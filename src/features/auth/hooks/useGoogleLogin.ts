import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { useAppDispatch } from '../../../store/hooks';
import { setCredentials, setAuthError } from '../slice/authSlice';
import { storage } from '../../../services/storage';

export const useGoogleLogin = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: authApi.googleLogin,
    onSuccess: async (data) => {
      // The backend returns: { status: 'success', token, refreshToken, username, email, id, profilePicture }
      const user = {
        id: data.id,
        username: data.username,
        email: data.email,
        profilePicture: data.profilePicture || null,
      };

      // Store tokens and user in storage
      await storage.setAccessToken(data.token);
      await storage.setRefreshToken(data.refreshToken);
      await storage.setUser(user);

      // Save to Redux store
      dispatch(
        setCredentials({
          user,
          token: data.token,
          refreshToken: data.refreshToken,
        }),
      );
    },
    onError: (error: any) => {
      console.error('useGoogleLogin API call failed. Details:', error);
      if (error.response) {
        console.error('Response Data:', error.response.data);
        console.error('Response Status:', error.response.status);
      }
      const errMsg =
        error.response?.data?.message ||
        `Google Login failed: ${error.message || 'Please try again.'}`;
      dispatch(setAuthError(errMsg));
    },
  });
};

export default useGoogleLogin;
