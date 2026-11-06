import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { signupUser } from "@/api/authApi";
import { useUserStore } from "@/store/useUserStore";
import { getErrorMessage } from "@/utils/helpers";

export const useSignup = () => {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: signupUser,
    onSuccess: (data) => {
      const user = data?.user || (data?._id ? data : data?.data);
      if (user) {
        setUser(user);
        toast.success(data?.message || "Account created successfully!");
        navigate("/feed");
      } else {
        toast.success("Account created successfully! Please sign in.");
        navigate("/login");
      }
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Failed to create account");
      toast.error(message);
    },
  });
};

