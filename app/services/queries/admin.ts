
import { API_ENDPOINTS, QUERY_KEYS } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

export const useGetAdminStats = <T>() => {
  return useQuery({
    queryKey: QUERY_KEYS.adminStats,
    queryFn: async () => {
      const res = await fetch(API_ENDPOINTS.adminOverview, {
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
export function useAdminRecords<T>(query: import('@/app/lib/types').AdminRecordsQuery) {
  return useQuery({
    queryKey: [API_ENDPOINTS.adminRecords, query],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams(Object.entries(query).map(([key, value]) => [key, String(value)]));
      const response = await fetch(`${API_ENDPOINTS.adminRecords}?${params}`, { signal });
      if (!response.ok) throw new Error('Unable to load records.');
      const result = await response.json();
      return result.data as import('@/app/lib/types').AdminRecordsPage<T>;
    },
  });
}
