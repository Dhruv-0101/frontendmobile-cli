import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/slice/authSlice';

const rootReducer = combineReducers({
  auth: authReducer,
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;
