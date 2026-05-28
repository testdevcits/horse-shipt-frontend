import React from "react";
import Checkbox from "../../components/common/Checkbox";
import { useShipperSettings } from "../../contexts/ShipperSettingsContext";
import PageLoader from "../../components/common/PageLoader";

const NOTIFICATION_ITEMS = [
  {
    id: "quote",
    label: "Quote won",
    description: "Get notified when you win a quote",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    id: "opportunity",
    label: "New opportunity",
    description: "When a new opportunity in your area is published",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    id: "message",
    label: "New message",
    description: "When you receive a new message from a carrier or shipper",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: "question",
    label: "Shipment questions",
    description: "When a customer answers your shipment question",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.1 9a3 3 0 1 1 5.8 1c-.6 1-1.7 1.4-2.3 2.2-.3.4-.4.8-.4 1.3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    id: "review",
    label: "Review received",
    description: "When someone leaves a review on your profile",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    id: "shipment",
    label: "Upcoming shipment",
    description: "Reminders before a scheduled shipment departure",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
];

const ChannelBadge = ({ label }) => (
  <span
    style={{
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "#9A7D3A",
      padding: "2px 0",
    }}
  >
    {label}
  </span>
);

const ShipperNotifications = () => {
  const { settings, updateSettings, loading } = useShipperSettings();

  if (loading) {
    return <PageLoader text="Loading settings..." fullScreen={false} />;
  }

  const defaultNotifications = {
    quote: { email: false, sms: false },
    opportunity: { email: false, sms: false },
    message: { email: false, sms: false },
    question: { email: false, sms: false },
    review: { email: false, sms: false },
    shipment: { email: false, sms: false },
  };
  const notifications = {
    ...defaultNotifications,
    ...(settings?.notifications || {}),
  };

  const toggleNotification = async (key, type) => {
    const updatedNotifications = {
      ...notifications,
      [key]: { ...notifications[key], [type]: !notifications[key]?.[type] },
    };
    await updateSettings({ notifications: updatedNotifications });
  };

  const activeCount = NOTIFICATION_ITEMS.reduce((acc, item) => {
    if (notifications[item.id]?.email) acc++;
    if (notifications[item.id]?.sms) acc++;
    return acc;
  }, 0);

  return (
    <div
      className="w-full mx-auto animate-slide-fade-in"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#1a1a1a",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Notifications
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#6b7280",
                marginTop: 6,
                lineHeight: 1.6,
                maxWidth: 480,
              }}
            >
              Choose how and when you receive updates about your shipments and
              activity.
            </p>
          </div>

          {activeCount > 0 && (
            <span
              style={{
                flexShrink: 0,
                fontSize: 12,
                fontWeight: 600,
                color: "#9A7D3A",
                background: "#FDF6E7",
                border: "1px solid #F0D98A",
                borderRadius: 20,
                padding: "4px 12px",
                marginTop: 2,
              }}
            >
              {activeCount} active
            </span>
          )}
        </div>
      </div>

      {/* Card */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #E8D5A3",
          overflow: "hidden",
          boxShadow: "0 1px 4px 0 rgba(191,155,83,0.08)",
        }}
      >
        {/* Card header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid #F0E4C0",
            background: "#FFFDF7",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#BF9B53"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#4b3d24",
                letterSpacing: "0.02em",
              }}
            >
              Shipment Notifications
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 32,
              paddingRight: 4,
            }}
          >
            <ChannelBadge label="Email" />
            <ChannelBadge label="SMS" />
          </div>
        </div>

        {/* Notification rows */}
        <div>
          {NOTIFICATION_ITEMS.map((item, index) => {
            const emailOn = notifications[item.id]?.email || false;
            const smsOn = notifications[item.id]?.sms || false;
            const isLast = index === NOTIFICATION_ITEMS.length - 1;

            return (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 24px",
                  borderBottom: isLast ? "none" : "1px solid #F5F0E8",
                  transition: "background 0.15s ease",
                  gap: 12,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#FFFDF9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Left: icon + text */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: emailOn || smsOn ? "#FDF4E3" : "#F5F5F5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: emailOn || smsOn ? "#BF9B53" : "#9CA3AF",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {item.icon}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#1f2937",
                        margin: 0,
                        lineHeight: 1.3,
                      }}
                    >
                      {item.label}
                    </p>
                    <p
                      style={{
                        fontSize: 12.5,
                        color: "#9ca3af",
                        margin: "2px 0 0",
                        lineHeight: 1.4,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Right: checkboxes */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 36,
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      width: 20,
                    }}
                  >
                    <Checkbox
                      checked={emailOn}
                      onChange={() => toggleNotification(item.id, "email")}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      width: 20,
                    }}
                  >
                    <Checkbox
                      checked={smsOn}
                      onChange={() => toggleNotification(item.id, "sms")}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Card footer hint */}
        <div
          style={{
            padding: "12px 24px",
            borderTop: "1px solid #F0E4C0",
            background: "#FFFDF7",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#BF9B53"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p style={{ fontSize: 12, color: "#a78542", margin: 0 }}>
            SMS notifications may incur carrier charges depending on your plan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShipperNotifications;
