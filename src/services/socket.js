import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || "https://horse-shipt.vercel.app";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
});
