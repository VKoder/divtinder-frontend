import { axiosClient } from "./axiosClient";

export const fetchConnections = async () => {
  const response = await axiosClient.get("/user/connections");
  // Handles { message: "...", data: [...] } or direct array
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data?.data || [];
};
