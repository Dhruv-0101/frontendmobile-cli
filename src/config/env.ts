import { Platform } from 'react-native';

// Set this to true to connect to the live Render backend, or false to use your local machine backend.
const IS_PRODUCTION = false;

// For physical USB debugging on Android, run: adb reverse tcp:8080 tcp:8080
// That maps localhost:8080 on the phone to your local computer port 8080.
// If using iOS with physical device, replace 'localhost' with your computer's local IP address.
const LOCALHOST = Platform.OS === 'android' ? 'localhost' : 'localhost';

const PROD_API_URL = 'https://backend-mobile-cli-1.onrender.com/api/v1';
const DEV_API_URL = `http://${LOCALHOST}:8080/api/v1`;

export const ENV = {
  API_URL: IS_PRODUCTION ? PROD_API_URL : DEV_API_URL,
  TIMEOUT: 15000,
};
