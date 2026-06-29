import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from '../store';
import { queryClient } from './queryClient';
import { setupInterceptors } from '../services/authInterceptor';
import { logoutState, updateTokens } from '../features/auth/slice/authSlice';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  useEffect(() => {
    // Initialize our token rotation interceptors with store dispatch & actions
    setupInterceptors(store.dispatch, logoutState, updateTokens);
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </Provider>
  );
};

export default Providers;
