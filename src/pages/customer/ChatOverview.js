import React, { useState, useMemo, useEffect, useRef } from "react";
import { HiSearch, HiArrowLeft } from "react-icons/hi";
import PageLoader from "../../components/common/PageLoader";
import { useCustomerChat } from "../../contexts/customerContext/CustomerChatContext";

const CustomerChatOverview = () => {
  const { shippers, loading, fetchShippers } = useCustomerChat();

  const [selectedShipper, setSelectedShipper] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [newMessage, setNewMessage] = useState("");

  const chatEndRef = useRef(null);

  /* ===============================
     FETCH SHIPPERS
  ================================ */
  useEffect(() => {
    fetchShippers();
  }, [fetchShippers]);

  /* ===============================
     AUTO SCROLL
  ================================ */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedShipper?.messages]);

  /* ===============================
     SEARCH + ONLINE/OFFLINE FILTER
  ================================ */
  const filteredShippers = useMemo(() => {
    return (shippers || [])
      .filter((s) => s.name?.toLowerCase().includes(search.toLowerCase()))
      .filter((s) => {
        if (filter === "online") return s.isOnline === true;
        if (filter === "offline") return s.isOnline === false;
        return true;
      });
  }, [shippers, search, filter]);

  /* ===============================
     SEND MESSAGE (TEMP)
  ================================ */
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedShipper) return;

    setSelectedShipper((prev) => ({
      ...prev,
      messages: [
        ...(prev.messages || []),
        {
          from: "customer",
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

  if (loading) {
    return (
      <PageLoader text="Loading chats..." fullScreen={false} color="#BF9B53" />
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white border shadow font-montserrat overflow-hidden">
      {/* ================= SHIPPERS LIST ================= */}
      <div
        className={`w-full lg:w-1/3 border-r overflow-y-auto bg-white
        ${selectedShipper ? "hidden lg:block" : "block"}`}
      >
        <div className="p-4 border-b font-semibold">Shippers</div>

        {/* SEARCH */}
        <div className="p-3 relative">
          <HiSearch
            className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shipper"
            className="w-full border rounded-md pl-10 py-2"
          />
        </div>

        {/* FILTER BUTTONS */}
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

        {filteredShippers.length === 0 && (
          <p className="p-4 text-gray-500 text-sm">No shippers found</p>
        )}

        {filteredShippers.map((s) => (
          <div
            key={s._id}
            onClick={() => setSelectedShipper({ ...s, messages: [] })}
            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100"
          >
            {/* Avatar */}
            <div className="relative">
              <img
                src={s.avatar}
                alt={s.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  s.isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </div>

            <div className="flex flex-col">
              <span className="font-medium">{s.name}</span>
              <span className="text-xs text-gray-500">{s.email}</span>
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
            Select a shipper to start chat
          </div>
        )}

        {selectedShipper && (
          <>
            {/* HEADER */}
            <div className="p-4 border-b flex items-center gap-3 font-semibold">
              <button
                className="lg:hidden"
                onClick={() => setSelectedShipper(null)}
              >
                <HiArrowLeft size={22} />
              </button>

              <div className="flex flex-col">
                <span>{selectedShipper.name}</span>
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

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedShipper.messages?.length === 0 && (
                <p className="text-gray-400 text-sm text-center">
                  No messages yet
                </p>
              )}

              {selectedShipper.messages?.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.from === "customer" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg max-w-[75%] ${
                      msg.from === "customer"
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

            {/* INPUT */}
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

export default CustomerChatOverview;
