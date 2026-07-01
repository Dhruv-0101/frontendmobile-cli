import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { authApi } from '../api/authApi';
import { useAppDispatch } from '../../../store/hooks';
import { setCredentials, logoutState, setAuthError } from '../slice/authSlice';
import { storage } from '../../../services/storage';
import { queryClient } from '../../../app/queryClient';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import ROUTES from '../../../shared/constants/routes';

/**
 * Hook to handle standard credential-based user registration.
 */
export const useRegister = () => {
  return useMutation({
    mutationFn: authApi.register,
  });
};

/**
 * Hook to handle standard credential-based user login.
 */
export const useLogin = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();

  return useMutation({
    // ========================================================================
    // [APP EXECUTION FLOW - STEP 6: Backend Auth API Request]
    // Triggers network call: POST /users/login-user.
    // ========================================================================
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      // ======================================================================
      // [APP EXECUTION FLOW - STEP 6A: 2FA Detour Challenge]
      // If 2FA is active, backend blocks direct access and returns '2fa_required'.
      // Redirects user to enter their OTP. -> Next, goes to [TwoFactorScreen.tsx].
      // ======================================================================
      if (data.status === '2fa_required') {
        navigation.navigate(ROUTES.TWO_FACTOR, { tempToken: data.tempToken });
        return;
      }

      // ======================================================================
      // [APP EXECUTION FLOW - STEP 6B: Direct Login Success & Storage]
      // 1. Prepare user model profile data
      // ======================================================================
      const user = {
        id: data.id,
        username: data.username,
        email: data.email,
        profilePicture: data.profilePicture || null,
        isAdmin: !!data.isAdmin,
        hasSelectedPlan: !!data.hasSelectedPlan,
        planId: data.planId ? Number(data.planId) : null,
        isTwoFactorEnabled: !!data.isTwoFactorEnabled,
      };

      // 2. Save rotated session keys permanently to device disk
      await storage.setAccessToken(data.token);
      await storage.setRefreshToken(data.refreshToken);
      await storage.setUser(user);

      // 3. Save to Redux store.
      // -> This updates isAuthenticated to true, causing [RootNavigator.tsx] (STEP 3C) to mount the App stack.
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

/**
 * Hook to handle native Google Sign-in authentication.
 */
export const useGoogleLogin = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();

  return useMutation({
    // ========================================================================
    // [APP EXECUTION FLOW - STEP 6C: Google API request (Unified)]
    // Passes Google's signed ID token to backend POST /users/auth/google-mobile.
    // The server checks identity, registers the user if new, and returns keys.
    // ========================================================================
    mutationFn: (idToken: string) => authApi.googleLogin(idToken),
    onSuccess: async (data) => {
      // ======================================================================
      // [APP EXECUTION FLOW - STEP 6D: Google 2FA Detour Challenge]
      // If 2FA is active, detours user to OTP verification screen.
      // -> Next, goes to [TwoFactorScreen.tsx].
      // ======================================================================
      if (data.status === '2fa_required') {
        navigation.navigate(ROUTES.TWO_FACTOR, { tempToken: data.tempToken });
        return;
      }

      // ======================================================================
      // [APP EXECUTION FLOW - STEP 6E: Google Success & Storage]
      // 1. Prepare user details payload
      // ======================================================================
      const user = {
        id: data.id,
        username: data.username,
        email: data.email,
        profilePicture: data.profilePicture || null,
        isAdmin: !!data.isAdmin,
        hasSelectedPlan: !!data.hasSelectedPlan,
        planId: data.planId ? Number(data.planId) : null,
        isTwoFactorEnabled: !!data.isTwoFactorEnabled,
      };

      // 2. Save tokens permanently to device memory (AsyncStorage)
      await storage.setAccessToken(data.token);
      await storage.setRefreshToken(data.refreshToken);
      await storage.setUser(user);

      // 3. Update active Redux store state.
      // -> Updates isAuthenticated to true, causing [RootNavigator.tsx] (STEP 3C) to mount AppNavigator.
      dispatch(
        setCredentials({
          user,
          token: data.token,
          refreshToken: data.refreshToken,
        }),
      );
    },
  });
};

/**
 * Hook to handle 2FA verification challenge.
 */
export const useVerify2FA = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: authApi.verify2FA,
    onSuccess: async (data) => {
      // ======================================================================
      // [APP EXECUTION FLOW - STEP 7A: 2FA Verification Success & Final Access]
      // Runs when 2FA code is confirmed by backend. Stores final keys and dispatches
      // to Redux, unlocking the main screen flow (RootNavigator Step 3C).
      // ======================================================================
      const user = {
        id: data.id,
        username: data.username,
        email: data.email,
        profilePicture: data.profilePicture || null,
        isAdmin: !!data.isAdmin,
        hasSelectedPlan: !!data.hasSelectedPlan,
        planId: data.planId ? Number(data.planId) : null,
        isTwoFactorEnabled: true,
      };

      // Save rotated session keys permanently
      await storage.setAccessToken(data.token);
      await storage.setRefreshToken(data.refreshToken);
      await storage.setUser(user);

      // Save details to Redux state
      dispatch(
        setCredentials({
          user,
          token: data.token,
          refreshToken: data.refreshToken,
        }),
      );
    },
  });
};

/**
 * Hook to handle user sign out.
 */
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
