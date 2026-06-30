import React from 'react';
import Providers from './providers';
import RootNavigator from '../navigation/RootNavigator';

// ============================================================================
// [APP EXECUTION FLOW - STEP 1: Entry Point]
// This is the root component of the React Native app.
// When the app starts, this file is loaded and executes first.
// It wraps the entire application navigation inside global providers.
// ============================================================================
export const App = () => {
  return (
    // -> Next, execution goes to [providers.tsx] to wrap the application in Redux & React Query.
    <Providers>
      {/* -> Inside providers, the RootNavigator is mounted, starting the screen check. */}
      <RootNavigator />
    </Providers>
  );
};

export default App;
