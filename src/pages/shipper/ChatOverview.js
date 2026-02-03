import React, { useState, useRef, useEffect } from "react";
import { HiArrowLeft, HiSearch, HiX } from "react-icons/hi";
import Select from "../../components/common/Select";
import { useShipperChat } from "../../contexts/shipperContext/ShipperChatContext";

const ChatOverview = () => {
  // ---------------- CONTEXT ----------------
  const { customers, loading } = useShipperChat();

  // ---------------- STATE ----------------
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsMobile, setShowDetailsMobile] = useState(false);
  const [showDetailsDesktop, setShowDetailsDesktop] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const chatEndRef = useRef(null);

  // ---------------- SCROLL TO BOTTOM ----------------
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedUser?.messages]);

  // ---------------- SEND MESSAGE ----------------
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;

    setSelectedUser({
      ...selectedUser,
      messages: [
        ...(selectedUser.messages || []),
        {
          from: "shipper",
          text: newMessage,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
    });
    setNewMessage("");
  };

  // ---------------- FILTERED USERS ----------------
  const filteredUsers = (customers || []).filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* HEADER */}
      <div className="flex flex-col gap-6 font-[Montserrat]">
        <h1 className="text-3xl font-montserrat text-gray-800">Chats</h1>

        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="w-full max-w-md relative">
            <HiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
              size={18}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full border-2 border-gray-400 rounded-md pl-10 py-2"
            />
          </div>

          <div className="min-w-[160px]">
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={[
                { label: "All Customers", value: "all" },
                { label: "Active", value: "active" },
                { label: "Offline", value: "offline" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="flex flex-col lg:flex-row bg-gray-50 shadow-lg h-[741px] border overflow-hidden font-[Montserrat]">
        {/* LEFT LIST */}
        <div
          className={`lg:w-1/4 bg-white border-r overflow-y-auto ${
            selectedUser && "hidden lg:block"
          }`}
        >
          <div className="p-4 border-b font-semibold">Customers</div>

          {loading ? (
            <p className="p-4 text-center text-gray-500">Loading...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="p-4 text-center text-gray-500">No customers found</p>
          ) : (
            filteredUsers.map((u) => (
              <div
                key={u._id}
                onClick={() => {
                  setSelectedUser(u);
                  setShowDetailsMobile(false);
                }}
                className={`p-3 cursor-pointer ${
                  selectedUser?._id === u._id
                    ? "bg-[#F2EBDD]"
                    : "hover:bg-gray-100"
                }`}
              >
                <p>{u.name}</p>
                <p className="text-sm text-gray-600">{u.email}</p>
              </div>
            ))
          )}
        </div>

        {/* CHAT */}
        <div className="flex-1 flex flex-col min-h-0 bg-white ">
          {/* MOBILE HEADER */}
          {selectedUser && (
            <div className="lg:hidden p-3 border-b flex justify-between items-center">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex gap-1 items-center"
              >
                <HiArrowLeft /> Back
              </button>
              <button
                onClick={() => setShowDetailsMobile(true)}
                className="text-system-primary font-semibold"
              >
                See Profile
              </button>
            </div>
          )}

          {/* DESKTOP HEADER */}
          {selectedUser && (
            <div className="hidden lg:flex justify-between p-4 border-b font-semibold ">
              Conversation with {selectedUser.name}
              <button
                onClick={() => setShowDetailsDesktop(!showDetailsDesktop)}
                className="text-system-primary font-semibold transition-all duration-200 hover:text-system-primary/80"
              >
                {showDetailsDesktop ? "Hide Profile" : "See Profile"}
              </button>
            </div>
          )}

          {/* MESSAGES (SCROLL FIXED) */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 vehicle-scroll">
            {!selectedUser && (
              <p className="text-center text-gray-500">Select a customer</p>
            )}
            {selectedUser?.messages?.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.from === "shipper" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-2 rounded-lg max-w-[70%] ${
                    msg.from === "shipper"
                      ? "bg-system-primary text-white"
                      : "bg-gray-200"
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="text-xs">{msg.time}</span>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* INPUT */}
          {selectedUser && (
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
          )}
        </div>

        {/* DESKTOP PROFILE */}
        {selectedUser && showDetailsDesktop && (
          <div className="hidden lg:block lg:w-1/4 bg-white border-l p-4 overflow-y-auto">
            <h2 className="font-semibold mb-2">Details</h2>
            <p>
              <b>Name:</b> {selectedUser.name}
            </p>
            <p>
              <b>Email:</b> {selectedUser.email}
            </p>
          </div>
        )}
      </div>

      {/* MOBILE PROFILE PANEL */}
      {selectedUser && showDetailsMobile && (
        <div className="fixed inset-0 bg-white z-50 lg:hidden overflow-y-auto">
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
          </div>
        </div>
      )}
    </>
  );
};

export default ChatOverview;
