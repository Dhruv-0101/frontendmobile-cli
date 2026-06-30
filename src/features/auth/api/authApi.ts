import apiClient from '../../../services/apiClient';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post('/users/login-user', credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials) => {
    const response = await apiClient.post('/users/create-user', credentials);
    return response.data;
  },

  googleLogin: async (idToken: string) => {
    const response = await apiClient.post('/users/auth/google-mobile', { idToken });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/users/logout');
    return response.data;
  },

  setup2FA: async () => {
    const response = await apiClient.post('/users/2fa/setup');
    return response.data;
  },

  enable2FA: async (data: { secret: string; code: string }) => {
    const response = await apiClient.post('/users/2fa/enable', data);
    return response.data;
  },

  disable2FA: async (code: string) => {
    const response = await apiClient.post('/users/2fa/disable', { code });
    return response.data;
  },

  verify2FA: async (data: { tempToken: string; code: string }) => {
    const response = await apiClient.post('/users/2fa/verify', data);
    return response.data;
  },
};
