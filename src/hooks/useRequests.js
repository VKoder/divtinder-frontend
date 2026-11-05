import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchPendingRequests, reviewRequest, sendConnectionRequest } from "@/api/requestApi";
import { getErrorMessage } from "@/utils/helpers";

export const usePendingRequests = () => {
  return useQuery({
    queryKey: ["pendingRequests"],
    queryFn: fetchPendingRequests,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useSendConnectionRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendConnectionRequest,
    onSuccess: (data, variables) => {
      const isInterested = variables.status === "interested";
      if (isInterested) {
        toast.success(data?.message || "Connection request sent!");
      }
      // Invalidate relevant queries so the feed and requests stay up to date
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to send connection request"));
    },
  });
};

export const useReviewRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewRequest,
    onSuccess: (data, variables) => {
      const isAccepted = variables.status === "accepted";
      toast.success(
        data?.message || (isAccepted ? "Connection request accepted! 🎉" : "Request passed.")
      );
      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to respond to request"));
    },
  });
};
