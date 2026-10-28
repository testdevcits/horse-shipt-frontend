import { io } from "socket.io-client";
import { SOCKET_BASE_URL } from "../config/api";

const SOCKET_URL = SOCKET_BASE_URL;
const SOCKET_PATH = process.env.REACT_APP_SOCKET_PATH || "/socket.io";
const configuredTransports = (
  process.env.REACT_APP_SOCKET_TRANSPORTS || "polling,websocket"
)
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const isVercelSocketEndpoint = /.vercel.app$/i.test(
  new URL(SOCKET_URL).hostname
);
// Vercel's WebSocket endpoint should connect directly. Starting with Engine.IO
// polling can create a session that is not available to the WebSocket upgrade.
const SOCKET_TRANSPORTS = isVercelSocketEndpoint
  ? ["websocket"]
  : configuredTransports;

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

socket.on("connect", () => {
  console.info("[Socket.IO] connected", {
    url: SOCKET_URL,
    path: SOCKET_PATH,
    transport: socket.io.engine?.transport?.name,
  });
});

socket.on("connect_error", (error) => {
  console.error("[Socket.IO] connection failed", {
    url: SOCKET_URL,
    path: SOCKET_PATH,
    transports: SOCKET_TRANSPORTS,
    message: error.message,
  });
});

socket.on("disconnect", (reason) => {
  console.warn("[Socket.IO] disconnected", { reason });
});
