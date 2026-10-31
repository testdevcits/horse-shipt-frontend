import useChatTyping from "../../hooks/useChatTyping";
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { HiSearch, HiArrowLeft } from "react-icons/hi";
import { FiCheck, FiEdit2, FiFileText, FiImage, FiLock, FiTrash2, FiX } from "react-icons/fi";
import PageLoader from "../../components/common/PageLoader";
import ClearSearchButton from "../../components/common/ClearSearchButton";
import { useShipperChat } from "../../contexts/shipperContext/ShipperChatContext";
import { useAuth } from "../../contexts/AuthContext";
import { socket, connectSocket } from "../../services/socket";
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
      className="flex max-w-full items-center gap-2 rounded-md border border-white/30 bg-white/15 px-3 py-2 text-sm font-semibold hover:bg-white/25"
    >
      <FiFileText className="shrink-0" size={18} />
      <span className="truncate">{item.originalName || "Open PDF"}</span>
    </a>
  ) : (
    <a href={item.url} target="_blank" rel="noreferrer" className="block max-w-full">
      <img
        src={item.url}
        alt={item.originalName || "Chat attachment"}
        className="max-h-64 max-w-full rounded-md object-contain"
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

const mergeMessages = (current, incoming) => {
  const messagesById = new Map();
  [...current, ...incoming].forEach((message, index) => {
    const key = message?._id || `${message?.createdAt || "unknown"}-${index}`;
    messagesById.set(key, message);
  });

  return [...messagesById.values()].sort(
    (left, right) =>
      new Date(left.createdAt || left.time || 0) -
      new Date(right.createdAt || right.time || 0)
  );
};

const ChatOverview = () => {
  const { customers, loading, fetchCustomers } = useShipperChat();
  const { token } = useAuth();
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
  const partnerTyping = useChatTyping(roomId, newMessage);
  const [selectedImage, setSelectedImage] = useState(null);
  const [sending, setSending] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState("");
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [deletingMessage, setDeletingMessage] = useState(false);
  const [now, setNow] = useState(Date.now());

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const activeRoomIdRef = useRef(null);

  const fetchRoomMessages = useCallback(
    async (nextRoomId, { silent = false } = {}) => {
      if (!nextRoomId || !token) return;

      if (!silent) setMessagesLoading(true);
      try {
        const messagesRes = await axios.get(
          `${API_BASE_URL}/shipper/chat/rooms/${nextRoomId}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const fetchedMessages = messagesRes.data?.messages || [];
        if (activeRoomIdRef.current?.toString() === nextRoomId.toString()) {
          setMessages((current) => mergeMessages(current, fetchedMessages));
        }
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
    activeRoomIdRef.current = null;

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

        activeRoomIdRef.current = nextRoomId;
        setRoomId(nextRoomId);

        if (!cancelled) await fetchRoomMessages(nextRoomId);

        const joinRoom = () => {
          if (!socket.connected) return;

          let refreshTimeout;
          socket.emit(
            "horse_shipt:join_chat_room",
            { roomId: nextRoomId },
            (result) => {
              window.clearTimeout(refreshTimeout);
              if (!result?.success) {
                console.warn("Shipper chat room join failed:", result?.message);
              }
              if (!cancelled) {
                fetchRoomMessages(nextRoomId, { silent: true });
              }
            }
          );
          // Keep history in sync even if an older server does not return a join acknowledgement.
          refreshTimeout = window.setTimeout(() => {
            if (!cancelled) fetchRoomMessages(nextRoomId, { silent: true });
          }, 1500);
        };

        const syncWhenVisible = () => {
          if (document.visibilityState !== "visible" || cancelled) return;
          if (!socket.connected) connectSocket();
          else joinRoom();
          fetchRoomMessages(nextRoomId, { silent: true });
        };

        socket.on("connect", joinRoom);
        cleanupSocketJoin = () => socket.off("connect", joinRoom);
        document.addEventListener("visibilitychange", syncWhenVisible);
        window.addEventListener("focus", syncWhenVisible);
        const cleanupVisibilitySync = () => {
          document.removeEventListener("visibilitychange", syncWhenVisible);
          window.removeEventListener("focus", syncWhenVisible);
        };
        const cleanupJoin = cleanupSocketJoin;
        cleanupSocketJoin = () => {
          cleanupJoin();
          cleanupVisibilitySync();
          activeRoomIdRef.current = null;
        };
        if (socket.connected) joinRoom();
        else connectSocket();
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
  }, [selectedUser, token, fetchRoomMessages]);

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

    const handleChatMessageCreated = (payload) => {
      const msg = payload?.message;
      const msgRoomId =
        typeof msg?.chatRoom === "object" ? msg.chatRoom?._id : msg?.chatRoom;
      const sameRoom = msgRoomId?.toString() === roomId.toString();
      const sameShipment =
        payload?.shipmentId?.toString() ===
        selectedUser?.shipmentId?.toString();
      if (!msg || (!sameRoom && !sameShipment)) return;

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
    socket.on("horse_shipt:chat_message_created", handleChatMessageCreated);
    socket.on("messageEdited", handleMessageEdited);
    socket.on("messageDeleted", handleMessageDeleted);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("horse_shipt:chat_message_created", handleChatMessageCreated);
      socket.off("messageEdited", handleMessageEdited);
      socket.off("messageDeleted", handleMessageDeleted);
    };
  }, [roomId, selectedUser?.shipmentId]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!roomId || !token) return;

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchRoomMessages(roomId, { silent: true });
      }
    }, shouldUsePollingFallback ? 5000 : 15000);

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
    if (isChatLocked || msg?.isDeleted || !msg?._id || msg.senderRole !== "shipper") return false;
    if (!(msg.message || msg.text) || msg.media?.length) return false;
    const createdAt = new Date(msg.createdAt || msg.time).getTime();
    if (!createdAt || Number.isNaN(createdAt)) return false;
    return now - createdAt <= 60 * 1000;
  };

  const canDeleteMessage = (msg) => {
    if (isChatLocked || msg?.isDeleted || !msg?._id || msg.senderRole !== "shipper") return false;
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
        `${API_BASE_URL}/shipper/chat/rooms/${roomId}/messages/${editingMessageId}`,
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

  const deleteMessage = (msg) => {
    if (msg?._id && roomId) setMessageToDelete(msg);
  };

  const confirmDeleteMessage = async () => {
    const msg = messageToDelete;
    if (!msg?._id || !roomId || deletingMessage) return;

    setDeletingMessage(true);
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/shipper/chat/rooms/${roomId}/messages/${msg._id}`,
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
      setMessageToDelete(null);
    } catch (err) {
      Toast.error(err.response?.data?.message || "Failed to delete message");
    } finally {
      setDeletingMessage(false);
    }
  };

  const handleSendMessage = () => {
    if (
      selectedUser?.isChatLocked ||
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

  const isChatLocked = Boolean(selectedUser?.isChatLocked);

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 max-w-full overflow-hidden border bg-white font-montserrat shadow">
      {/* ================= LEFT: CUSTOMER LIST ================= */}
      <div
        className={`flex h-full min-h-0 w-full shrink-0 flex-col overflow-hidden border-r bg-white lg:w-[380px] xl:w-[420px]
        ${selectedUser ? "hidden lg:flex" : "flex"}`}
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
            className="w-full border py-2 pl-10 pr-10"
          />
          <ClearSearchButton value={search} onClear={() => setSearch("")} />
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

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
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
              className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-gray-100"
            >
              <div className="relative h-11 w-11 shrink-0">
                <img
                  src={u.avatar}
                  alt={u.name}
                  className="h-11 w-11 rounded-full border border-system-primary object-cover"
                />
                <span
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                    u.isOnline ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="truncate text-sm font-semibold text-gray-900">
                  {u.name}
                </span>
                <span className="truncate text-xs text-gray-500">{u.email}</span>
                <span className="truncate text-xs font-semibold text-[#BF9B53]">
                  {u.shipmentCode}
                </span>
                <span className="truncate text-[11px] text-gray-400">
                  {u.pickupLocation} to {u.deliveryLocation}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= RIGHT: CHAT ================= */}
      <div
        className={`relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white
        ${selectedUser ? "" : "hidden lg:flex"}`}
      >
        {!selectedUser && (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select an accepted shipment to start chat
          </div>
        )}

        {selectedUser && (
          <>
            <div className="flex min-w-0 shrink-0 items-center gap-3 border-b p-4 font-semibold">
              <button
                className="lg:hidden"
                onClick={() => setSelectedUser(null)}
              >
                <HiArrowLeft size={22} />
              </button>

              <div className="flex min-w-0 flex-col">
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

            <div className="min-h-0 min-w-0 flex-1 space-y-3 overflow-x-hidden overflow-y-auto overscroll-contain p-4">
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
                    msg.senderRole === "shipper"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`min-w-0 max-w-[85%] break-words rounded-lg p-2 sm:max-w-[75%] ${
                      msg.senderRole === "shipper"
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
                      <div className="flex min-w-0 max-w-full items-center gap-2">
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

            <div className="min-w-0 shrink-0 space-y-2 border-t p-3">
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

              {partnerTyping && !isChatLocked && (
                <p role="status" className="mb-2 text-xs text-gray-500">Typing...</p>
              )}

              <div className="flex min-w-0 gap-2">
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
                  className="min-w-0 flex-1 rounded border px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500"
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
        {messageToDelete && selectedUser && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/35 p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-chat-message-title"
              className="w-full max-w-sm rounded-lg border border-[#eadfca] bg-white p-5 shadow-xl"
            >
              <h2 id="delete-chat-message-title" className="text-base font-bold text-slate-900">
                Delete this message?
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                This message will be removed from the conversation.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMessageToDelete(null)}
                  disabled={deletingMessage}
                  className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteMessage}
                  disabled={deletingMessage}
                  className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {deletingMessage ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatOverview;
