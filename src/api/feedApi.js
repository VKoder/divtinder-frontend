import { axiosClient } from "./axiosClient";

export const fetchFeed = async () => {
  const response = await axiosClient.get("/feed");
  // Handles either a direct array or { data: [...] } structure
  return Array.isArray(response.data) ? response.data : response.data?.data || [];
};
