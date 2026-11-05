import { axiosClient } from "./axiosClient";

export const fetchPendingRequests = async () => {
  try {
    const response = await axiosClient.get("/user/pending/requests");
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return (
      response.data?.allRequest ||
      response.data?.data ||
      response.data?.requests ||
      []
    );
  } catch (err) {
    if (err.response?.status === 404) {
      // Fallback endpoint if course backend naming is /user/requests/received
      const resFallback = await axiosClient.get("/user/requests/received");
      return (
        resFallback.data?.allRequest ||
        resFallback.data?.data ||
        (Array.isArray(resFallback.data) ? resFallback.data : [])
      );
    }
    throw err;
  }
};

export const sendConnectionRequest = async ({ status, toUserId }) => {
  // status: "interested" | "ignored"
  const response = await axiosClient.post(`/request/send/${status}/${toUserId}`);
  return response.data;
};

export const reviewRequest = async ({ status, requestId }) => {
  // status: "accepted" | "rejected"
  try {
    const response = await axiosClient.post(`/request/receive/${status}/${requestId}`);
    return response.data;
  } catch (err) {
    if (err.response?.status === 404) {
      // Fallback if review endpoint was named /request/review or other variants
      try {
        const res2 = await axiosClient.post(`/request/review/${status}/${requestId}`);
        return res2.data;
      } catch (err2) {
        throw err;
      }
    }
    throw err;
  }
};
