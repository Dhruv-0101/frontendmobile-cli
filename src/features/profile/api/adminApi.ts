import apiClient from '../../../services/apiClient';

export const adminApi = {
  createPlan: async (data: { planName: string; features: string; price: number }) => {
    const response = await apiClient.post('/plan/create-plan', data);
    return response.data;
  },
};
export default adminApi;
