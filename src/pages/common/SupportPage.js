import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiPlus,
  FiSend,
} from "react-icons/fi";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../contexts/AuthContext";
import Select from "../../components/common/Select";

const statusLabels = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const statusStyles = {
  open: "border-blue-100 bg-blue-50 text-blue-700",
  in_progress: "border-amber-100 bg-amber-50 text-amber-700",
  resolved: "border-green-100 bg-green-50 text-green-700",
};

const categoryOptions = ["General", "Shipment", "Quote", "Payment", "Account"];
const categorySelectOptions = categoryOptions.map((item) => ({
  value: item,
  label: item,
}));
const prioritySelectOptions = [
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "low", label: "Low" },
];

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "N/A";

const getTicketNumber = (ticket) =>
  ticket?._id ? `HS-${ticket._id.slice(-6).toUpperCase()}` : "HS-NEW";

const SupportPage = ({ role = "customer" }) => {
  const { token, user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [form, setForm] = useState({
    subject: "",
    category: "General",
    message: "",
    priority: "normal",
  });
  const [followUp, setFollowUp] = useState("");

  const endpoint = `${API_BASE_URL}/${role}/support`;
  const authHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  const selectedTicket =
    tickets.find((ticket) => ticket._id === selectedId) || tickets[0] || null;
  const isResolvedTicket = selectedTicket?.status === "resolved";

  const fetchTickets = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setNotice(null);
    try {
      const res = await axios.get(endpoint, authHeaders);
      const nextTickets = res.data?.data || [];
      setTickets(nextTickets);
      setSelectedId((current) => current || nextTickets[0]?._id || null);
    } catch (err) {
      setNotice({
        type: "error",
        message: err.response?.data?.message || "Unable to load support tickets.",
      });
    } finally {
      setLoading(false);
    }
  }, [authHeaders, endpoint, token]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleCreateTicket = async (event) => {
    event.preventDefault();
    setNotice(null);

    if (!form.subject.trim() || !form.message.trim()) {
      setNotice({
        type: "error",
        message: "Subject and issue details are required.",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await axios.post(endpoint, form, authHeaders);
      const ticket = res.data?.data;
      setTickets((prev) => [ticket, ...prev]);
      setSelectedId(ticket._id);
      setForm({
        subject: "",
        category: "General",
        message: "",
        priority: "normal",
      });
      setNotice({ type: "success", message: "Support ticket created successfully." });
    } catch (err) {
      setNotice({
        type: "error",
        message: err.response?.data?.message || "Unable to create support ticket.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFollowUp = async (event) => {
    event.preventDefault();
    if (!selectedTicket || !followUp.trim()) return;
    if (isResolvedTicket) {
      setNotice({
        type: "error",
        message: "Resolved tickets are closed and cannot receive new messages.",
      });
      return;
    }

    setSaving(true);
    setNotice(null);
    try {
      const res = await axios.post(
        `${endpoint}/${selectedTicket._id}/messages`,
        { message: followUp },
        authHeaders
      );
      const updatedTicket = res.data?.data;
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket._id === updatedTicket._id ? updatedTicket : ticket
        )
      );
      setFollowUp("");
      setNotice({ type: "success", message: "Ticket update submitted." });
    } catch (err) {
      setNotice({
        type: "error",
        message: err.response?.data?.message || "Unable to submit ticket update.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] rounded-2xl bg-[#FAF8F3] px-3 py-5 font-montserrat sm:px-5 lg:px-6">
      <div className="w-full space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#BF9B53]">
              Ticket Support
            </p>
            <h1 className="text-2xl font-bold text-[#111827] mt-2">
              {role === "shipper" ? "Shipper" : "Customer"} Support Tickets
            </h1>
          </div>
          <p className="text-sm text-[#4B5563]">{user?.email}</p>
        </div>

        {notice && (
          <div
            className={`flex items-center gap-2 border px-4 py-3 text-sm font-medium ${
              notice.type === "error"
                ? "border-red-100 bg-red-50 text-red-700"
                : "border-green-100 bg-green-50 text-green-700"
            }`}
          >
            {notice.type === "error" ? <FiAlertCircle /> : <FiCheckCircle />}
            {notice.message}
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-[#e8e1d6] bg-white shadow-sm">
          <div className="border-b border-[#e8e1d6] px-5 py-4">
            <h2 className="text-base font-bold text-[#111827]">Create New Ticket</h2>
          </div>
          <form onSubmit={handleCreateTicket} className="grid gap-4 p-4 sm:p-5 lg:grid-cols-12">
            <div className="lg:col-span-5 xl:col-span-5">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#6B7280]">
                Subject
              </label>
              <input
                value={form.subject}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, subject: event.target.value }))
                }
                placeholder="Example: Payment issue on shipment"
                className="w-full rounded-lg border border-[#e8e1d6] bg-[#faf8f4] px-3 py-2.5 text-sm outline-none focus:border-[#BF9B53]"
                maxLength={140}
              />
            </div>
            <div className="lg:col-span-3 xl:col-span-3">
              <Select
                label="Category"
                options={categorySelectOptions}
                value={form.category}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, category: event.target.value }))
                }
                className="w-full text-sm [&>label]:text-xs [&>label]:font-bold [&>label]:uppercase [&>label]:tracking-wide [&>label]:text-[#6B7280] [&>div:first-of-type]:rounded-lg [&>div:first-of-type]:border-[#e8e1d6] [&>div:first-of-type]:bg-[#faf8f4] [&>div:first-of-type]:py-2 [&>div:first-of-type]:focus-within:border-[#BF9B53] [&>div:first-of-type]:min-h-[42px]"
              />
            </div>
            <div className="lg:col-span-2 xl:col-span-2">
              <Select
                label="Priority"
                options={prioritySelectOptions}
                value={form.priority}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, priority: event.target.value }))
                }
                className="w-full text-sm [&>label]:text-xs [&>label]:font-bold [&>label]:uppercase [&>label]:tracking-wide [&>label]:text-[#6B7280] [&>div:first-of-type]:rounded-lg [&>div:first-of-type]:border-[#e8e1d6] [&>div:first-of-type]:bg-[#faf8f4] [&>div:first-of-type]:py-2 [&>div:first-of-type]:focus-within:border-[#BF9B53] [&>div:first-of-type]:min-h-[42px]"
              />
            </div>
            <div className="flex items-end lg:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#BF9B53] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#a88642] disabled:opacity-60"
              >
                <FiPlus />
                {saving ? "Creating..." : "Create"}
              </button>
            </div>
            <div className="lg:col-span-12">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#6B7280]">
                Issue Details
              </label>
              <textarea
                value={form.message}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, message: event.target.value }))
                }
                rows={4}
                placeholder="Write the complete issue details for admin review"
                className="w-full resize-none rounded-lg border border-[#e8e1d6] bg-[#faf8f4] px-3 py-3 text-sm outline-none focus:border-[#BF9B53]"
                maxLength={3000}
              />
            </div>
          </form>
        </section>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e8e1d6] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e8e1d6] px-5 py-4">
              <h2 className="text-base font-bold text-[#111827]">My Tickets</h2>
              <span className="rounded-full bg-[#f5ecd7] px-2.5 py-1 text-xs font-bold text-[#8b6a24]">{tickets.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left">
                <thead className="bg-[#faf8f4] text-xs uppercase text-[#6B7280]">
                  <tr>
                    <th className="px-4 py-3">Ticket ID</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="px-4 py-5 text-sm text-[#6B7280]" colSpan={4}>
                        Loading tickets...
                      </td>
                    </tr>
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td className="px-4 py-5 text-sm text-[#6B7280]" colSpan={4}>
                        No tickets created yet.
                      </td>
                    </tr>
                  ) : (
                    tickets.map((ticket) => (
                      <tr
                        key={ticket._id}
                        onClick={() => setSelectedId(ticket._id)}
                        className={`cursor-pointer border-t border-[#eee9e0] transition hover:bg-[#faf7f0] ${
                          selectedTicket?._id === ticket._id ? "bg-[#f6edd8]" : ""
                        }`}
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-[#1f2937]">
                          {getTicketNumber(ticket)}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-[#111827]">
                          {ticket.subject}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#4B5563]">
                          {ticket.category}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full border px-2 py-1 text-xs font-bold ${
                              statusStyles[ticket.status]
                            }`}
                          >
                            {statusLabels[ticket.status]}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e8e1d6] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e8e1d6] px-5 py-4">
              <h2 className="text-base font-bold text-[#111827]">Ticket Details</h2>
              {selectedTicket && (
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[selectedTicket.status]}`}>
                  <span className="mr-1">•</span>{statusLabels[selectedTicket.status]}
                </span>
              )}
            </div>
            {selectedTicket ? (
              <div className="flex min-h-[470px] flex-col">
                <div className="space-y-2 border-b border-[#e8e1d6] p-4">
                  <h3 className="text-base font-bold text-[#111827]">{selectedTicket.subject}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6B7280]">
                    <span className="font-semibold text-[#374151]">{getTicketNumber(selectedTicket)}</span>
                    <span>Category <b className="font-semibold text-[#374151]">{selectedTicket.category}</b></span>
                    <span>Priority <b className="font-semibold capitalize text-[#374151]">{selectedTicket.priority}</b></span>
                  </div>
                </div>

                <div className="max-h-[360px] min-h-[180px] flex-1 space-y-3 overflow-y-auto bg-[#faf8f4] p-4">
                  {(selectedTicket.messages || []).map((item, index) => {
                    const isAdmin = item.senderRole === "admin";
                    return (
                      <div key={item._id || `${item.createdAt}-${index}`} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[88%] rounded-xl border px-3 py-2.5 ${isAdmin ? "border-[#f0e4c6] bg-[#f6edd8]" : "border-[#e8e1d6] bg-white"}`}>
                          <p className="mb-1 text-[11px] text-[#777064]">{isAdmin ? "Support Team" : "You"} · {formatDate(item.createdAt)}</p>
                          <p className="whitespace-pre-wrap break-words text-sm leading-5 text-[#242321]">{item.message}</p>
                        </div>
                      </div>
                    );
                  })}
                  {(!selectedTicket.messages || selectedTicket.messages.length === 0) && (
                    <p className="py-8 text-center text-sm text-[#6B7280]">No messages on this ticket yet.</p>
                  )}
                </div>

                {isResolvedTicket ? (
                  <div className="border-t border-[#e8e1d6] bg-green-50 p-4 text-sm text-green-800">
                    This ticket is resolved and closed. To get help with another issue, create a new ticket using the form above.
                  </div>
                ) : (
                  <form onSubmit={handleFollowUp} className="border-t border-[#e8e1d6] p-4">
                    <label className="mb-2 block text-xs font-bold text-[#374151]">Reply</label>
                    <textarea
                      value={followUp}
                      onChange={(event) => setFollowUp(event.target.value)}
                      rows={3}
                      placeholder="Write a reply"
                      className="w-full resize-y rounded-lg border border-[#e8e1d6] bg-[#faf8f4] px-3 py-2.5 text-sm outline-none focus:border-[#BF9B53]"
                      maxLength={3000}
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={saving || !followUp.trim()}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#BF9B53] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#a88642] disabled:opacity-60"
                      >
                        <FiSend />
                        {saving ? "Sending..." : "Send"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="flex min-h-[320px] items-center justify-center gap-2 p-6 text-sm text-[#6B7280]">
                <FiClock />
                Select a ticket to view details.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
