import { useMutation, useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';

/**
 * Hook to handle creation of new premium subscription plans.
 */
export const useCreatePlan = () => {
  return useMutation({
    mutationFn: adminApi.createPlan,
  });
};

/**
 * Hook to list subscription plans.
 */
export const usePlans = () => {
  return useQuery({
    queryKey: ['plans'],
    queryFn: adminApi.getPlans,
  });
};

/**
 * Hook to prepare Stripe PaymentIntent client secret.
 */
export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: adminApi.createPaymentIntent,
  });
};

/**
 * Hook to request backend to verify Stripe transaction success status.
 */
export const useVerifyPayment = () => {
  return useMutation({
    mutationFn: adminApi.verifyPayment,
  });
};
