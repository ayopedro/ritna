import { useQuery } from '@tanstack/react-query';

export const useGetWaitlistCount = () => {
  return useQuery({
    queryKey: ['getWaitlistCount'],
    queryFn: async () => {
      const res = await fetch('/api/waitlist/count', {
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
