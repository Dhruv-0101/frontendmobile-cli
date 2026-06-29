import { useMutation } from '@tanstack/react-query';
import { authApi, LoginCredentials } from '../api/authApi';
import { useAppDispatch } from '../../../store/hooks';
import { setCredentials, setAuthError } from '../slice/authSlice';
import { storage } from '../../../services/storage';

export const useLogin = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async data => {
      // The backend returns: { status: 'success', token, refreshToken, username, email, id }
      const user = {
        id: data.id,
        username: data.username,
        email: data.email,
        profilePicture: data.profilePicture || null,
      };

      // Store in AsyncStorage (token rotation stores both)
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
      const errMsg =
        error.response?.data?.message ||
        'Login failed. Please check your credentials.';
      dispatch(setAuthError(errMsg));
    },
  });
};

export default useLogin;
