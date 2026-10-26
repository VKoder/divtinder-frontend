import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { loginUser } from "@/api/authApi";
import { useUserStore } from "@/store/useUserStore";
import { getErrorMessage } from "@/utils/helpers";

export const useLogin = () => {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      if (data?.user) {
        setUser(data.user);
      }
      toast.success(data?.message || "Logged in successfully!");
      navigate("/feed");
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};
