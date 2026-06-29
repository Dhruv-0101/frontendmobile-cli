import { useState, useEffect } from 'react';

export const useNetwork = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);

  useEffect(() => {
    // Simple placeholder. In a production app, use @react-native-community/netinfo
    setIsConnected(true);
  }, []);

  return { isConnected };
};

export default useNetwork;
