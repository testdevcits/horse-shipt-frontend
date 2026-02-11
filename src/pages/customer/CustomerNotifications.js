import React, { useState } from "react";
import Switch from "../../components/common/Switch";
import Toast from "../../components/common/Toast";
import { useCustomerNotifications } from "../../contexts/CustomerNotificationContext";
import PageLoader from "../../components/common/PageLoader";

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

  const [toast, setToast] = useState(null);

  /* ===============================
     Toggle Notification
  ================================ */
  const handleToggle = (id) => {
    const newValue = !notifications[id];

    updateNotification(id, newValue);

    const label =
      notificationsList.find((n) => n.id === id)?.label || "Notification";

    setToast({
      message: `${label} ${newValue ? "enabled" : "disabled"}`,
      type: "success",
    });
  };

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

  return (
    <div className="max-w-full mx-auto mt-6 font-montserrat animate-slide-fade-in">
      <h1 className="font-montserrat font-medium text-base leading-6 tracking-normal text-systemText mb-2">
        Notifications
      </h1>

      <p className="font-montserrat font-normal text-base leading-6 tracking-normal text-gray-600 mb-6">
        Notifications are customizable alerts that keep you updated about
        specific activities in HorseShipt. They ensure you never miss anything
        while you’re away.
      </p>

      {/* Notification Toggles */}
      <div className="w-full flex flex-col space-y-4 p-4 border border-gray-200 rounded-sm bg-white">
        {notificationsList.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center gap-2 flex-wrap"
          >
            <span className="font-montserrat font-medium text-base leading-6 tracking-normal text-gray-800 flex-1 break-words">
              {item.label}
            </span>

            <div className="flex-shrink-0 mt-1 sm:mt-0">
              <Switch
                checked={!!notifications[item.id]}
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
