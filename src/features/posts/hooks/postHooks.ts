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

/**
 * Hook to retrieve a single post by ID.
 */
export const useSinglePost = (postId: number) => {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => postsApi.getSinglePost(postId),
  });
};

/**
 * Hook to like a post.
 */
export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postsApi.likePost,
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

/**
 * Hook to dislike a post.
 */
export const useDislikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postsApi.dislikePost,
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

/**
 * Hook to follow a creator.
 */
export const useFollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postsApi.followUser,
    onSuccess: (_, creatorId) => {
      queryClient.invalidateQueries({ queryKey: ['following', creatorId] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
    },
  });
};

/**
 * Hook to unfollow a creator.
 */
export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postsApi.unfollowUser,
    onSuccess: (_, creatorId) => {
      queryClient.invalidateQueries({ queryKey: ['following', creatorId] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
    },
  });
};

/**
 * Hook to check if standard user is following target creator.
 */
export const useCheckFollowing = (followerId: number) => {
  return useQuery({
    queryKey: ['following', followerId],
    queryFn: () => postsApi.checkFollowing(followerId),
    enabled: !!followerId,
  });
};

/**
 * Hook to add a new comment to a post.
 */
export const useCreateComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postsApi.createComment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId] });
    },
  });
};

/**
 * Hook to delete a post.
 */
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postsApi.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};
