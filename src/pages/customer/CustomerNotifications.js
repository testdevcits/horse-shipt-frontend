import React, { useState } from "react";
import Switch from "../../components/common/Switch";
import Toast from "../../components/common/Toast";
import { useCustomerNotifications } from "../../contexts/CustomerNotificationContext";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

const notificationsList = [
  { id: "newQuote", label: "When I receive a new quote" },
  { id: "offerInteraction", label: "When someone interacts with my offer" },
  { id: "newMessage", label: "When I receive a new message" },
  { id: "newReview", label: "When I receive a review" },
  { id: "upcomingShipment", label: "When I have an upcoming shipment" },
  {
    id: "shipmentUpdates",
    label: "Receive real-time updates about current shipments",
  },
];

const CustomerNotifications = () => {
  const { notifications, updateNotification, loading } =
    useCustomerNotifications();
  const { token } = useAuth();
  const [toast, setToast] = useState(null);

  // ---------------- Toggle notification ----------------
  const handleToggle = (id) => {
    const newValue = !notifications[id];
    updateNotification(id, newValue);
    setToast({
      message: `${notificationsList.find((n) => n.id === id).label} ${
        newValue ? "enabled" : "disabled"
      }`,
      type: "success",
    });
  };

  // ---------------- Test Notification ----------------
  const sendTestNotification = async () => {
    if (!token) return;
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/customer/test-notification`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setToast({ message: "Test notification sent!", type: "success" });
    } catch (err) {
      console.error("Test notification error:", err);
      setToast({
        message: "Failed to send test notification",
        type: "error",
      });
    }
  };

  if (loading || !notifications) return <p>Loading...</p>;

  return (
    <div className="max-w-full mx-auto p-4 sm:p-6 font-montserrat">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
        Notifications
      </h1>
      <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6">
        Notifications are customizable alerts that keep you updated about
        specific activities in HorseShipt.
      </p>

      {/* Test Notification Button */}
      <div className="mb-4">
        <button
          onClick={sendTestNotification}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Send Test Notification
        </button>
      </div>

      {/* Notification Toggles */}
      <div className="w-full flex flex-col space-y-4 p-4 border border-gray-200 rounded-xl bg-white">
        {notificationsList.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center gap-2 flex-wrap"
          >
            <span className="text-[14px] sm:text-sm md:text-base lg:text-lg text-gray-800 flex-1 break-words font-normal">
              {item.label}
            </span>
            <div className="flex-shrink-0 mt-1 sm:mt-0">
              <Switch
                checked={notifications[item.id]}
                onChange={() => handleToggle(item.id)}
                size="md"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default CustomerNotifications;
