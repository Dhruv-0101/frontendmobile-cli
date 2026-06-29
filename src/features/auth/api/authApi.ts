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
};
