import { useEffect, useState } from "react";
import { socket } from "../services/socket";

export default function useChatTyping(roomId, text) {
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    let expiry;
    const clear = () => setTyping(false);
    const receive = (data) => {
      if (String(data?.roomId) !== String(roomId) ||
          String(data.userId) === String(socket.auth?.userId)) return;
      setTyping(data.isTyping === true);
      clearTimeout(expiry);
      expiry = setTimeout(clear, 3000);
    };
    const message = (data) => {
      if (String(data?.chatRoom) === String(roomId)) clear();
    };
    socket.on("horse_shipt:typing", receive);
    socket.on("receiveMessage", message);
    socket.on("disconnect", clear);
    return () => {
      clearTimeout(expiry);
      socket.off("horse_shipt:typing", receive);
      socket.off("receiveMessage", message);
      socket.off("disconnect", clear);
      if (socket.connected) socket.emit("horse_shipt:typing", { roomId, isTyping: false });
      setTyping(false);
    };
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !socket.connected) return;
    const emit = (isTyping) => {
      if (socket.connected) socket.emit("horse_shipt:typing", { roomId, isTyping });
    };
    emit(Boolean(text.trim()));
    const idle = setTimeout(() => emit(false), 1500);
    return () => clearTimeout(idle);
  }, [roomId, text]);

  return typing;
}
