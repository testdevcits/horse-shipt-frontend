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

// All callers must set the identity before starting the handshake. Child effects
// can run before AuthProvider's refresh effect, so use persisted login as well.
export const connectSocket = (identity) => {
  let storedUser;
  try {
    storedUser = JSON.parse(localStorage.getItem("horseShiptUser") || "null");
  } catch {
    console.warn("[Socket.IO] invalid persisted user; login again");
    return false;
  }
  const auth = identity || {
    userId: storedUser?._id,
    role: localStorage.getItem("role") || storedUser?.role,
  };
  if (!auth.userId || !["customer", "shipper"].includes(auth.role)) {
    console.warn("[Socket.IO] connection skipped: missing user identity");
    return false;
  }
  const changed = socket.auth?.userId !== auth.userId || socket.auth?.role !== auth.role;
  if (changed) socket.disconnect();
  socket.auth = { userId: auth.userId, role: auth.role };
  socket.connect();
  return true;
};
