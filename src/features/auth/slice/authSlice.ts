import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { storage } from '../../../services/storage';

export interface UserState {
  id: number;
  username: string;
  email?: string;
  profilePicture?: string | null;
  isAdmin?: boolean;
  hasSelectedPlan?: boolean;
  planId?: number | null;
  isTwoFactorEnabled?: boolean;
}

export interface AuthState {
  user: UserState | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// ============================================================================
// [APP EXECUTION FLOW - STEP 4: Auth Slice & AsyncStorage Check]
// This thunk queries AsyncStorage to see if the user was logged in previously.
// ============================================================================
export const restoreAuth = createAsyncThunk(
  'auth/restoreAuth',
  async (_, { rejectWithValue }) => {
    try {
      // 1. Fetch credentials from physical disk storage
      const accessToken = await storage.getAccessToken();
      const refreshToken = await storage.getRefreshToken();
      const user = await storage.getUser();

      // 2. If credentials exist, return them to be saved in Redux state (in extraReducers below)
      if (accessToken && refreshToken && user) {
        return { token: accessToken, refreshToken, user };
      }
      return null;
    } catch (e) {
      return rejectWithValue('Failed to restore auth credentials');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // ========================================================================
    // [APP EXECUTION FLOW - USER JOURNEY: Standard Login Success]
    // Called when a user successfully enters credentials or logs in via Google.
    // Saves user details and tokens into Redux state memory.
    // ========================================================================
    setCredentials: (
      state,
      action: PayloadAction<{
        user: UserState;
        token: string;
        refreshToken: string;
      }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    // ========================================================================
    // [APP EXECUTION FLOW - NETWORK CYCLE: Token Rotation Success]
    // Called automatically by Axios interceptor when our old Access Token
    // expired, and we fetched a new Access/Refresh pair using our Refresh Token.
    // ========================================================================
    updateTokens: (
      state,
      action: PayloadAction<{ token: string; refreshToken: string }>,
    ) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
    },
    // ========================================================================
    // [APP EXECUTION FLOW - USER JOURNEY: Logout / Session Expiration]
    // Clears all login states. Triggered when the user taps Log Out,
    // or when the refresh token expires and verification fails on the backend.
    // ========================================================================
    logoutState: state => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateUserPlan: (
      state,
      action: PayloadAction<{ hasSelectedPlan: boolean; planId: number | null }>
    ) => {
      if (state.user) {
        state.user.hasSelectedPlan = action.payload.hasSelectedPlan;
        state.user.planId = action.payload.planId;
        storage.setUser(state.user);
      }
    },
    updateTwoFactorStatus: (
      state,
      action: PayloadAction<boolean>
    ) => {
      if (state.user) {
        state.user.isTwoFactorEnabled = action.payload;
        storage.setUser(state.user);
      }
    },
  },
  // ==========================================================================
  // [APP EXECUTION FLOW - STEP 4A: AsyncStorage Results Handler]
  // Handles the result of restoreAuth() AsyncThunk.
  // ==========================================================================
  extraReducers: builder => {
    builder
      .addCase(restoreAuth.pending, state => {
        state.isLoading = true;
      })
      .addCase(restoreAuth.fulfilled, (state, action) => {
        // If keys were retrieved successfully from storage, update Redux state
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
        }
        // Finally set loading to false so RootNavigator can render the app stacks
        state.isLoading = false;
      })
      .addCase(restoreAuth.rejected, state => {
        state.isLoading = false;
      });
  },
});

export const {
  setCredentials,
  updateTokens,
  logoutState,
  setAuthLoading,
  setAuthError,
  updateUserPlan,
  updateTwoFactorStatus,
} = authSlice.actions;

export default authSlice.reducer;
