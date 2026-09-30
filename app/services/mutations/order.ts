import { API_ENDPOINTS, MUTATION_KEYS } from '@/app/lib/constants';
import { CreatePreorderFormData } from '@/app/lib/types';
import { useMutation } from '@tanstack/react-query';

export const useCreatePreorder = () =>
  useMutation({
    mutationKey: MUTATION_KEYS.createPreorder,
    mutationFn: async (data: CreatePreorderFormData) => {
      const response = await fetch(API_ENDPOINTS.createPreorder, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to create preorder');
      }
      return result;
    },
  });
