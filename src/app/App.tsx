import React from 'react';
import Providers from './providers';
import RootNavigator from '../navigation/RootNavigator';

export const App = () => {
  return (
    <Providers>
      <RootNavigator />
    </Providers>
  );
};

export default App;
