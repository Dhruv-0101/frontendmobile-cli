import { Platform } from 'react-native';

// For physical USB debugging on Android, run: adb reverse tcp:8080 tcp:8080
// That maps localhost:8080 on the phone to your local computer port 8080.
// If using iOS with physical device, replace 'localhost' with your computer's local IP address.
const LOCALHOST = Platform.OS === 'android' ? 'localhost' : 'localhost';

export const ENV = {
  API_URL: `http://${LOCALHOST}:8080/api/v1`,
  TIMEOUT: 15000,
};
