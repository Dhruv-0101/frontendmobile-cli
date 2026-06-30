import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../api/postsApi';

/**
 * Hook to retrieve all blog posts.
 */
export const usePosts = () => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: postsApi.getPosts,
  });
};

/**
 * Hook to create a new blog post.
 * Invalidates the posts query to trigger a background refresh of the feed.
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postsApi.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

/**
 * Hook to retrieve all categories.
 */
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: postsApi.getCategories,
  });
};

/**
 * Hook to create a new category.
 * Invalidates the categories query to update selectable items in the dropdown modal.
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postsApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
