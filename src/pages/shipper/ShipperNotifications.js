import React from "react";
import Checkbox from "../../components/common/Checkbox";
import { useShipperSettings } from "../../contexts/ShipperSettingsContext";

const ShipperNotifications = () => {
  const { settings, updateSettings, loading } = useShipperSettings();

  if (loading) {
    return <p className="text-center text-gray-600">Loading settings...</p>;
  }

  const notifications = settings?.notifications || {
    quote: { email: false, sms: false },
    opportunity: { email: false, sms: false },
    message: { email: false, sms: false },
    review: { email: false, sms: false },
    shipment: { email: false, sms: false },
  };

  const toggleNotification = (key, type) => {
    const updated = {
      ...notifications,
      [key]: { ...notifications[key], [type]: !notifications[key][type] },
    };
    updateSettings({ notifications: updated });
  };

  return (
    <div className="w-full mx-auto font-[Montserrat]">
      {/* ---------- Page Header ---------- */}
      <div className="text-left space-y-2 mb-6">
        <h2 className="text-[16px] sm:text-[18px] lg:text-[20px] font-medium leading-[24px] sm:leading-[28px] text-gray-800">
          Notifications
        </h2>
        <p className="text-[14px] sm:text-[15px] lg:text-[16px] font-normal leading-[22px] sm:leading-[24px] text-gray-600">
          Stay tuned for the latest updates to help you manage your shipment
          notifications more efficiently.
        </p>
      </div>

      {/* ---------- Notification Box ---------- */}
      <div className="w-full border border-gray-300 rounded-xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-white shadow-sm">
        {/* ---------- Section Header ---------- */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
          <h3 className="text-[15px] sm:text-[16px] lg:text-[17px] font-medium leading-[22px] sm:leading-[24px] text-gray-800">
            Shipment Notifications
          </h3>

          <div className="flex items-center justify-center gap-12 text-[13px] sm:text-[14px] lg:text-[15px] text-gray-700 font-medium">
            <span className="w-[20px] text-center">Email</span>
            <span className="w-[20px] text-center">SMS</span>
          </div>
        </div>

        {/* ---------- Notification List ---------- */}
        <div className="space-y-4">
          {[
            { id: "quote", label: "When I win a quote" },
            {
              id: "opportunity",
              label: "When a new opportunity in my area is published",
            },
            { id: "message", label: "When I receive a new message" },
            { id: "review", label: "When I receive a review" },
            { id: "shipment", label: "When I have an upcoming shipment" },
          ].map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-none"
            >
              <p className="flex-1 text-[14px] sm:text-[15px] lg:text-[16px] font-normal text-gray-800 leading-[22px] sm:leading-[24px]">
                {item.label}
              </p>

              <div className="flex items-center justify-start gap-8">
                <div className="flex justify-center w-[20px]">
                  <Checkbox
                    checked={notifications[item.id].email}
                    onChange={() => toggleNotification(item.id, "email")}
                  />
                </div>
                <div className="flex justify-center w-[20px]">
                  <Checkbox
                    checked={notifications[item.id].sms}
                    onChange={() => toggleNotification(item.id, "sms")}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShipperNotifications;
