import { useQuery } from '@tanstack/react-query';
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
