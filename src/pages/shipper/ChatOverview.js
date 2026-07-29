import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { HiSearch, HiArrowLeft } from "react-icons/hi";
import { FiImage, FiX } from "react-icons/fi";
import PageLoader from "../../components/common/PageLoader";
import { useShipperChat } from "../../contexts/shipperContext/ShipperChatContext";
import { useAuth } from "../../contexts/AuthContext";
import { socket } from "../../services/socket";
import axios from "axios";
import Toast from "../../components/common/Toast";
import { useSocketStatus } from "../../contexts/SocketStatusContext";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://horse-shipt.vercel.app/api";

const ChatOverview = () => {
  const { customers, loading, fetchCustomers } = useShipperChat();
  const { user, token } = useAuth();
  const { shouldUsePollingFallback } = useSocketStatus();
  const [searchParams] = useSearchParams();

  const customerIdFromQuery = searchParams.get("customerId"); // GET CUSTOMER ID FROM QUERY
  const shipmentIdFromQuery = searchParams.get("shipmentId");

  const [selectedUser, setSelectedUser] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [sending, setSending] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchRoomMessages = useCallback(
    async (nextRoomId, { silent = false } = {}) => {
      if (!nextRoomId || !token) return;

      if (!silent) setMessagesLoading(true);
      try {
        const messagesRes = await axios.get(
          `${API_BASE_URL}/shipper/chat/rooms/${nextRoomId}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMessages(messagesRes.data?.messages || []);
      } catch (err) {
        if (!silent) {
          Toast.error(
            err.response?.data?.message || "Failed to load chat messages"
          );
        }
      } finally {
        if (!silent) setMessagesLoading(false);
      }
    },
    [token]
  );

  /* ===============================
     FETCH CUSTOMER LIST
  ================================ */
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  /* ===============================
     AUTO-SELECT CUSTOMER FROM QUERY
  ================================ */
  useEffect(() => {
    if (customers.length && (shipmentIdFromQuery || customerIdFromQuery)) {
      const userFromQuery = customers.find(
        (c) =>
          (shipmentIdFromQuery && c.shipmentId === shipmentIdFromQuery) ||
          (!shipmentIdFromQuery && c._id === customerIdFromQuery)
      );
      if (userFromQuery) setSelectedUser(userFromQuery);
    }
  }, [customers, customerIdFromQuery, shipmentIdFromQuery]);

  /* ===============================
     JOIN ROOM WHEN CUSTOMER SELECTED
  ================================ */
  useEffect(() => {
    if (!selectedUser) return;

    setMessages([]); // reset messages when new user selected
    let cancelled = false;
    let cleanupSocketJoin = () => {};

    const openRoom = async () => {
      setMessagesLoading(true);
      try {
        const roomRes = await axios.post(
          `${API_BASE_URL}/shipper/chat/room`,
          { shipmentId: selectedUser.shipmentId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const nextRoomId = roomRes.data?.roomId || roomRes.data?.room?._id;
        if (!nextRoomId || cancelled) return;

        setRoomId(nextRoomId);

        if (!cancelled) await fetchRoomMessages(nextRoomId);

        const joinRoom = () => {
          socket.emit("joinRoom", {
            customerId: selectedUser._id,
            shipperId: user._id,
            shipmentId: selectedUser.shipmentId,
          });
        };

        if (socket.connected) {
          joinRoom();
        } else {
          socket.once("connect", joinRoom);
          cleanupSocketJoin = () => socket.off("connect", joinRoom);
          socket.connect();
        }
      } catch (err) {
        if (!cancelled) {
          Toast.error(
            err.response?.data?.message || "Failed to load chat messages"
          );
        }
      } finally {
        if (!cancelled) setMessagesLoading(false);
      }
    };

    openRoom();

    return () => {
      cancelled = true;
      cleanupSocketJoin();
    };
  }, [selectedUser, user, token, fetchRoomMessages]);

  useEffect(() => {
    if (!roomId) return;

    const handleReceiveMessage = (msg) => {
      const msgRoomId =
        typeof msg.chatRoom === "object" ? msg.chatRoom?._id : msg.chatRoom;
      if (msgRoomId?.toString() !== roomId.toString()) return;

      setMessages((prev) => {
        if (msg._id && prev.some((item) => item._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !token || !shouldUsePollingFallback) return;

    const interval = setInterval(() => {
      fetchRoomMessages(roomId, { silent: true });
    }, 5000);

    return () => clearInterval(interval);
  }, [roomId, shouldUsePollingFallback, token, fetchRoomMessages]);

  /* ===============================
     AUTO SCROLL
  ================================ */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ===============================
     SEARCH + FILTER
  ================================ */
  const filteredUsers = useMemo(() => {
    return (customers || [])
      .filter((u) => {
        const term = search.toLowerCase();
        return (
          u.name?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term) ||
          u.shipmentCode?.toLowerCase().includes(term)
        );
      })
      .filter((u) => {
        if (filter === "online") return u.isOnline === true;
        if (filter === "offline") return u.isOnline === false;
        return true;
      });
  }, [customers, search, filter]);

  /* ===============================
     SEND MESSAGE
  ================================ */
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage({
        file,
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: reader.result,
        preview: URL.createObjectURL(file),
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const clearSelectedImage = () => {
    if (selectedImage?.preview) URL.revokeObjectURL(selectedImage.preview);
    setSelectedImage(null);
  };

  const handleSendMessage = () => {
    if ((!newMessage.trim() && !selectedImage) || !roomId || sending) return;

    const formData = new FormData();
    formData.append("message", newMessage);
    if (selectedImage?.file) {
      formData.append("image", selectedImage.file);
    }

    setSending(true);
    axios
      .post(`${API_BASE_URL}/shipper/chat/rooms/${roomId}/messages`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        const sentMessage = res.data?.data;
        if (sentMessage) {
          setMessages((prev) => {
            if (
              sentMessage._id &&
              prev.some((item) => item._id === sentMessage._id)
            ) {
              return prev;
            }
            return [...prev, sentMessage];
          });
        }
        clearSelectedImage();
      })
      .catch((err) => {
        Toast.error(err.response?.data?.message || "Failed to send message");
      })
      .finally(() => {
      setSending(false);
      });
    setNewMessage("");
  };

  if (loading) {
    return (
      <PageLoader text="Loading chats..." fullScreen={false} color="#BF9B53" />
    );
  }

  return (
    <div className="flex h-[calc(99vh-120px)] bg-white border shadow font-montserrat overflow-hidden">
      {/* ================= LEFT: CUSTOMER LIST ================= */}
      <div
        className={`w-full lg:w-1/4 border-r overflow-y-auto bg-white
        ${selectedUser ? "hidden lg:block" : "block"}`}
      >
        <div className="p-4 border-b font-semibold">Shipment Chats</div>

        <div className="p-3 relative">
          <HiSearch
            className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shipment or customer"
            className="w-full border pl-10 py-2"
          />
        </div>

        <div className="flex gap-2 px-3 pb-3">
          {["all", "online", "offline"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`flex-1 py-2 rounded text-sm font-medium border
                ${
                  filter === type
                    ? "bg-system-primary text-white border-system-primary"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
            >
              {type === "all"
                ? "All"
                : type === "online"
                ? "Online"
                : "Offline"}
            </button>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <p className="p-4 text-gray-500 text-sm">
            No accepted shipment chats found
          </p>
        )}

        {filteredUsers.map((u) => (
          <div
            key={u.shipmentId || u._id}
            onClick={() => {
              setSelectedUser(u);
              setRoomId(null);
              setMessages([]); // reset messages
            }}
            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100"
          >
            <div className="relative">
              <img
                src={u.avatar}
                alt={u.name}
                className="w-10 h-10 rounded-full object-cover border border-system-primary"
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  u.isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-medium">{u.name}</span>
              <span className="text-xs text-gray-500">{u.email}</span>
              <span className="text-xs text-[#BF9B53] font-semibold truncate">
                {u.shipmentCode}
              </span>
              <span className="text-[11px] text-gray-400 truncate">
                {u.pickupLocation} to {u.deliveryLocation}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ================= RIGHT: CHAT ================= */}
      <div
        className={`flex-1 flex flex-col bg-white
        ${selectedUser ? "block" : "hidden lg:flex"}`}
      >
        {!selectedUser && (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select an accepted shipment to start chat
          </div>
        )}

        {selectedUser && (
          <>
            <div className="p-4 border-b flex items-center gap-3 font-semibold">
              <button
                className="lg:hidden"
                onClick={() => setSelectedUser(null)}
              >
                <HiArrowLeft size={22} />
              </button>

              <div className="flex flex-col">
                <span>{selectedUser.name}</span>
                <span className="text-xs text-[#BF9B53]">
                  {selectedUser.shipmentCode}
                </span>
                <span
                  className={`text-xs ${
                    selectedUser.isOnline ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {selectedUser.isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messagesLoading && (
                <p className="text-gray-400 text-sm text-center">
                  Loading messages...
                </p>
              )}

              {!messagesLoading && messages.length === 0 && (
                <p className="text-gray-400 text-sm text-center">
                  No messages yet
                </p>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.senderRole === "shipper"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg max-w-[75%] ${
                      msg.senderRole === "shipper"
                        ? "bg-system-primary text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {msg.media?.length > 0 && (
                      <div className="space-y-2 mb-2">
                        {msg.media.map((item, idx) => (
                          <a
                            key={item.public_id || idx}
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img
                              src={item.url}
                              alt={item.originalName || "Chat attachment"}
                              className="max-h-64 rounded-md object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    )}
                    {(msg.message || msg.text) && (
                      <p>{msg.message || msg.text}</p>
                    )}
                    <span className="text-xs block mt-1 opacity-70">
                      {new Date(msg.createdAt || msg.time).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 border-t space-y-2">
              {selectedImage && (
                <div className="relative w-24">
                  <img
                    src={selectedImage.preview}
                    alt="Selected"
                    className="w-24 h-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={clearSelectedImage}
                    className="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full p-1"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="border rounded px-3 text-gray-600 hover:bg-gray-50"
                  title="Attach image"
                >
                  <FiImage size={18} />
                </button>
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Type a message..."
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending}
                  className="bg-system-primary text-white px-4 rounded disabled:opacity-60"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatOverview;
