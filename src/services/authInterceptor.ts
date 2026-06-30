import axios from 'axios';
import apiClient from './apiClient';
import { storage } from './storage';
import { CONFIG } from '../config';

// Flag to track if a token refresh API request is currently in progress.
// This prevents making multiple concurrent refresh-token requests if multiple API calls fail at the same time.
let isRefreshing = false;

// Queue to hold API requests that failed with a 401 (Expired Access Token)
// while we are waiting for the new access token to be fetched.
let failedQueue: Array<{
  resolve: (value: string | PromiseLike<string>) => void;
  reject: (reason?: any) => void;
}> = [];

/**
 * Processes the queue of failed requests once a token refresh attempt finishes.
 * If the refresh succeeded (token provided), we resolve all pending requests with the new token.
 * If the refresh failed (error provided), we reject all pending requests.
 */
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token); // Retries the request using the new token
    } else {
      prom.reject(error); // Fails the request with the original error
    }
  });
  failedQueue = []; // Clear the queue
};

/**
 * Configures request and response interceptors on the Axios apiClient instance.
 * Connects the interceptors to Redux to dispatch update/logout actions on token updates.
 */
export const setupInterceptors = (
  dispatch: any,
  logoutAction: () => any,
  updateTokensAction: (payload: { token: string; refreshToken: string }) => any
) => {
  
  // =========================================================================
  // 1. REQUEST INTERCEPTOR: The Header Injector
  // Analogy: Before any envelope (API call) is sent, the injector stamps it
  // with the latest security badge (accessToken) retrieved from disk storage.
  // =========================================================================
  apiClient.interceptors.request.use(
    async (config) => {
      // 1. Fetch token from AsyncStorage
      const token = await storage.getAccessToken();
      
      // 2. Inject token as Bearer header if it exists
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // =========================================================================
  // 2. RESPONSE INTERCEPTOR: The Auto-Recovery Guard (401 Handler) - STEP 8
  // Analogy: Catches delivery failures due to expired credentials,
  // halts requests, fetches new keys, and resends the failed requests.
  // =========================================================================
  apiClient.interceptors.response.use(
    (response) => response, // 2A. Success (2xx): Pass data directly back to screens/hooks.
    async (error) => {
      const originalRequest = error.config;

      // ---------------------------------------------------------------------
      // Scenario A: Access Token expired (401 Unauthorized)
      // ---------------------------------------------------------------------
      if (error.response?.status === 401 && !originalRequest._retry) {
        
        // CASE A.1: Token refresh is already in progress.
        // Queue this API call so we don't spam the server with multiple refresh requests.
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              // Retry initial call with the newly fetched token
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        // CASE A.2: First request to fail.
        // Lock refreshing flag and start the rotation cycle.
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // 1. Fetch Refresh Token from AsyncStorage
          const storedRefreshToken = await storage.getRefreshToken();
          if (!storedRefreshToken) {
            throw new Error('No refresh token available');
          }

          // 2. Query endpoint POST /users/refresh-token using raw axios
          // (to avoid entering our own interceptors recursively)
          const response = await axios.post(`${CONFIG.API_URL}/users/refresh-token`, {
            refreshToken: storedRefreshToken,
          });

          const { token: newAccessToken, refreshToken: newRefreshToken } = response.data;

          if (!newAccessToken || !newRefreshToken) {
            throw new Error('Token refresh failed: empty response');
          }

          // 3. Save new pair to disk storage
          await storage.setAccessToken(newAccessToken);
          await storage.setRefreshToken(newRefreshToken);

          // 4. Update Redux store so the whole app has the new access token
          dispatch(updateTokensAction({ token: newAccessToken, refreshToken: newRefreshToken }));

          // 5. Release all queued requests with the new access token
          processQueue(null, newAccessToken);

          // 6. Retry original failed request with the new access token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // If refresh token has also expired or is invalid, flush keys and force logout
          processQueue(refreshError, null);
          
          await storage.clearAuthData();
          dispatch(logoutAction()); // Instantly triggers redirect to Login screen
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false; // Reset lock flag
        }
      }

      // ---------------------------------------------------------------------
      // Scenario B: Forbidden / Session Revoked (403)
      // ---------------------------------------------------------------------
      if (error.response?.status === 403) {
        // Log out user immediately
        await storage.clearAuthData();
        dispatch(logoutAction());
      }

      return Promise.reject(error);
    }
  );
};
