import React, { useState } from "react";
import Switch from "../../components/common/Switch";
import Toast from "../../components/common/Toast";
import { useCustomerNotifications } from "../../contexts/CustomerNotificationContext";
import PageLoader from "../../components/common/PageLoader";
import { MdOutlineNotificationsActive } from "react-icons/md";
import { RiMessage2Line } from "react-icons/ri";
import {
  MdOutlineLocalOffer,
  MdOutlineUpcoming,
  MdOutlineLocalShipping,
} from "react-icons/md";
import { RiChatQuoteLine } from "react-icons/ri";
import { IoMdStarHalf } from "react-icons/io";

// =====================================================
// NOTIFICATIONS CONFIG
// =====================================================
const notificationsList = [
  {
    id: "newQuote",
    label: "New Quote Received",
    description: "Get notified when a transporter sends you a new quote",
    icon: <RiChatQuoteLine />,
  },
  {
    id: "offerInteraction",
    label: "Offer Interaction",
    description: "Get notified when someone interacts with your offer",
    icon: <MdOutlineLocalOffer />,
  },
  {
    id: "newMessage",
    label: "New Message",
    description: "Get notified when you receive a new message",
    icon: <RiMessage2Line />,
  },
  {
    id: "newReview",
    label: "New Review",
    description: "Get notified when someone leaves you a review",
    icon: <IoMdStarHalf />,
  },
  {
    id: "upcomingShipment",
    label: "Upcoming Shipment",
    description: "Get reminded about your upcoming shipments",
    icon: <MdOutlineUpcoming />,
  },
  {
    id: "shipmentUpdates",
    label: "Real-time Shipment Updates",
    description: "Receive live updates about your current shipments",
    icon: <MdOutlineLocalShipping />,
  },
];

// =====================================================
// MAIN COMPONENT
// =====================================================
const CustomerNotifications = () => {
  const { notifications, updateNotification, loading } =
    useCustomerNotifications();

  const [pendingIds, setPendingIds] = useState([]);
  const [localOverrides, setLocalOverrides] = useState({});
  const [selectedNotification, setSelectedNotification] = useState(null);

  // =====================================================
  // TOGGLE ONLY FROM SWITCH
  // =====================================================
  const handleToggle = async (id) => {
    if (pendingIds.includes(id)) return;

    const currentValue = localOverrides.hasOwnProperty(id)
      ? localOverrides[id]
      : !!notifications[id];

    const newValue = !currentValue;

    setLocalOverrides((prev) => ({ ...prev, [id]: newValue }));
    setPendingIds((prev) => [...prev, id]);

    try {
      await updateNotification(id, newValue);

      setLocalOverrides((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      const label =
        notificationsList.find((n) => n.id === id)?.label || "Notification";

      Toast.success(`${label} ${newValue ? "enabled" : "disabled"}`);
    } catch {
      setLocalOverrides((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      Toast.error("Failed to update notification. Please try again.");
    } finally {
      setPendingIds((prev) => prev.filter((pid) => pid !== id));
    }
  };

  // =====================================================
  // LOADING
  // =====================================================
  if (loading || !notifications) {
    return (
      <PageLoader
        text="Loading notifications..."
        fullScreen={false}
        size={22}
        color="#BF9B53"
      />
    );
  }

  const enabledCount = notificationsList.filter((item) => {
    const val = localOverrides.hasOwnProperty(item.id)
      ? localOverrides[item.id]
      : !!notifications[item.id];
    return val;
  }).length;

  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="max-w-full mx-auto font-montserrat">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
          Notifications
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Manage your notification preferences. Stay updated on what matters
          most to you.
        </p>
      </div>

      {/* Summary */}
      <div className="flex bg-gradient-to-r from-[#BF9B53]/10 to-transparent border-l-4 border-[#BF9B53] p-2 gap-2 mb-4">
        <MdOutlineNotificationsActive size={20} className="text-gray-500" />
        <p className="text-sm font-medium text-[#9a7c3f]">
          {enabledCount} of {notificationsList.length} notifications enabled
        </p>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {notificationsList.map((item, index) => {
          const isChecked = localOverrides.hasOwnProperty(item.id)
            ? localOverrides[item.id]
            : !!notifications[item.id];

          const isPending = pendingIds.includes(item.id);

          return (
            <div
              key={item.id}
              onClick={() => setSelectedNotification(item)}
              className={`
                group flex items-center justify-between gap-4 p-4 rounded-md border
                transition-all duration-200 cursor-pointer select-none
                ${
                  isChecked
                    ? "bg-white border-[#BF9B53]/40 shadow-sm"
                    : "bg-gray-50 border-gray-200 hover:border-gray-300"
                }
                ${isPending ? "opacity-70 cursor-wait" : "hover:shadow-md"}
              `}
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    isChecked ? "bg-[#BF9B53]/15" : "bg-gray-200"
                  }`}
                >
                  {item.icon}
                </div>

                <div>
                  <p
                    className={`font-semibold text-sm ${
                      isChecked ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Switch */}
              <div onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={isChecked}
                  onChange={() => handleToggle(item.id)}
                  disabled={isPending}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================================
          MODAL
      ===================================================== */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-[90%] max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-2">
              {selectedNotification.label}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {selectedNotification.description}
            </p>

            <p className="text-xs text-gray-400 mb-4">
              This setting controls how you receive notifications related to{" "}
              {selectedNotification.label.toLowerCase()}.
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedNotification(null)}
                className="px-4 py-2 bg-[#BF9B53] text-white rounded-md text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="mt-6 text-xs text-gray-400 text-center">
        Changes are saved automatically.
      </p>
    </div>
  );
};

export default CustomerNotifications;
