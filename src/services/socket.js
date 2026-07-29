import { io } from "socket.io-client";

const getSocketUrl = () => {
  if (process.env.REACT_APP_SOCKET_URL) {
    return process.env.REACT_APP_SOCKET_URL.replace(/\/+$/, "");
  }

  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL.replace(/\/api\/?$/, "");
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    if (hostname === "52.14.251.189" || hostname === "localhost") {
      return `${protocol}//${hostname}:5000`;
    }
  }

  return "http://52.14.251.189:5000";
};

const SOCKET_URL = getSocketUrl();

// include path, transports, autoConnect false
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ["websocket", "polling"], // fallback
  path: "/socket.io", // same as backend
});
