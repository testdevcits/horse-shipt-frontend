import React, { useState, useRef, useEffect } from "react";
import { HiArrowLeft, HiSearch, HiX } from "react-icons/hi";
import Select from "../../components/common/Select";

const ChatOverview = () => {
  const mockUsers = [
    {
      _id: "1",
      userName: "Rahul Sharma",
      numberOfHorses: 3,
      pickupLocation: "Delhi",
      deliveryLocation: "Mumbai",
      contact: "rahul@example.com",
      phone: "9876543210",
      messages: [
        { from: "user", text: "Hello, any updates?", time: "10:00 AM" },
        {
          from: "shipper",
          text: "Your shipment is on the way.",
          time: "10:05 AM",
        },
      ],
    },
    {
      _id: "2",
      userName: "Anita Singh",
      numberOfHorses: 2,
      pickupLocation: "Bengaluru",
      deliveryLocation: "Hyderabad",
      contact: "anita@example.com",
      phone: "9123456780",
      messages: [
        {
          from: "user",
          text: "When will my shipment arrive?",
          time: "09:30 AM",
        },
      ],
    },
    {
      _id: "3",
      userName: "Vikram Patil",
      numberOfHorses: 1,
      pickupLocation: "Chennai",
      deliveryLocation: "Pune",
      contact: "vikram@example.com",
      phone: "9988776655",
      messages: [],
    },
  ];

  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsMobile, setShowDetailsMobile] = useState(false);
  const [showDetailsDesktop, setShowDetailsDesktop] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const chatEndRef = useRef(null);

  const filterOptions = [
    { label: "All Shipments", value: "all" },
    { label: "Active", value: "active" },
    { label: "Completed", value: "completed" },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedUser?.messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;

    const updatedUser = {
      ...selectedUser,
      messages: [
        ...selectedUser.messages,
        {
          from: "shipper",
          text: newMessage,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
    };
    setSelectedUser(updatedUser);
    setNewMessage("");
  };

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.userName.toLowerCase().includes(search.toLowerCase()) ||
      user.pickupLocation.toLowerCase().includes(search.toLowerCase()) ||
      user.deliveryLocation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* ================= TOP HEADER ================= */}
      <div className="flex flex-col gap-6">
        {/* Heading on Top */}
        <h1 className="text-3xl font-montserrat text-gray-800">Chats</h1>

        {/* Search + Filter Row */}
        <div className="flex items-center justify-between gap-3 mb-6">
          {/* Search - Left */}
          <div className="w-full max-w-md relative ">
            {/* Search Icon */}
            <HiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
              size={18}
            />

            {/* Input */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full border border-2 border-gray-400 rounded-md pl-10 pr-3 py-2
               focus:outline-none focus:ring-1 focus:ring-system-primary font-montserrat"
            />
          </div>

          {/* Filter - Right */}
          <div className="min-w-[160px]">
            <Select
              label="Filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={filterOptions}
              className="mb-0"
            />
          </div>
        </div>
      </div>

      {/* ================= MAIN CHAT CONTAINER ================= */}
      <div
        className="flex flex-col lg:flex-row font-montserrat bg-gray-50 shadow-lg"
        style={{
          height: "741px",
          borderWidth: "1px",
          borderTopLeftRadius: "6px",
          borderTopRightRadius: "6px",
          overflow: "hidden",
        }}
      >
        {/* ---------------- LEFT: USERS LIST ---------------- */}
        <div
          className={`lg:w-1/4 border-r border-gray-300 bg-white overflow-y-auto transition-all duration-300 scrollbar-thin scrollbar-thumb-[#BF9B53] scrollbar-track-gray-200 ${
            selectedUser && "hidden lg:block"
          }`}
        >
          <div className="p-4 border-b border-gray-300">
            <h2 className="text-xl font-semibold">Shipments</h2>
          </div>

          <ul className="space-y-2">
            {filteredUsers.map((user) => (
              <li
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`p-3 cursor-pointer transition ${
                  selectedUser?._id === user._id
                    ? "bg-[#F2EBDD] font-semibold"
                    : "hover:bg-gray-100"
                }`}
              >
                <p>{user.userName}</p>
                <p className="text-sm text-gray-600">
                  {user.numberOfHorses} Horses: {user.pickupLocation} →{" "}
                  {user.deliveryLocation}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* ---------------- CENTER: CHAT (UNCHANGED UI) ---------------- */}
        <div className="flex-1 flex flex-col bg-white border-r border-gray-300">
          {/* Mobile Top Bar */}
          <div className="lg:hidden p-2 border-b border-gray-300 flex items-center justify-between">
            {selectedUser && (
              <>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex items-center gap-2"
                >
                  <HiArrowLeft size={20} /> Back
                </button>
                <button
                  onClick={() => setShowDetailsMobile((prev) => !prev)}
                  className="text-system-primary font-semibold"
                >
                  {showDetailsMobile ? "Close Profile" : "See Profile"}
                </button>
              </>
            )}
          </div>

          {selectedUser && (
            <div className="hidden lg:flex justify-between items-center p-4 border-b border-gray-300 font-semibold">
              <span className="text-xl font-semibold">
                Conversation with {selectedUser.userName}
              </span>
              <button
                onClick={() => setShowDetailsDesktop((prev) => !prev)}
                className="text-system-primary font-semibold"
              >
                {showDetailsDesktop ? "Hide Profile" : "See Profile"}
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 flex flex-col p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-[#BF9B53] scrollbar-track-gray-200">
            <div className="flex-1 space-y-4">
              {selectedUser ? (
                <>
                  {selectedUser.messages.length === 0 && (
                    <p className="text-gray-500 text-center mt-4">
                      No messages yet.
                    </p>
                  )}
                  {selectedUser.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.from === "shipper" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg max-w-[70%] ${
                          msg.from === "shipper"
                            ? "bg-system-primary text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        <p>{msg.text}</p>
                        <span className="text-xs text-gray-500">
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </>
              ) : (
                <p className="text-gray-500 text-center mt-4">
                  Select a shipment to start chat
                </p>
              )}
            </div>
          </div>

          {/* Input Box */}
          {selectedUser && (
            <div className="p-4 border-t border-gray-300 flex gap-2 flex-shrink-0">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-system-primary"
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                className="bg-system-primary text-white px-4 py-2 rounded hover:bg-system-primary/80 transition"
              >
                Send
              </button>
            </div>
          )}
        </div>

        {/* ---------------- RIGHT: DETAILS ---------------- */}
        {selectedUser && showDetailsDesktop && (
          <div className="lg:w-1/4 bg-white overflow-y-auto hidden lg:flex flex-col scrollbar-thin scrollbar-thumb-[#BF9B53] scrollbar-track-gray-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-300">
              <h2 className="text-lg font-semibold">Details</h2>
              <button onClick={() => setShowDetailsDesktop(false)}>
                <HiX size={22} />
              </button>
            </div>

            <div className="space-y-2 p-4">
              <p>
                <strong>Name:</strong> {selectedUser.userName}
              </p>
              <p>
                <strong>Horses:</strong> {selectedUser.numberOfHorses}
              </p>
              <p>
                <strong>Pickup:</strong> {selectedUser.pickupLocation}
              </p>
              <p>
                <strong>Delivery:</strong> {selectedUser.deliveryLocation}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.contact}
              </p>
              <p>
                <strong>Phone:</strong> {selectedUser.phone}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatOverview;
