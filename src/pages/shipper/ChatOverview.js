import React, { useState, useRef, useEffect, useMemo } from "react";
import { HiSearch, HiX } from "react-icons/hi";
import Select from "../../components/common/Select";
import PageLoader from "../../components/common/PageLoader";
import { useShipperChat } from "../../contexts/shipperContext/ShipperChatContext";

const ChatOverview = () => {
  const { customers, loading } = useShipperChat();

  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsMobile, setShowDetailsMobile] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const chatEndRef = useRef(null);

  /* ===============================
     Auto scroll
  ================================ */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedUser?.messages]);

  /* ===============================
     Send Message (TEMP)
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
     Search filter
  ================================ */
  const filteredUsers = useMemo(() => {
    return (customers || []).filter((u) =>
      u.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [customers, search]);

  if (loading) {
    return (
      <PageLoader text="Loading chats..." fullScreen={false} color="#BF9B53" />
    );
  }

  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-6 font-montserrat">
        <h1 className="text-3xl text-gray-800">Chats</h1>

        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="w-full max-w-md relative">
            <HiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
              size={18}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name"
              className="w-full border-2 border-gray-400 rounded-md pl-10 py-2"
            />
          </div>

          <div className="min-w-[160px]">
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={[
                { label: "All Customers", value: "all" },
                { label: "Online", value: "online" },
                { label: "Offline", value: "offline" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* ================= MAIN ================= */}
      <div className="flex flex-col lg:flex-row bg-gray-50 shadow-lg h-[741px] border overflow-hidden font-montserrat">
        {/* ================= CUSTOMER LIST ================= */}
        <div
          className={`lg:w-1/4 bg-white border-r overflow-y-auto ${
            selectedUser && "hidden lg:block"
          }`}
        >
          <div className="p-4 border-b font-semibold">Customers</div>

          {filteredUsers.length === 0 && (
            <p className="p-4 text-gray-500 text-sm">No customers found</p>
          )}

          {filteredUsers.map((u) => (
            <div
              key={u._id}
              onClick={() => {
                setSelectedUser({ ...u, messages: [] });
                setShowDetailsMobile(false);
              }}
              className={`flex items-center gap-3 p-3 cursor-pointer ${
                selectedUser?._id === u._id
                  ? "bg-[#F2EBDD]"
                  : "hover:bg-gray-100"
              }`}
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
                <span className="font-medium text-gray-800">{u.name}</span>
                <span className="text-xs text-gray-500">{u.email}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ================= CHAT ================= */}
        <div className="flex-1 flex flex-col bg-white">
          {!selectedUser && (
            <p className="m-auto text-gray-500">
              Select a customer to start chat
            </p>
          )}

          {selectedUser && (
            <>
              <div className="p-4 border-b font-semibold flex justify-between">
                <span>{selectedUser.name}</span>
                <span
                  className={`text-sm ${
                    selectedUser.isLogin ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {selectedUser.isLogin ? "Online" : "Offline"}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <p className="text-gray-400 text-sm text-center">
                  No messages yet
                </p>
                <div ref={chatEndRef} />
              </div>

              <div className="p-3 border-t flex gap-2">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
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

      {/* ================= MOBILE PROFILE ================= */}
      {selectedUser && showDetailsMobile && (
        <div className="fixed inset-0 bg-white z-50 lg:hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">Profile</h2>
            <button onClick={() => setShowDetailsMobile(false)}>
              <HiX size={22} />
            </button>
          </div>

          <div className="p-4 space-y-2">
            <p>
              <b>Name:</b> {selectedUser.name}
            </p>
            <p>
              <b>Email:</b> {selectedUser.email}
            </p>
            <p>
              <b>Status:</b> {selectedUser.isLogin ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatOverview;
