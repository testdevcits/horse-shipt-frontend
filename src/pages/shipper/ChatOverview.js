import React, { useState, useRef, useEffect, useMemo } from "react";
import { HiSearch, HiArrowLeft } from "react-icons/hi";
import Select from "../../components/common/Select";
import PageLoader from "../../components/common/PageLoader";
import { useShipperChat } from "../../contexts/shipperContext/ShipperChatContext";

const ChatOverview = () => {
  const { customers, loading } = useShipperChat();

  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const chatEndRef = useRef(null);

  /* ===============================
     Auto scroll on new messages
  ================================ */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedUser?.messages]);

  /* ===============================
     Send Message (TEMP – Socket later)
  ================================ */
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;

    setSelectedUser((prev) => ({
      ...prev,
      messages: [
        ...(prev.messages || []),
        {
          from: "shipper",
          text: newMessage,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
    }));

    setNewMessage("");
  };

  /* ===============================
     SEARCH + FILTER
  ================================ */
  const filteredUsers = useMemo(() => {
    return (customers || [])
      .filter((u) => u.name?.toLowerCase().includes(search.toLowerCase()))
      .filter((u) => {
        if (filter === "online") return u.isLogin;
        if (filter === "offline") return !u.isLogin;
        return true;
      });
  }, [customers, search, filter]);

  if (loading) {
    return (
      <PageLoader text="Loading chats..." fullScreen={false} color="#BF9B53" />
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white border shadow font-montserrat overflow-hidden">
      {/* ================= LEFT: CUSTOMER LIST ================= */}
      <div
        className={`w-full lg:w-1/4 border-r overflow-y-auto bg-white
        ${selectedUser ? "hidden lg:block" : "block"}`}
      >
        <div className="p-4 border-b font-semibold">Customers</div>

        {/* Search */}
        <div className="p-3 relative">
          <HiSearch
            className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer"
            className="w-full border rounded-md pl-10 py-2"
          />
        </div>

        {/* Filter */}
        <div className="px-3 pb-3">
          <Select
            value={filter}
            onChange={setFilter}
            options={[
              { label: "All Customers", value: "all" },
              { label: "Online", value: "online" },
              { label: "Offline", value: "offline" },
            ]}
          />
        </div>

        {filteredUsers.length === 0 && (
          <p className="p-4 text-gray-500 text-sm">No customers found</p>
        )}

        {filteredUsers.map((u) => (
          <div
            key={u._id}
            onClick={() => setSelectedUser({ ...u, messages: [] })}
            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100"
          >
            {/* Avatar */}
            <div className="relative">
              <img
                src={
                  u.profilePicture ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    u.name
                  )}`
                }
                alt={u.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  u.isLogin ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <span className="font-medium">{u.name}</span>
              <span className="text-xs text-gray-500">{u.email}</span>
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
            Select a customer to start chat
          </div>
        )}

        {selectedUser && (
          <>
            {/* Header (Mobile + Desktop) */}
            <div className="p-4 border-b flex items-center gap-3 font-semibold">
              <button
                className="lg:hidden"
                onClick={() => setSelectedUser(null)}
              >
                <HiArrowLeft size={22} />
              </button>

              <div className="flex flex-col">
                <span>{selectedUser.name}</span>
                <span
                  className={`text-xs ${
                    selectedUser.isLogin ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {selectedUser.isLogin ? "Online" : "Offline"}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedUser.messages.length === 0 && (
                <p className="text-gray-400 text-sm text-center">
                  No messages yet
                </p>
              )}

              {selectedUser.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.from === "shipper" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg max-w-[75%] ${
                      msg.from === "shipper"
                        ? "bg-system-primary text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className="text-xs block mt-1 opacity-70">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t flex gap-2">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 border rounded px-3 py-2"
                placeholder="Type a message..."
              />
              <button
                onClick={handleSendMessage}
                className="bg-system-primary text-white px-4 rounded"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatOverview;
