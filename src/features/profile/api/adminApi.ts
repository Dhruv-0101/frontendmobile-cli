import apiClient from '../../../services/apiClient';

export const adminApi = {
  createPlan: async (data: { planName: string; features: string; price: number }) => {
    const response = await apiClient.post('/plan/create-plan', data);
    return response.data;
  },

  getPlans: async () => {
    const response = await apiClient.get('/plan/get-plan');
    return response.data;
  },

  createPaymentIntent: async (planId: number) => {
    const response = await apiClient.post(`/plan/plan-payment/${planId}`);
    return response.data;
  },

  verifyPayment: async (paymentId: string) => {
    const response = await apiClient.post(`/plan/plan-payment-verify/${paymentId}`);
    return response.data;
  },
};
export default adminApi;
