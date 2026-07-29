import { io } from "socket.io-client";
import { BACKEND_BASE_URL } from "../config/api";

const getSocketUrl = () => {
  if (process.env.REACT_APP_SOCKET_URL) {
    return process.env.REACT_APP_SOCKET_URL.replace(/\/+$/, "");
  }

  return BACKEND_BASE_URL;
};

const SOCKET_URL = getSocketUrl();
const SOCKET_PATH = process.env.REACT_APP_SOCKET_PATH || "/socket.io";
const SOCKET_TRANSPORTS = (
  process.env.REACT_APP_SOCKET_TRANSPORTS || "polling,websocket"
)
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

// include path, transports, autoConnect false
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: SOCKET_TRANSPORTS,
  path: SOCKET_PATH,
});
