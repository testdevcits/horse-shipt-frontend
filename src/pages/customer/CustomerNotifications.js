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
  const [notifications, setNotifications] = useState(() => {
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
    <div className="max-w-full mx-auto p-4 sm:p-6 font-montserrat">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
        Notifications
      </h1>
      <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6">
        Notifications are customizable alerts that keep you updated about
        specific activities in HorseShipt. They ensure you never miss anything
        while you’re away.
      </p>

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
