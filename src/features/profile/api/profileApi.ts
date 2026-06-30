import apiClient from '../../../services/apiClient';

export const profileApi = {
  getMyPosts: async () => {
    try {
      const response = await apiClient.get('/post/my-posts');
      return response.data?.userPosts || [];
    } catch (err: any) {
      // If user has no posts, backend returns 404; handle it gracefully as empty list
      if (err.response?.status === 404) {
        return [];
      }
      throw err;
    }
  },

  getFollowers: async () => {
    const response = await apiClient.get('/users/get-followers');
    return response.data?.followers || [];
  },

  getFollowing: async () => {
    const response = await apiClient.get('/users/get-following');
    return response.data?.following || [];
  },

  getEarnings: async () => {
    try {
      const response = await apiClient.get('/users/get-earning-dashboard');
      return response.data?.totalEarnings || 0;
    } catch (err: any) {
      // If user has no posts, backend returns 404; handle it gracefully as 0 earnings
      if (err.response?.status === 404) {
        return 0;
      }
      throw err;
    }
  },

  getNotifications: async () => {
    const response = await apiClient.get('/post/get-user-notification');
    return response.data || { unreadCount: 0, notifications: [] };
  },

  markNotificationRead: async (notificationId: number) => {
    const response = await apiClient.put(`/post/update-user-notification/${notificationId}`);
    return response.data;
  },

  getRankings: async () => {
    const response = await apiClient.get('/post/get-user-post-rankings');
    return Array.isArray(response.data) ? response.data : response.data?.rankings || [];
  },
};
