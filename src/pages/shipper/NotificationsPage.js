import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiInbox,
  FiSettings,
  FiTrash2,
} from "react-icons/fi";
import ConfirmModal from "../../components/common/ConfirmModal";
import PageLoader from "../../components/common/PageLoader";
import { useAuth } from "../../contexts/AuthContext";
import { createShipmentQueryToken } from "../../utils/createQueryToken";
import { useNotificationActivity } from "../../contexts/NotificationActivityContext";

const PAGE_SIZE = 10;

const formatTime = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const normalizeId = (value) => {
  if (!value) return null;
  if (typeof value === "object") return value._id || value.id || null;
  return value;
};

const getNotificationShipmentId = (notification) => {
  const data = notification?.data || {};
  return (
    normalizeId(data.shipmentId) ||
    normalizeId(data.message?.shipmentId) ||
    normalizeId(data.shipment?._id || data.shipment) ||
    normalizeId(data.quote?.shipment?._id || data.quote?.shipment) ||
    normalizeId(data.quote?.shipmentId)
  );
};

const getNotificationShipperId = (notification) => {
  const data = notification?.data || {};
  return (
    normalizeId(data.shipperId) ||
    normalizeId(data.shipper?._id || data.shipper) ||
    normalizeId(data.quote?.shipper?._id || data.quote?.shipper) ||
    normalizeId(data.message?.shipperId)
  );
};

const getNotificationCustomerId = (notification) => {
  const data = notification?.data || {};
  return (
    normalizeId(data.customerId) ||
    normalizeId(data.customer?._id || data.customer) ||
    normalizeId(data.quote?.customer?._id || data.quote?.customer) ||
    normalizeId(data.message?.customerId)
  );
};

const getNotificationQuestionId = (notification) => {
  const data = notification?.data || {};
  return (
    normalizeId(data.question?._id || data.question) ||
    normalizeId(data.questionId)
  );
};

const isQuoteRequestNotification = (notification) =>
  notification?.type === "shipment_invitation" ||
  notification?.event === "horse_shipt:shipment_invitation_created";

const isQuestionNotification = (notification) =>
  notification?.type === "question" ||
  notification?.type === "shipment_question" ||
  notification?.event === "horse_shipt:shipment_question" ||
  notification?.event === "horse_shipt:shipment_question_answered";

const isQuoteNotification = (notification) =>
  notification?.type === "quote_created" ||
  notification?.type === "quote_accepted" ||
  notification?.type === "quote_rejected" ||
  notification?.type === "quote_cancelled" ||
  notification?.event === "horse_shipt:quote_created" ||
  notification?.event === "horse_shipt:quote_accepted" ||
  notification?.event === "horse_shipt:quote_rejected" ||
  notification?.event === "horse_shipt:quote_cancelled";

const isQuoteRejectedNotification = (notification) =>
  notification?.type === "quote_rejected" ||
  notification?.event === "horse_shipt:quote_rejected";

const isChatNotification = (notification) =>
  notification?.type === "chat_message" ||
  notification?.event === "horse_shipt:chat_message_created";

const filterOptions = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
];

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const {
    clearAllNotifications,
    deleteSelectedNotifications,
    loading,
    markAllRead,
    markSelectedRead,
    notifications,
    refresh,
  } = useNotificationActivity();

  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    refresh({ force: true, silent: true });
  }, [refresh]);

  const settingsPath =
    role === "customer"
      ? "/customer/settings?tab=notification"
      : "/shipper/settings?tab=notification";

  const filteredNotifications = useMemo(() => {
    if (filter === "read") return notifications.filter((item) => item.read);
    if (filter === "unread") return notifications.filter((item) => !item.read);
    return notifications;
  }, [filter, notifications]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredNotifications.length / PAGE_SIZE)
  );
  const visibleNotifications = filteredNotifications.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const allVisibleSelected =
    visibleNotifications.length > 0 &&
    visibleNotifications.every((item) => selectedIds.includes(item.id));

  const unreadCount = notifications.filter((item) => !item.read).length;

  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [filter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const toggleSelected = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllVisible = () => {
    const visibleIds = visibleNotifications.map((item) => item.id);
    setSelectedIds((prev) =>
      allVisibleSelected
        ? prev.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...prev, ...visibleIds]))
    );
  };

  const handleNotificationClick = (item) => {
    if (isQuoteRejectedNotification(item)) return;

    const shipmentId = getNotificationShipmentId(item);
    if (!shipmentId) return;

    const ref = createShipmentQueryToken(shipmentId);
    const params = new URLSearchParams({ shipmentId, ref });

    if (role === "customer") {
      if (isChatNotification(item)) {
        const shipperId = getNotificationShipperId(item);
        const chatParams = new URLSearchParams({ shipmentId });
        if (shipperId) chatParams.set("shipperId", shipperId);
        navigate(`/customer/chats?${chatParams.toString()}`);
        return;
      }

      if (isQuestionNotification(item)) {
        params.set("tab", "questions");
        const questionId = getNotificationQuestionId(item);
        if (questionId) params.set("questionId", questionId);
        navigate(`/customer/my-shipments?${params.toString()}`);
        return;
      }

      if (isQuoteNotification(item)) {
        params.set("tab", "quotes");
        navigate(`/customer/my-shipments?${params.toString()}`);
        return;
      }

      navigate(`/customer/my-shipments?${params.toString()}`);
      return;
    }

    if (role === "shipper") {
      if (isChatNotification(item)) {
        const customerId = getNotificationCustomerId(item);
        const chatParams = new URLSearchParams({ shipmentId });
        if (customerId) chatParams.set("customerId", customerId);
        navigate(`/shipper/chat?${chatParams.toString()}`);
        return;
      }

      if (isQuestionNotification(item)) {
        const questionId = getNotificationQuestionId(item);
        if (questionId) params.set("questionId", questionId);
        navigate(`/shipper/shipments/${shipmentId}?${params.toString()}`);
        return;
      }

      if (isQuoteRequestNotification(item)) {
        navigate(`/shipper/invited-shipments?${params.toString()}`);
        return;
      }

      navigate(`/shipper/shipments/${shipmentId}?ref=${encodeURIComponent(ref)}`);
    }
  };

  const runAction = async () => {
    if (!confirmAction) return;

    setActionLoading(true);
    try {
      if (confirmAction === "delete-selected") {
        await deleteSelectedNotifications(selectedIds);
        setSelectedIds([]);
      }
      if (confirmAction === "clear-all") {
        await clearAllNotifications();
        setSelectedIds([]);
      }
      setConfirmAction(null);
    } catch {
      refresh({ force: true, silent: true });
      setConfirmAction(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSingle = (event, item) => {
    event.stopPropagation();
    setSelectedIds([item.id]);
    setConfirmAction("delete-selected");
  };

  const handleMarkSelectedRead = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    try {
      await markSelectedRead(selectedIds);
      setSelectedIds([]);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      await markAllRead();
      setSelectedIds([]);
    } finally {
      setActionLoading(false);
    }
  };

  const confirmCopy =
    confirmAction === "clear-all"
      ? {
          title: "Clear all notifications?",
          message: "This will permanently delete every notification in this list.",
          confirmText: "Clear All",
        }
      : {
          title: "Delete selected notifications?",
          message: `This will permanently delete ${selectedIds.length} selected notification${
            selectedIds.length === 1 ? "" : "s"
          }.`,
          confirmText: "Delete",
        };

  return (
    <div className="font-montserrat">
      <div className="mb-6 flex flex-col gap-4 px-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Notifications</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {unreadCount} unread of {notifications.length} total
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(settingsPath)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[#BF9B53] hover:text-[#735D32]"
        >
          <FiSettings size={16} />
          Settings
        </button>
      </div>

      <div className="mb-5 rounded-md border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setFilter(option.key)}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                  filter === option.key
                    ? "bg-[#BF9B53] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-[#FFF9EC] hover:text-[#735D32]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={toggleSelectAllVisible}
              disabled={visibleNotifications.length === 0 || actionLoading}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold uppercase text-slate-600 transition hover:border-[#BF9B53] hover:text-[#735D32] disabled:opacity-50"
            >
              {allVisibleSelected ? "Unselect All" : "Select All"}
            </button>
            <button
              type="button"
              onClick={handleMarkSelectedRead}
              disabled={selectedIds.length === 0 || actionLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold uppercase text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
            >
              <FiCheck size={14} />
              Mark Selected Read
            </button>
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={notifications.length === 0 || actionLoading}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold uppercase text-slate-600 transition hover:border-[#BF9B53] hover:text-[#735D32] disabled:opacity-50"
            >
              Mark All Read
            </button>
            <button
              type="button"
              onClick={() => setConfirmAction("delete-selected")}
              disabled={selectedIds.length === 0 || actionLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold uppercase text-red-600 transition hover:bg-red-100 disabled:opacity-50"
            >
              <FiTrash2 size={14} />
              Delete Selected
            </button>
            <button
              type="button"
              onClick={() => setConfirmAction("clear-all")}
              disabled={notifications.length === 0 || actionLoading}
              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold uppercase text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-16">
          <PageLoader text="Loading notifications..." fullScreen={false} />
        </div>
      ) : visibleNotifications.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-[#FFF9EC] text-[#BF9B53]">
            <FiInbox size={26} />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">
            No notifications available.
          </h2>
          <p className="mt-2 text-sm font-medium text-slate-500">
            New shipment, quote, chat, and question updates will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleNotifications.map((item) => {
            const shipmentId = getNotificationShipmentId(item);
            const canOpenShipment =
              (role === "customer" || role === "shipper") && shipmentId;
            const checked = selectedIds.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`group flex gap-4 rounded-md border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#BF9B53]/60 hover:shadow-md ${
                  item.read ? "border-slate-100" : "border-[#BF9B53]/40"
                } ${canOpenShipment ? "cursor-pointer" : ""}`}
                role={canOpenShipment ? "button" : undefined}
                tabIndex={canOpenShipment ? 0 : undefined}
                onKeyDown={(event) => {
                  if (
                    canOpenShipment &&
                    (event.key === "Enter" || event.key === " ")
                  ) {
                    event.preventDefault();
                    handleNotificationClick(item);
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSelected(item.id)}
                  onClick={(event) => event.stopPropagation()}
                  className="mt-4 h-4 w-4 rounded border-slate-300 accent-[#BF9B53]"
                  aria-label="Select notification"
                />

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#FFF9EC] text-[#735D32]">
                  <FiBell size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-bold text-slate-950">
                        {item.title || "Notification"}
                      </h2>
                      <p className="mt-1 text-sm font-medium leading-6 text-slate-600">
                        {item.message}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${
                          item.read
                            ? "bg-slate-100 text-slate-500"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {item.read ? "Read" : "Unread"}
                      </span>
                      <button
                        type="button"
                        onClick={(event) => handleDeleteSingle(event, item)}
                        className="rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        title="Delete notification"
                        aria-label="Delete notification"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-slate-400">
                    {formatTime(item.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredNotifications.length > PAGE_SIZE && (
        <div className="mt-6 flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-[#BF9B53] hover:text-[#735D32] disabled:opacity-40"
              aria-label="Previous page"
            >
              <FiChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={page === totalPages}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-[#BF9B53] hover:text-[#735D32] disabled:opacity-40"
              aria-label="Next page"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        show={Boolean(confirmAction)}
        title={confirmCopy.title}
        message={confirmCopy.message}
        confirmText={actionLoading ? "Please wait..." : confirmCopy.confirmText}
        onCancel={() => (actionLoading ? null : setConfirmAction(null))}
        onConfirm={runAction}
      />
    </div>
  );
};

export default NotificationsPage;
