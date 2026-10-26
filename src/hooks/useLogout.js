import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { logoutUser } from "@/api/authApi";
import { useUserStore } from "@/store/useUserStore";

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearUser = useUserStore((state) => state.clearUser);

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: (data) => {
      clearUser();
      queryClient.clear();
      toast.success(data?.message || "Logged out successfully");
      navigate("/login");
    },
    onError: () => {
      clearUser();
      queryClient.clear();
      toast.success("Logged out successfully");
      navigate("/login");
    },
  });
};
