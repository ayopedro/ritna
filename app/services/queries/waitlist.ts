
import { API_ENDPOINTS, QUERY_KEYS } from "@/lib/constants";
import { useQuery } from '@tanstack/react-query';

export const useGetWaitlistCount = () => {
  return useQuery({
    queryKey: QUERY_KEYS.waitlistCount,
    queryFn: async () => {
      const res = await fetch(API_ENDPOINTS.waitlistCount, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch waitlist count');
      }
      const data = await res.json();
      return data.data;
    },
  });
};
