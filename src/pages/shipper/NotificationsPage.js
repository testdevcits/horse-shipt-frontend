import React from "react";
import { useNavigate } from "react-router-dom";
import { SettingsIcon } from "../../components/common/ColoredIcons"; // shared icon

const notifications = [
  {
    id: 1,
    profile: "https://randomuser.me/api/portraits/men/32.jpg",
    message: "A new order has been assigned to you.",
    time: "2 minutes ago",
    unread: false,
  },
  {
    id: 2,
    profile: "https://randomuser.me/api/portraits/women/45.jpg",
    message: "Order #2345 has been completed successfully.",
    time: "1 hour ago",
    unread: false,
  },
  {
    id: 3,
    profile: "https://randomuser.me/api/portraits/men/15.jpg",
    message: "Your profile information was updated.",
    time: "Yesterday",
    unread: false,
  },
];

const NotificationsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="font-montserrat">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 px-2">
        <h1 className="text-sidebar font-semibold text-systemText text-2xl">
          Notifications
        </h1>
        <div
          className="cursor-pointer"
          onClick={() =>
            navigate("/shipper/settings", {
              state: { activeTab: "notification" },
            })
          }
        >
          <SettingsIcon size="text-2xl" />
        </div>
      </div>

      {/* Divider line */}
      <div className="border-b border-gray-300 mb-6" />

      {/* Notification List */}
      <div className="space-y-4">
        {notifications.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 rounded-xl transition-all"
          >
            <div className="flex items-start gap-4">
              {/* Profile Image */}
              <img
                src={item.profile}
                alt="profile"
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />

              {/* Notification Content */}
              <div className="flex flex-col">
                {/* Notification Message */}
                <p
                  className={`text-[16px] leading-[22px] ${
                    item.unread
                      ? "font-bold text-[#10B981]"
                      : "font-normal text-gray-800"
                  }`}
                >
                  {item.message}
                </p>

                {/* Time on second line */}
                <p
                  className={`text-[12px] leading-[18px] mt-1 ${
                    item.unread ? "font-bold" : "font-normal text-gray-500"
                  }`}
                >
                  {item.time}
                </p>
              </div>
            </div>

            {/* Dot at the end if read */}
            {!item.unread && (
              <span className="w-2 h-2 bg-[#10B981] rounded-full self-start mt-2" />
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-20 text-gray-500">
          <SettingsIcon />
          <p className="mt-2">No notifications available</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
