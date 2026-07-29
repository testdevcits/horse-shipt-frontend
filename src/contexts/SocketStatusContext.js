import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { socket } from "../services/socket";

const SocketStatusContext = createContext({
  isConnected: false,
  fallbackEnabled: true,
  shouldUsePollingFallback: true,
});

const fallbackEnabled =
  process.env.REACT_APP_ENABLE_SOCKET_POLLING_FALLBACK !== "false";

export const SocketStatusProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleDisconnect);

    setIsConnected(socket.connected);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleDisconnect);
    };
  }, []);

  const value = useMemo(
    () => ({
      isConnected,
      fallbackEnabled,
      shouldUsePollingFallback: fallbackEnabled && !isConnected,
    }),
    [isConnected]
  );

  return (
    <SocketStatusContext.Provider value={value}>
      {children}
    </SocketStatusContext.Provider>
  );
};

export const useSocketStatus = () => useContext(SocketStatusContext);
