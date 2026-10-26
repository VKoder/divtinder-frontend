import { axiosClient } from "./axiosClient";

export const updateProfile = async (profileData) => {
  const response = await axiosClient.patch("/user", profileData);
  return response.data;
};
