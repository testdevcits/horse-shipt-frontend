import { io } from "socket.io-client";
import { BACKEND_BASE_URL } from "../config/api";

const getSocketUrl = () => {
  if (process.env.REACT_APP_SOCKET_URL) {
    return process.env.REACT_APP_SOCKET_URL.replace(/\/+$/, "");
  }

  return BACKEND_BASE_URL;
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
