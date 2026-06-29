export interface ApiResponse<T> {
  status: string;
  message?: string;
  data?: T;
}
export interface UserInfo {
  id: number;
  username: string;
  email?: string;
  profilePicture?: string | null;
}
export type RootStackParamList = {
  AuthStack: undefined;
  AppStack: undefined;
};
