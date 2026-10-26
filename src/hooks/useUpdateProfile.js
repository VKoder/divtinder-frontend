import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateProfile } from "@/api/profileApi";
import { useUserStore } from "@/store/useUserStore";
import { getErrorMessage } from "@/utils/helpers";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const setUser = useUserStore((state) => state.setUser);
  const currentUser = useUserStore((state) => state.user);

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      const updated = data?.user || (data?._id ? data : { ...currentUser, ...data });
      if (updated) {
        setUser(updated);
      }
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success(data?.message || "Profile updated successfully!");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update profile"));
    },
  });
};
