import axios from 'axios';
import apiClient from './apiClient';
import { storage } from './storage';
import { CONFIG } from '../config';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | PromiseLike<string>) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

export const setupInterceptors = (
  dispatch: any,
  logoutAction: () => any,
  updateTokensAction: (payload: { token: string; refreshToken: string }) => any
) => {
  // Request Interceptor
  apiClient.interceptors.request.use(
    async (config) => {
      const token = await storage.getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Handle 401 Unauthorized - access token expired
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const storedRefreshToken = await storage.getRefreshToken();
          if (!storedRefreshToken) {
            throw new Error('No refresh token available');
          }

          // Use raw axios to prevent interceptor loop
          const response = await axios.post(`${CONFIG.API_URL}/users/refresh-token`, {
            refreshToken: storedRefreshToken,
          });

          const { token: newAccessToken, refreshToken: newRefreshToken } = response.data;

          if (!newAccessToken || !newRefreshToken) {
            throw new Error('Token refresh failed: empty response');
          }

          // Save credentials in storage (rotates both)
          await storage.setAccessToken(newAccessToken);
          await storage.setRefreshToken(newRefreshToken);

          // Update Redux state
          dispatch(updateTokensAction({ token: newAccessToken, refreshToken: newRefreshToken }));

          processQueue(null, newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          
          // Clear storage and dispatch logout
          await storage.clearAuthData();
          dispatch(logoutAction());
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Handle 403 Forbidden - refresh token reuse / invalid session
      if (error.response?.status === 403) {
        await storage.clearAuthData();
        dispatch(logoutAction());
      }

      return Promise.reject(error);
    }
  );
};
