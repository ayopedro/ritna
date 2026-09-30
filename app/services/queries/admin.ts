import { useQuery } from "@tanstack/react-query";

export const useGetAdminStats = <T>() => {
  return useQuery({
    queryKey: ['getAdminStats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/overview', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch admin stats');
      }
      const data = await res.json();
      return data.data as T;
    },
  });
};