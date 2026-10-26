export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  if (!error) return "";
  return (
    error?.response?.data?.message ||
    (typeof error?.response?.data === "string" ? error.response.data : "") ||
    error?.message ||
    fallback
  );
};
