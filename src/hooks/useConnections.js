import { useQuery } from "@tanstack/react-query";
import { fetchConnections } from "@/api/connectionApi";

export const useConnections = () => {
  return useQuery({
    queryKey: ["connections"],
    queryFn: fetchConnections,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
