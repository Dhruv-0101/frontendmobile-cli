import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { StripeProvider } from '@stripe/stripe-react-native';
import { store } from '../store';
import { queryClient } from './queryClient';
import { setupInterceptors } from '../services/authInterceptor';
import { logoutState, updateTokens } from '../features/auth/slice/authSlice';

interface ProvidersProps {
  children: React.ReactNode;
}

// ============================================================================
// [APP EXECUTION FLOW - STEP 2: Providers Initialization]
// This file runs immediately after App.tsx. It sets up Redux and React Query
// and initializes our custom secure HTTP interceptors.
// ============================================================================
export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  useEffect(() => {
    // ========================================================================
    // [APP EXECUTION FLOW - STEP 2A: Set up HTTP Interceptors]
    // Here we register our global Axios request/response interceptors.
    // We pass store.dispatch, logoutState, and updateTokens so the interceptor
    // file can dispatch state updates (like updating rotated tokens or logging out)
    // without needing to import the store directly (which avoids circular imports).
    // -> Next, execution goes to [authInterceptor.ts] to run setupInterceptors.
    // ========================================================================
    /*
    Passing the tools (No immediate execution)
In 
providers.tsx, you call the setup function. You do not add parentheses () to the actions, meaning they do not run yet:

typescript
// Here we are just pointing to the functions (passing references)
setupInterceptors(store.dispatch, logoutState, updateTokens);
    */
    setupInterceptors(store.dispatch, logoutState, updateTokens);
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <StripeProvider publishableKey="pk_test_51O7iHlSAP8eyRYOVMSRmnh22wxkhX33MCA93aTN90g3LXaW2h7RYvnb3sM85JRRUxFTsLGXiexCqLo426Pu10thG000RTns3P6">
          {/* -> Next, execution goes to mount the children, which is [RootNavigator.tsx]. */}
          <>{children}</>
        </StripeProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default Providers;
/*
Here is the exact step-by-step execution flow:

Step 1: Loading the Bundle (Static Evaluation)
Before any React component is drawn on the screen, JavaScript imports evaluate top-down:



App.tsx
 is loaded. It imports Providers.


providers.tsx
 imports store $\rightarrow$ rootReducer $\rightarrow$ 

authSlice.ts
.
authSlice.ts evaluates: It registers the Redux actions and initial state (isLoading: true).
Step 2: Mounting Providers (Component Mount)
React renders the <App /> component.
React mounts <Providers> component first.
providers.tsx useEffect runs: It sets up the API security interceptor:
typescript
setupInterceptors(store.dispatch, logoutState, updateTokens);
Step 3: Mounting the Screens & Checking Auth
Here is the step you missed:

Inside <Providers>, React mounts 

RootNavigator.tsx
.
Since Redux's initial state has isLoading: true, RootNavigator renders the loading screen:
typescript
if (isLoading) return <Loader message="Verifying session..." />;
RootNavigator useEffect runs: This is the trigger that actually runs restoreAuth() inside your authSlice.ts:
typescript
useEffect(() => {
  dispatch(restoreAuth()); // <-- This fires the async storage check!
}, []);
restoreAuth (in authSlice.ts) queries the device disk:
It checks storage.getAccessToken() and storage.getRefreshToken().
If tokens exist: It updates Redux state (isAuthenticated: true, isLoading: false).
If empty: It updates Redux state (isAuthenticated: false, isLoading: false).
RootNavigator re-renders: Since isLoading is now false, it hides the loader and displays either:
<AppNavigator> (Home/Dashboard) if authenticated.
<AuthNavigator> (Login/Register) if not authenticated.
*/
