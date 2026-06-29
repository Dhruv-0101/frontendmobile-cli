import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { storage } from '../../../services/storage';

export interface UserState {
  id: number;
  username: string;
  email?: string;
  profilePicture?: string | null;
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

// Async thunk to restore auth state from storage on app launch
export const restoreAuth = createAsyncThunk('auth/restoreAuth', async (_, { rejectWithValue }) => {
  try {
    const accessToken = await storage.getAccessToken();
    const refreshToken = await storage.getRefreshToken();
    const user = await storage.getUser();

    if (accessToken && refreshToken && user) {
      return { token: accessToken, refreshToken, user };
    }
    return null;
  } catch (e) {
    return rejectWithValue('Failed to restore auth credentials');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: UserState; token: string; refreshToken: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    updateTokens: (
      state,
      action: PayloadAction<{ token: string; refreshToken: string }>
    ) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
    },
    logoutState: (state) => {
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(restoreAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
        }
        state.isLoading = false;
      })
      .addCase(restoreAuth.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { setCredentials, updateTokens, logoutState, setAuthLoading, setAuthError } =
  authSlice.actions;

export default authSlice.reducer;
