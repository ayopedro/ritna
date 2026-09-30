
import { API_ENDPOINTS, QUERY_KEYS } from "@/lib/constants";
import { useQuery } from '@tanstack/react-query';

export const useGetBooks = <T = any>() => {
  return useQuery({
    queryKey: QUERY_KEYS.books,
    queryFn: async () => {
      const res = await fetch(API_ENDPOINTS.books, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch books');
      }
      const data = await res.json();
      return data.data?.books as T;
    },
  });
};
