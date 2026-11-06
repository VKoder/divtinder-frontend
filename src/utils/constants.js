// Use the current host during local Wi-Fi testing; production routes through the same-origin API.
const hostname =
  typeof window !== "undefined" ? window.location.hostname : "localhost";

export const BASE_URL = import.meta.env.DEV
  ? `http://${hostname}:7777`
  : "/api";
