import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { HiSearch, HiArrowLeft } from "react-icons/hi";
import { FiCheck, FiEdit2, FiFileText, FiImage, FiLock, FiTrash2, FiX } from "react-icons/fi";
import PageLoader from "../../components/common/PageLoader";
import { useCustomerChat } from "../../contexts/customerContext/CustomerChatContext";
import { useAuth } from "../../contexts/AuthContext";
import { socket } from "../../services/socket";
import defaultProfileImage from "../../assets/images/profileImage.png";
import axios from "axios";
import Toast from "../../components/common/Toast";
import { useSocketStatus } from "../../contexts/SocketStatusContext";
import { API_BASE_URL } from "../../config/api";
import { validateChatAttachmentUpload } from "../../utils/uploadValidation";

const isPdfAttachment = (item) =>
  item?.type === "pdf" ||
  item?.mimeType === "application/pdf" ||
  /\.pdf($|[?#])/i.test(item?.url || item?.originalName || "");

const ChatAttachment = ({ item }) =>
  isPdfAttachment(item) ? (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="flex max-w-[260px] items-center gap-2 rounded-md border border-white/30 bg-white/15 px-3 py-2 text-sm font-semibold hover:bg-white/25"
    >
      <FiFileText className="shrink-0" size={18} />
      <span className="truncate">{item.originalName || "Open PDF"}</span>
    </a>
  ) : (
    <a href={item.url} target="_blank" rel="noreferrer">
      <img
        src={item.url}
        alt={item.originalName || "Chat attachment"}
        className="max-h-64 rounded-md object-cover"
      />
    </a>
  );

const renderMessageText = (text = "") => {
  const parts = String(text).split(/(https?:\/\/[^\s]+)/g);

  return parts.map((part, index) =>
    /^https?:\/\//i.test(part) ? (
      <a
        key={`${part}-${index}`}
        href={part}
        target="_blank"
        rel="noreferrer"
        className="break-all font-semibold underline"
      >
        {part}
      </a>
    ) : (
      <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
    )
  );
};

const CustomerChatOverview = () => {
  const { shippers, loading, fetchShippers } = useCustomerChat();
  const { token } = useAuth();
  const { shouldUsePollingFallback } = useSocketStatus();
  const [searchParams] = useSearchParams();
  const shipmentIdFromQuery = searchParams.get("shipmentId");
  const shipperIdFromQuery = searchParams.get("shipperId");

  const [selectedShipper, setSelectedShipper] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [sending, setSending] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState("");
  const [now, setNow] = useState(Date.now());

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchRoomMessages = useCallback(
    async (nextRoomId, { silent = false } = {}) => {
      if (!nextRoomId || !token) return;

      if (!silent) setMessagesLoading(true);
      try {
        const messagesRes = await axios.get(
          `${API_BASE_URL}/customer/chat/rooms/${nextRoomId}/messages`,
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
     FETCH SHIPPERS
  ================================ */
  useEffect(() => {
    fetchShippers();
  }, [fetchShippers]);

  useEffect(() => {
    if (!shippers.length) return;

    const chatFromQuery = shippers.find((shipper) => {
      if (shipmentIdFromQuery && shipperIdFromQuery) {
        return (
          shipper.shipmentId === shipmentIdFromQuery &&
          shipper._id === shipperIdFromQuery
        );
      }
      if (shipmentIdFromQuery) return shipper.shipmentId === shipmentIdFromQuery;
      return shipperIdFromQuery && shipper._id === shipperIdFromQuery;
    });

    if (chatFromQuery) setSelectedShipper(chatFromQuery);
  }, [shippers, shipmentIdFromQuery, shipperIdFromQuery]);

  /* ===============================
     JOIN ROOM WHEN SHIPPER SELECTED
  ================================ */
  useEffect(() => {
    if (!selectedShipper) return;

    let cancelled = false;
    let cleanupSocketJoin = () => {};

    const openRoom = async () => {
      setMessagesLoading(true);
      try {
        const roomRes = await axios.post(
          `${API_BASE_URL}/customer/chat/room`,
          {
            shipmentId: selectedShipper.shipmentId,
            shipperId: selectedShipper._id,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const nextRoomId = roomRes.data?.roomId || roomRes.data?.room?._id;
        if (!nextRoomId || cancelled) return;

        setRoomId(nextRoomId);

        if (!cancelled) await fetchRoomMessages(nextRoomId);

        const joinRoom = () => {
          socket.emit("horse_shipt:join_chat_room", { roomId: nextRoomId });
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
  }, [selectedShipper, token, fetchRoomMessages]);

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

    const handleMessageEdited = (msg) => {
      const msgRoomId =
        typeof msg.chatRoom === "object" ? msg.chatRoom?._id : msg.chatRoom;
      if (msgRoomId?.toString() !== roomId.toString()) return;

      setMessages((prev) =>
        prev.map((item) => (item._id === msg._id ? { ...item, ...msg } : item))
      );
    };

    const handleMessageDeleted = (msg) => {
      const msgRoomId =
        typeof msg.chatRoom === "object" ? msg.chatRoom?._id : msg.chatRoom;
      if (msgRoomId?.toString() !== roomId.toString()) return;

      setMessages((prev) =>
        prev.map((item) => (item._id === msg._id ? { ...item, ...msg } : item))
      );
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageEdited", handleMessageEdited);
    socket.on("messageDeleted", handleMessageDeleted);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageEdited", handleMessageEdited);
      socket.off("messageDeleted", handleMessageDeleted);
    };
  }, [roomId]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

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
  const filteredShippers = useMemo(() => {
    return (shippers || [])
      .filter((s) => {
        const term = search.toLowerCase();
        return (
          s.name?.toLowerCase().includes(term) ||
          s.email?.toLowerCase().includes(term) ||
          s.shipmentCode?.toLowerCase().includes(term)
        );
      })
      .filter((s) => {
        if (filter === "online") return s.isOnline === true;
        if (filter === "offline") return s.isOnline === false;
        return true;
      });
  }, [shippers, search, filter]);

  /* ===============================
     SEND MESSAGE
  ================================ */
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateChatAttachmentUpload(file);
    if (validationError) {
      Toast.error(validationError);
      e.target.value = "";
      return;
    }

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

  const canEditMessage = (msg) => {
    if (isChatLocked || msg?.isDeleted || !msg?._id || msg.senderRole !== "customer") return false;
    if (!(msg.message || msg.text) || msg.media?.length) return false;
    const createdAt = new Date(msg.createdAt || msg.time).getTime();
    if (!createdAt || Number.isNaN(createdAt)) return false;
    return now - createdAt <= 60 * 1000;
  };

  const canDeleteMessage = (msg) => {
    if (isChatLocked || msg?.isDeleted || !msg?._id || msg.senderRole !== "customer") return false;
    const createdAt = new Date(msg.createdAt || msg.time).getTime();
    if (!createdAt || Number.isNaN(createdAt)) return false;
    return now - createdAt <= 60 * 1000;
  };

  const startEditMessage = (msg) => {
    setEditingMessageId(msg._id);
    setEditMessageText(msg.message || msg.text || "");
  };

  const cancelEditMessage = () => {
    setEditingMessageId(null);
    setEditMessageText("");
  };

  const saveEditedMessage = async () => {
    const text = editMessageText.trim();
    if (!editingMessageId || !roomId || !text) return;

    try {
      const res = await axios.patch(
        `${API_BASE_URL}/customer/chat/rooms/${roomId}/messages/${editingMessageId}`,
        { message: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedMessage = res.data?.data;
      if (updatedMessage) {
        setMessages((prev) =>
          prev.map((item) =>
            item._id === updatedMessage._id ? { ...item, ...updatedMessage } : item
          )
        );
      }
      cancelEditMessage();
    } catch (err) {
      Toast.error(err.response?.data?.message || "Failed to edit message");
    }
  };

  const deleteMessage = async (msg) => {
    if (!msg?._id || !roomId) return;
    if (!window.confirm("Delete this message?")) return;

    try {
      const res = await axios.delete(
        `${API_BASE_URL}/customer/chat/rooms/${roomId}/messages/${msg._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const deletedMessage = res.data?.data;
      if (deletedMessage) {
        setMessages((prev) =>
          prev.map((item) =>
            item._id === deletedMessage._id ? { ...item, ...deletedMessage } : item
          )
        );
      }
      if (editingMessageId === msg._id) cancelEditMessage();
    } catch (err) {
      Toast.error(err.response?.data?.message || "Failed to delete message");
    }
  };

  const handleSendMessage = () => {
    if (
      selectedShipper?.isChatLocked ||
      (!newMessage.trim() && !selectedImage) ||
      !roomId ||
      sending
    )
      return;

    const formData = new FormData();
    formData.append("message", newMessage);
    if (selectedImage?.file) {
      formData.append("image", selectedImage.file);
    }

    setSending(true);
    axios
      .post(`${API_BASE_URL}/customer/chat/rooms/${roomId}/messages`, formData, {
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

  const isChatLocked = Boolean(selectedShipper?.isChatLocked);

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white border shadow font-montserrat overflow-hidden">
      {/* ================= SHIPPERS LIST ================= */}
      <div
        className={`w-full lg:w-[380px] xl:w-[420px] shrink-0 border-r overflow-y-auto bg-white
        ${selectedShipper ? "hidden lg:block" : "block"}`}
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
            placeholder="Search shipment or shipper"
            className="w-full border pl-10 py-2"
          />
        </div>

        <div className="flex gap-2 px-3 pb-3">
          {["all", "online", "offline"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`flex-1 py-2 text-sm font-medium border
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

        {filteredShippers.length === 0 && (
          <p className="p-4 text-gray-500 text-sm">
            No accepted shipment chats found
          </p>
        )}

        {filteredShippers.map((s) => (
          <div
            key={s.shipmentId || s._id}
            onClick={() => {
              setSelectedShipper(s);
              setRoomId(null);
              setMessages([]); // reset messages
            }}
            className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100"
          >
            <div className="relative h-11 w-11 shrink-0">
              <img
                src={s.avatar || defaultProfileImage}
                alt={s.name}
                className="h-11 w-11 rounded-full object-cover border border-system-primary"
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  s.isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate text-sm font-semibold text-gray-900">
                {s.name}
              </span>
              <span className="truncate text-xs text-gray-500">{s.email}</span>
              <span className="text-xs text-[#BF9B53] font-semibold truncate">
                {s.shipmentCode}
              </span>
              <span className="text-[11px] text-gray-400 truncate">
                {s.pickupLocation} to {s.deliveryLocation}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ================= CHAT ================= */}
      <div
        className={`flex-1 flex flex-col bg-white
        ${selectedShipper ? "block" : "hidden lg:flex"}`}
      >
        {!selectedShipper && (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select an accepted shipment to start chat
          </div>
        )}

        {selectedShipper && (
          <>
            <div className="p-4 border-b flex items-center gap-3 font-semibold">
              <button
                className="lg:hidden"
                onClick={() => setSelectedShipper(null)}
              >
                <HiArrowLeft size={22} />
              </button>

              <div className="flex flex-col">
                <span>{selectedShipper.name}</span>
                <span className="text-xs text-[#BF9B53]">
                  {selectedShipper.shipmentCode}
                </span>
                <span
                  className={`text-xs ${
                    selectedShipper.isOnline
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {selectedShipper.isOnline ? "Online" : "Offline"}
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
                  key={msg._id || i}
                  className={`flex ${
                    msg.senderRole === "customer"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg max-w-[75%] ${
                      msg.senderRole === "customer"
                        ? "bg-system-primary text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {msg.isDeleted ? (
                      <p className="italic opacity-80">This message was deleted</p>
                  ) : msg.media?.length > 0 && (
                      <div className="space-y-2 mb-2">
                        {msg.media.map((item, idx) => (
                          <ChatAttachment key={item.public_id || idx} item={item} />
                        ))}
                      </div>
                    )}
                    {!msg.isDeleted && editingMessageId === msg._id ? (
                      <div className="flex min-w-[260px] items-center gap-2">
                        <input
                          value={editMessageText}
                          onChange={(e) => setEditMessageText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEditedMessage();
                            if (e.key === "Escape") cancelEditMessage();
                          }}
                          className="min-w-0 flex-1 rounded border border-white/40 px-2 py-1 text-sm text-gray-900"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={saveEditedMessage}
                          className="rounded bg-white/20 p-1"
                          title="Save edit"
                        >
                          <FiCheck size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditMessage}
                          className="rounded bg-white/20 p-1"
                          title="Cancel edit"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ) : (
                      !msg.isDeleted &&
                        (msg.message || msg.text) && (
                          <p className="break-words">
                            {renderMessageText(msg.message || msg.text)}
                          </p>
                        )
                    )}
                    <div className="mt-1 flex items-center justify-between gap-3 text-xs opacity-70">
                      <span>
                        {new Date(msg.createdAt || msg.time).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                        {msg.isEdited && !msg.isDeleted && " · edited"}
                        {msg.isDeleted && " · deleted"}
                      </span>
                      {(canEditMessage(msg) || canDeleteMessage(msg)) &&
                        editingMessageId !== msg._id && (
                          <div className="flex items-center gap-1">
                            {canEditMessage(msg) && (
                              <button
                                type="button"
                                onClick={() => startEditMessage(msg)}
                                className="rounded p-1 hover:bg-white/20"
                                title="Edit message"
                              >
                                <FiEdit2 size={13} />
                              </button>
                            )}
                            {canDeleteMessage(msg) && (
                              <button
                                type="button"
                                onClick={() => deleteMessage(msg)}
                                className="rounded p-1 hover:bg-white/20"
                                title="Delete message"
                              >
                                <FiTrash2 size={13} />
                              </button>
                            )}
                          </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div ref={chatEndRef} />
            </div>

            <div className="p-3 border-t space-y-2">
              {isChatLocked && (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
                  Chat is locked because this shipment is completed.
                </div>
              )}
              {selectedImage && (
                <div className="relative w-24">
                  {selectedImage.type === "application/pdf" ? (
                    <div className="flex h-20 w-24 items-center justify-center rounded border bg-gray-50 text-[#BF9B53]">
                      <FiFileText size={24} />
                    </div>
                  ) : (
                    <img
                      src={selectedImage.preview}
                      alt="Selected"
                      className="w-24 h-20 object-cover rounded border"
                    />
                  )}
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
                  accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => !isChatLocked && fileInputRef.current?.click()}
                  disabled={isChatLocked}
                  className="border rounded px-3 text-gray-600 hover:bg-gray-50"
                  title="Attach image"
                >
                  <FiImage size={18} />
                </button>
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={isChatLocked}
                  className="flex-1 border rounded px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder={
                    isChatLocked
                      ? "Chat locked after shipment completion"
                      : "Type a message..."
                  }
                />
                <button
                  onClick={isChatLocked ? undefined : handleSendMessage}
                  disabled={sending || isChatLocked}
                  className="inline-flex min-w-[72px] items-center justify-center gap-2 rounded bg-system-primary px-4 text-white disabled:opacity-60"
                  title={isChatLocked ? "Chat locked" : "Send message"}
                >
                  {isChatLocked ? <FiLock size={18} /> : sending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerChatOverview;
