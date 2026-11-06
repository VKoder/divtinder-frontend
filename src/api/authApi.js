import { axiosClient } from "./axiosClient";

export const signupUser = async (signupData) => {
  const response = await axiosClient.post("/signup", signupData);
  return response.data;
};

export const loginUser = async ({ emailId, password }) => {
  const response = await axiosClient.post("/login", { emailId, password });
  return response.data;
};

export const logoutUser = async () => {
  const response = await axiosClient.post("/logout");
  return response.data;
};
