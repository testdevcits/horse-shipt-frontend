import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiPlus,
  FiSend,
} from "react-icons/fi";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../contexts/AuthContext";

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

const getLatestAdminReply = (ticket) =>
  [...(ticket?.messages || [])]
    .reverse()
    .find((item) => item.senderRole === "admin");

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
    <div className="min-h-[calc(100vh-160px)] bg-[#FAF8F3] px-4 py-6 font-montserrat sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#BF9B53]">
              Ticket Support
            </p>
            <h1 className="text-2xl font-bold text-[#111827]">
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

        <section className="border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-base font-bold text-[#111827]">Create New Ticket</h2>
          </div>
          <form onSubmit={handleCreateTicket} className="grid gap-4 p-5 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#6B7280]">
                Subject
              </label>
              <input
                value={form.subject}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, subject: event.target.value }))
                }
                placeholder="Example: Payment issue on shipment"
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#BF9B53]"
                maxLength={140}
              />
            </div>
            <div className="lg:col-span-3">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#6B7280]">
                Category
              </label>
              <select
                value={form.category}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, category: event.target.value }))
                }
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#BF9B53]"
              >
                {categoryOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#6B7280]">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, priority: event.target.value }))
                }
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#BF9B53]"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="flex items-end lg:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 bg-[#BF9B53] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#a88642] disabled:opacity-60"
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
                className="w-full resize-none border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#BF9B53]"
                maxLength={3000}
              />
            </div>
          </form>
        </section>

        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-bold text-[#111827]">My Tickets</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-gray-50 text-xs uppercase text-[#6B7280]">
                  <tr>
                    <th className="px-4 py-3">Ticket ID</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Last Update</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="px-4 py-5 text-sm text-[#6B7280]" colSpan={5}>
                        Loading tickets...
                      </td>
                    </tr>
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td className="px-4 py-5 text-sm text-[#6B7280]" colSpan={5}>
                        No tickets created yet.
                      </td>
                    </tr>
                  ) : (
                    tickets.map((ticket) => (
                      <tr
                        key={ticket._id}
                        onClick={() => setSelectedId(ticket._id)}
                        className={`cursor-pointer border-t border-gray-100 transition hover:bg-[#FBFAF7] ${
                          selectedTicket?._id === ticket._id ? "bg-[#FBFAF7]" : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-sm font-bold text-[#BF9B53]">
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
                            className={`inline-flex border px-2 py-1 text-xs font-bold ${
                              statusStyles[ticket.status]
                            }`}
                          >
                            {statusLabels[ticket.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#4B5563]">
                          {formatDate(ticket.lastMessageAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-bold text-[#111827]">Ticket Details</h2>
            </div>
            {selectedTicket ? (
              <div className="space-y-5 p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="border border-gray-100 bg-gray-50 p-3">
                    <p className="text-xs font-bold uppercase text-[#6B7280]">Ticket ID</p>
                    <p className="mt-1 text-sm font-bold text-[#111827]">
                      {getTicketNumber(selectedTicket)}
                    </p>
                  </div>
                  <div className="border border-gray-100 bg-gray-50 p-3">
                    <p className="text-xs font-bold uppercase text-[#6B7280]">Status</p>
                    <p className="mt-1 text-sm font-bold text-[#111827]">
                      {statusLabels[selectedTicket.status]}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-[#6B7280]">Subject</p>
                  <p className="mt-1 text-sm font-semibold text-[#111827]">
                    {selectedTicket.subject}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-[#6B7280]">
                    Admin Response
                  </p>
                  <div className="mt-2 border border-gray-100 bg-[#FCFBF8] p-4">
                    {getLatestAdminReply(selectedTicket) ? (
                      <>
                        <p className="whitespace-pre-wrap text-sm leading-6 text-[#111827]">
                          {getLatestAdminReply(selectedTicket).message}
                        </p>
                        <p className="mt-2 text-xs text-[#6B7280]">
                          {formatDate(getLatestAdminReply(selectedTicket).createdAt)}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-[#6B7280]">Admin reply pending.</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase text-[#6B7280]">
                    Ticket History
                  </p>
                  <div className="space-y-3">
                    {selectedTicket.messages?.map((item) => (
                      <div
                        key={item._id || item.createdAt}
                        className="border-l-2 border-[#BF9B53] pl-3"
                      >
                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase text-[#6B7280]">
                          {item.senderRole === "admin" ? <FiCheckCircle /> : <FiFileText />}
                          {item.senderRole === "admin" ? "Admin Reply" : "Ticket Update"}
                          <span className="font-medium normal-case">
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#111827]">
                          {item.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleFollowUp} className="border-t border-gray-100 pt-4">
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#6B7280]">
                    Add Update
                  </label>
                  <textarea
                    value={followUp}
                    onChange={(event) => setFollowUp(event.target.value)}
                    rows={3}
                    placeholder={
                      selectedTicket.status === "resolved"
                        ? "Add update to reopen ticket"
                        : "Add more information to this ticket"
                    }
                    className="w-full resize-none border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#BF9B53]"
                    maxLength={3000}
                  />
                  <button
                    type="submit"
                    disabled={saving || !followUp.trim()}
                    className="mt-3 inline-flex items-center gap-2 bg-[#111827] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#374151] disabled:opacity-60"
                  >
                    <FiSend />
                    Submit Update
                  </button>
                </form>
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
