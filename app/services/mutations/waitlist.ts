
import { API_ENDPOINTS, MUTATION_KEYS } from "@/lib/constants";
import { JoinWaitlistFormData } from "@/app/components/waitlist-form";
import { useMutation } from "@tanstack/react-query"

export const useJoinWaitlistMutation = () =>
  useMutation({
    mutationKey: MUTATION_KEYS.joinWaitlist,
    mutationFn: async (data: JoinWaitlistFormData) => {
            const response = await fetch(API_ENDPOINTS.waitlist, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to join waitlist");
      }
      return result;
    },
  });