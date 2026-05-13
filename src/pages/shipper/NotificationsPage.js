import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import { SettingsIcon } from "../../components/common/ColoredIcons"; // shared icon
import { useAuth } from "../../contexts/AuthContext";
import { createShipmentQueryToken } from "../../utils/createQueryToken";
import { useNotificationActivity } from "../../contexts/NotificationActivityContext";

const formatTime = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
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
    normalizeId(data.shipment?._id || data.shipment) ||
    normalizeId(data.quote?.shipment?._id || data.quote?.shipment) ||
    normalizeId(data.quote?.shipmentId)
  );
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const {
    deleteNotification,
    loading,
    markAllRead,
    notifications,
    refresh,
  } = useNotificationActivity();

  useEffect(() => {
    const timer = setTimeout(() => {
      markAllRead();
    }, 500);

    return () => clearTimeout(timer);
  }, [markAllRead]);

  useEffect(() => {
    refresh({ force: true, silent: true });
  }, [refresh]);

  const settingsPath =
    role === "customer"
      ? "/customer/settings?tab=notification"
      : "/shipper/settings?tab=notification";

  const handleNotificationClick = (item) => {
    const shipmentId = getNotificationShipmentId(item);
    if (!shipmentId) return;

    const ref = createShipmentQueryToken(shipmentId);
    const params = new URLSearchParams({
      shipmentId,
      ref,
    });

    if (role === "customer") {
      navigate(`/customer/my-shipments?${params.toString()}`);
      return;
    }

    if (role === "shipper") {
      navigate(`/shipper/shipments/details?${params.toString()}`);
    }
  };

  const handleDeleteNotification = async (event, item) => {
    event.stopPropagation();
    if (!item?.id) return;

    try {
      await deleteNotification(item.id);
    } catch {
      refresh({ force: true, silent: true });
    }
  };

  return (
    <div className="font-montserrat">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 px-2">
        <h1 className="text-sidebar font-semibold text-systemText text-2xl">
          Notifications
        </h1>
        <div
          className="cursor-pointer"
          onClick={() => navigate(settingsPath)}
          title="Notification settings"
        >
          <SettingsIcon size="text-2xl" />
        </div>
      </div>

      {/* Divider line */}
      <div className="border-b border-gray-300 mb-6" />

      {/* Notification List */}
      <div className="space-y-4">
        {notifications.map((item) => {
          const shipmentId = getNotificationShipmentId(item);
          const canOpenShipment =
            (role === "customer" || role === "shipper") && shipmentId;

          return (
          <div
            key={item.id}
            onClick={() => handleNotificationClick(item)}
            className={`flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white transition-all ${
              canOpenShipment
                ? "cursor-pointer hover:border-[#BF9B53]/50 hover:shadow-sm"
                : ""
            }`}
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
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-[#BF9B53]/10 text-[#9A7D3A] flex items-center justify-center flex-shrink-0 font-semibold">
                {(item.title || "N").charAt(0)}
              </div>

              {/* Notification Content */}
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-gray-900">
                  {item.title || "Notification"}
                </p>
                {/* Notification Message */}
                <p className="text-[15px] leading-[22px] font-normal text-gray-800">
                  {item.message}
                </p>

                {/* Time on second line */}
                <p className="text-[12px] leading-[18px] mt-1 font-normal text-gray-500">
                  {formatTime(item.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              {!item.read && (
                <span className="w-2 h-2 bg-[#10B981] rounded-full mt-2" />
              )}
              <button
                type="button"
                onClick={(event) => handleDeleteNotification(event, item)}
                className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                title="Delete notification"
                aria-label="Delete notification"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>
          );
        })}
      </div>

      {/* Empty State */}
      {!loading && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-20 text-gray-500">
          <SettingsIcon />
          <p className="mt-2">No notifications available</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
