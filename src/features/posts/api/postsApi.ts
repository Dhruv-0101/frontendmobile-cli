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

  getSinglePost: async (postId: number) => {
    const response = await apiClient.get(`/post/get-single-post/${postId}`);
    return response.data;
  },

  likePost: async (postId: number) => {
    const response = await apiClient.post(`/post/like-post/${postId}`);
    return response.data;
  },

  dislikePost: async (postId: number) => {
    const response = await apiClient.post(`/post/dislike-post/${postId}`);
    return response.data;
  },

  followUser: async (followerId: number) => {
    const response = await apiClient.post(`/users/follow-user/${followerId}`);
    return response.data;
  },

  unfollowUser: async (followerId: number) => {
    const response = await apiClient.post(`/users/unfollow-user/${followerId}`);
    return response.data;
  },

  checkFollowing: async (followerId: number) => {
    const response = await apiClient.get(`/users/get-user-follow/${followerId}`);
    return response.data;
  },

  createComment: async (data: { postId: number; content: string }) => {
    const response = await apiClient.post(`/comment/create-comment/${data.postId}`, { content: data.content });
    return response.data;
  },

  deletePost: async (postId: number) => {
    const response = await apiClient.delete(`/post/delete-single-post/${postId}`);
    return response.data;
  },
};
