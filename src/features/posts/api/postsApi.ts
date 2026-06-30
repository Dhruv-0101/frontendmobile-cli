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

  createPost: async (formData: FormData) => {
    const response = await apiClient.post('/post/create-post', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getCategories: async () => {
    const response = await apiClient.get('/category/get-all-category');
    return response.data?.categories || [];
  },

  createCategory: async (data: { categoryName: string; description?: string }) => {
    const response = await apiClient.post('/category/create-category', data);
    return response.data;
  },
};
