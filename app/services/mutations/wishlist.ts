import { JoinWaitlistFormData } from "@/app/components/waitlist";
import { useMutation } from "@tanstack/react-query"

export const useJoinWaitlistMutation = () =>
  useMutation({
    mutationKey: ['join-waitlist'],
    mutationFn: async (data: JoinWaitlistFormData) => {
            const response = await fetch("/api/waitlist", {
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