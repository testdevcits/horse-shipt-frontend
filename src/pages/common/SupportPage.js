import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiCheckCircle, FiClock, FiMessageSquare, FiPlus, FiSend } from "react-icons/fi";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../contexts/AuthContext";

const statusStyles = {
  open: "bg-blue-50 text-blue-700 border-blue-100",
  in_progress: "bg-amber-50 text-amber-700 border-amber-100",
  resolved: "bg-green-50 text-green-700 border-green-100",
};

const statusLabels = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const categoryOptions = ["General", "Shipment", "Quote", "Payment", "Account"];

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

const SupportPage = ({ role = "customer" }) => {
  const { token, user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    subject: "",
    category: "General",
    message: "",
    priority: "normal",
  });
  const [reply, setReply] = useState("");

  const endpoint = `${API_BASE_URL}/${role}/support`;
  const authHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  const selectedTicket = tickets.find((ticket) => ticket._id === selectedId) || null;

  const fetchTickets = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(endpoint, authHeaders);
      const nextTickets = res.data?.data || [];
      setTickets(nextTickets);
      setSelectedId((current) => current || nextTickets[0]?._id || null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load support requests.");
    } finally {
      setLoading(false);
    }
  }, [authHeaders, endpoint, token]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleCreateTicket = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.subject.trim() || !form.message.trim()) {
      setError("Subject and message are required.");
      return;
    }

    setSaving(true);
    try {
      const res = await axios.post(endpoint, form, authHeaders);
      const ticket = res.data?.data;
      setTickets((prev) => [ticket, ...prev.filter((item) => item._id !== ticket._id)]);
      setSelectedId(ticket._id);
      setForm({ subject: "", category: "General", message: "", priority: "normal" });
      setSuccess("Support request submitted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit support request.");
    } finally {
      setSaving(false);
    }
  };

  const handleReply = async (event) => {
    event.preventDefault();
    if (!selectedTicket || !reply.trim()) return;

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.post(
        `${endpoint}/${selectedTicket._id}/messages`,
        { message: reply },
        authHeaders
      );
      const updatedTicket = res.data?.data;
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket._id === updatedTicket._id ? updatedTicket : ticket
        )
      );
      setReply("");
      setSuccess("Message sent successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send message.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] bg-[#FAF8F3] px-4 py-6 font-montserrat sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#BF9B53]">
              Support Center
            </p>
            <h1 className="text-2xl font-bold text-[#111827]">
              {role === "shipper" ? "Shipper" : "Customer"} Support
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#4B5563]">
            <FiMessageSquare className="text-[#BF9B53]" />
            <span>{user?.email || "Your account"}</span>
          </div>
        </div>

        {(error || success) && (
          <div
            className={`border px-4 py-3 text-sm font-medium ${
              error
                ? "border-red-100 bg-red-50 text-red-700"
                : "border-green-100 bg-green-50 text-green-700"
            }`}
          >
            {error || success}
          </div>
        )}

        <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
          <section className="border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-4 py-3">
              <h2 className="text-sm font-bold text-[#111827]">New Request</h2>
            </div>
            <form onSubmit={handleCreateTicket} className="space-y-4 p-4">
              <input
                value={form.subject}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, subject: event.target.value }))
                }
                placeholder="Short subject"
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#BF9B53]"
                maxLength={140}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, category: event.target.value }))
                  }
                  className="border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#BF9B53]"
                >
                  {categoryOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <select
                  value={form.priority}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, priority: event.target.value }))
                  }
                  className="border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#BF9B53]"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <textarea
                value={form.message}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, message: event.target.value }))
                }
                rows={5}
                placeholder="Write your issue or question"
                className="w-full resize-none border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#BF9B53]"
                maxLength={3000}
              />
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 bg-[#BF9B53] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#a88642] disabled:opacity-60"
              >
                <FiPlus />
                {saving ? "Submitting..." : "Create Support Request"}
              </button>
            </form>
          </section>

          <section className="grid min-h-[560px] gap-5 lg:grid-cols-[320px_1fr]">
            <div className="border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-4 py-3">
                <h2 className="text-sm font-bold text-[#111827]">My Requests</h2>
              </div>
              <div className="max-h-[620px] overflow-y-auto">
                {loading ? (
                  <p className="p-4 text-sm text-[#6B7280]">Loading requests...</p>
                ) : tickets.length === 0 ? (
                  <p className="p-4 text-sm text-[#6B7280]">No support requests yet.</p>
                ) : (
                  tickets.map((ticket) => (
                    <button
                      key={ticket._id}
                      type="button"
                      onClick={() => setSelectedId(ticket._id)}
                      className={`block w-full border-b border-gray-100 px-4 py-3 text-left transition hover:bg-[#FBFAF7] ${
                        selectedId === ticket._id ? "bg-[#FBFAF7]" : "bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 text-sm font-bold text-[#111827]">
                          {ticket.subject}
                        </p>
                        <span
                          className={`shrink-0 border px-2 py-0.5 text-[10px] font-bold ${
                            statusStyles[ticket.status]
                          }`}
                        >
                          {statusLabels[ticket.status]}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-[#6B7280]">
                        {ticket.latestMessage?.message || ticket.category}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="flex min-h-[560px] flex-col border border-gray-200 bg-white">
              {selectedTicket ? (
                <>
                  <div className="border-b border-gray-100 px-5 py-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-[#111827]">
                          {selectedTicket.subject}
                        </h2>
                        <p className="text-xs text-[#6B7280]">
                          {selectedTicket.category} • {formatDate(selectedTicket.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex w-fit items-center gap-1 border px-3 py-1 text-xs font-bold ${
                          statusStyles[selectedTicket.status]
                        }`}
                      >
                        {selectedTicket.status === "resolved" ? <FiCheckCircle /> : <FiClock />}
                        {statusLabels[selectedTicket.status]}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto bg-[#FCFBF8] p-5">
                    {selectedTicket.messages?.map((item) => {
                      const mine = item.senderRole === role;
                      return (
                        <div
                          key={item._id || item.createdAt}
                          className={`flex ${mine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[78%] border px-4 py-3 text-sm shadow-sm ${
                              mine
                                ? "border-[#BF9B53]/30 bg-[#BF9B53] text-white"
                                : "border-gray-200 bg-white text-[#111827]"
                            }`}
                          >
                            <p className="whitespace-pre-wrap leading-6">{item.message}</p>
                            <p className={`mt-2 text-[10px] ${mine ? "text-white/80" : "text-[#6B7280]"}`}>
                              {item.senderRole === "admin" ? "Admin" : "You"} • {formatDate(item.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <form onSubmit={handleReply} className="border-t border-gray-100 p-4">
                    <div className="flex gap-3">
                      <textarea
                        value={reply}
                        onChange={(event) => setReply(event.target.value)}
                        rows={2}
                        placeholder={
                          selectedTicket.status === "resolved"
                            ? "Reply to reopen this request"
                            : "Write a message"
                        }
                        className="min-h-[44px] flex-1 resize-none border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#BF9B53]"
                        maxLength={3000}
                      />
                      <button
                        type="submit"
                        disabled={saving || !reply.trim()}
                        className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#BF9B53] text-white transition hover:bg-[#a88642] disabled:opacity-60"
                        title="Send message"
                      >
                        <FiSend />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-[#6B7280]">
                  Select a request or create a new one.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
