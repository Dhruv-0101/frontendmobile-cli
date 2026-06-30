import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';

/**
 * Hook to handle creation of new premium subscription plans.
 */
export const useCreatePlan = () => {
  return useMutation({
    mutationFn: adminApi.createPlan,
  });
};
