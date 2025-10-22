import React, { useState } from "react";
import Switch from "../../components/common/Switch";
import Toast from "../../components/common/Toast";

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
  // State for switches
  const [notifications, setNotifications] = useState(() => {
    // Initialize all switches to true by default
    const initialState = {};
    notificationsList.forEach((n) => {
      initialState[n.id] = true;
    });
    return initialState;
  });

  const [toast, setToast] = useState(null);

  const handleToggle = (id) => {
    setNotifications((prev) => {
      const newState = { ...prev, [id]: !prev[id] };
      setToast({
        message: `${notificationsList.find((n) => n.id === id).label} ${
          newState[id] ? "enabled" : "disabled"
        }`,
        type: "success",
      });
      return newState;
    });
  };

  return (
    <div className="max-w-full mx-auto  font-montserrat">
      <h1 className="text-2xl sm:text-3xl font-bold text-start mb-4">
        Notifications
      </h1>
      <p className="text-gray-600 mb-6">
        Notifications are customizable alerts that keep you updated about
        specific activities in HorseShipt, they ensure you never miss anything
        while you’re away.
      </p>

      <div className="space-y-4">
        {notificationsList.map((item) => (
          <div key={item.id} className="flex items-center justify-between ">
            <span className="text-gray-800">{item.label}</span>
            <Switch
              checked={notifications[item.id]}
              onChange={() => handleToggle(item.id)}
              size="md"
            />
          </div>
        ))}
      </div>

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
