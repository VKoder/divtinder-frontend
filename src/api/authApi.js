import { axiosClient } from "./axiosClient";

export const loginUser = async ({ emailId, password }) => {
  const response = await axiosClient.post("/login", { emailId, password });
  return response.data;
};

export const logoutUser = async () => {
  const response = await axiosClient.post("/logout");
  return response.data;
};
