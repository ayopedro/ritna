import {
  API_ENDPOINTS,
  MUTATION_KEYS,
  CHECKOUT_ATTEMPT_STORAGE_KEY,
} from '@/app/lib/constants';
import { CreatePreorderFormData } from '@/app/lib/types';
import { useRef } from 'react';
import { useMutation } from '@tanstack/react-query';

export const useCreatePreorder = () => {
  const attempt = useRef({ payload: '', key: '' });
  return useMutation({
    mutationKey: MUTATION_KEYS.createPreorder,
    mutationFn: async (data: CreatePreorderFormData) => {
      const encoded = new TextEncoder().encode(JSON.stringify(data));
      const digest = await crypto.subtle.digest('SHA-256', encoded);
      const payload = Array.from(new Uint8Array(digest), (byte) =>
        byte.toString(16).padStart(2, '0'),
      ).join('');
      try {
        const saved = JSON.parse(
          sessionStorage.getItem(CHECKOUT_ATTEMPT_STORAGE_KEY) ?? 'null',
        );
        if (saved?.payload === payload && typeof saved.key === 'string')
          attempt.current = saved;
      } catch {}
      if (attempt.current.payload !== payload) {
        attempt.current = { payload, key: crypto.randomUUID() };
      }
      try {
        sessionStorage.setItem(
          CHECKOUT_ATTEMPT_STORAGE_KEY,
          JSON.stringify(attempt.current),
        );
      } catch {}
      const response = await fetch(API_ENDPOINTS.createPreorder, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': attempt.current.key,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to create preorder');
      }
      return result;
    },
  });
};
