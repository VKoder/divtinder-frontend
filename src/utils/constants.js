// Dynamically use current host so phone/tablet testing on local Wi-Fi automatically hits the backend on your machine
export const BASE_URL =
  typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? `http://${window.location.hostname}:7777`
    : "http://localhost:7777";
