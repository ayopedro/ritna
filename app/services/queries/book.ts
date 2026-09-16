import { useQuery } from '@tanstack/react-query';

export const useGetBooks = <T = any>() => {
  return useQuery({
    queryKey: ['getBooks'],
    queryFn: async () => {
      const res = await fetch('/api/books', {
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
