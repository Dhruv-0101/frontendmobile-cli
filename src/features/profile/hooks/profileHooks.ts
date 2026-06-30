import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profileApi';

export const useMyPosts = () => {
  return useQuery({
    queryKey: ['my-posts'],
    queryFn: profileApi.getMyPosts,
  });
};

export const useFollowers = () => {
  return useQuery({
    queryKey: ['my-followers'],
    queryFn: profileApi.getFollowers,
  });
};

export const useFollowing = () => {
  return useQuery({
    queryKey: ['my-following'],
    queryFn: profileApi.getFollowing,
  });
};

export const useEarnings = () => {
  return useQuery({
    queryKey: ['my-earnings'],
    queryFn: profileApi.getEarnings,
  });
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: profileApi.getNotifications,
    refetchInterval: 15000, // Poll notifications every 15 seconds automatically
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useRankings = () => {
  return useQuery({
    queryKey: ['rankings'],
    queryFn: profileApi.getRankings,
  });
};
