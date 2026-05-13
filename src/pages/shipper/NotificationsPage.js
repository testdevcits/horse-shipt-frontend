import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import { SettingsIcon } from "../../components/common/ColoredIcons"; // shared icon
import { useAuth } from "../../contexts/AuthContext";
import { createShipmentQueryToken } from "../../utils/createQueryToken";
import {
  deleteNotificationActivity,
  fetchNotificationActivity,
  loadNotificationActivity,
  markNotificationActivityReadRemote,
} from "../../utils/notificationActivity";

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
  const { user, role, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadLocal = () => {
      setNotifications(
        loadNotificationActivity({ role, userId: user?._id })
      );
    };

    const loadRemote = async () => {
      if (!role || !user?._id || !token) {
        loadLocal();
        return;
      }

      setLoading(true);
      try {
        const result = await fetchNotificationActivity({
          role,
          userId: user._id,
          token,
        });
        setNotifications(result.notifications);
      } catch {
        loadLocal();
      } finally {
        setLoading(false);
      }
    };

    loadRemote();
    window.addEventListener("horse_shipt:notification_activity", loadRemote);
    return () =>
      window.removeEventListener("horse_shipt:notification_activity", loadRemote);
  }, [role, token, user?._id]);

  useEffect(() => {
    if (!role || !user?._id) return;

    const timer = setTimeout(() => {
      markNotificationActivityReadRemote({ role, userId: user._id, token });
      window.dispatchEvent(new Event("horse_shipt:notification_activity"));
    }, 500);

    return () => clearTimeout(timer);
  }, [role, token, user?._id]);

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
    if (!item?.id || !role || !user?._id) return;

    setNotifications((prev) => prev.filter((notification) => notification.id !== item.id));

    try {
      await deleteNotificationActivity({
        role,
        userId: user._id,
        token,
        notificationId: item.id,
      });
      window.dispatchEvent(new Event("horse_shipt:notification_activity"));
    } catch {
      setNotifications(loadNotificationActivity({ role, userId: user._id }));
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
