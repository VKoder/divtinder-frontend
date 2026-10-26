import { useQuery } from "@tanstack/react-query";
import { fetchFeed } from "@/api/feedApi";

export const useFeed = () => {
  return useQuery({
    queryKey: ["feed"],
    queryFn: fetchFeed,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
