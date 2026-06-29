import apiClient from '../../../services/apiClient';

export interface Post {
  id: number;
  description: string;
  image?: string | null;
  createdAt: string;
  user: {
    username: string;
    profilePicture?: string | null;
  };
}

export const postsApi = {
  getPosts: async (): Promise<Post[]> => {
    // The backend endpoint is GET /post/get-posts
    const response = await apiClient.get('/post/get-posts');
    // Return the post data (depending on response structure, usually response.data or response.data.posts)
    return response.data?.posts || response.data?.data || response.data || [];
  },
};
