import React, { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

import { LuArrowLeftFromLine, LuArrowRightFromLine } from "react-icons/lu";
import { CiCircleQuestion } from "react-icons/ci";
import { IoStarHalf } from "react-icons/io5";
import { MdPayments } from "react-icons/md";
import { useAuth } from "../../contexts/AuthContext";

// COMMON ICONS
import {
  DashboardIcon,
  OrdersIcon,
  ProfileIcon,
  ChatIcon,
  SettingsIcon,
  TruckDriverIcon,
  CustomerOrdersIcon,
} from "../../components/common/ColoredIcons";

/**
 * ============================================================
 * SHIPPER SIDEBAR WITH TOOLTIP
 * Tooltip shows next to hovered item, stays in position
 * ============================================================
 */

// ================= NAV ITEMS =================
const navItems = [
  {
    name: "Dashboard",
    path: "/shipper/dashboard",
    icon: <DashboardIcon />,
  },
  {
    name: "Shipment",
    path: "/shipper/my-shipment",
    icon: <OrdersIcon />,
    subPaths: [
      { name: "My Shipment", path: "/shipper/my-shipment" },
      { name: "Invited Shipments", path: "/shipper/invited-shipments" },
      { name: "All Shipments", path: "/shipper/all-shipment" },
    ],
  },
  {
    name: "My Quotes",
    path: "/shipper/quotes",
    icon: <CustomerOrdersIcon />, // change icon if you want
  },
  {
    name: "Vehicles",
    path: "/shipper/vehicles",
    icon: <ProfileIcon />,
  },
  {
    name: "Truck Driver",
    path: "/shipper/truck-driver",
    icon: <TruckDriverIcon />,
  },
  {
    name: "Chat",
    path: "/shipper/chat",
    icon: <ChatIcon />,
  },
  {
    name: "Earnings",
    path: "/shipper/earnings",
    icon: <MdPayments className="text-[#BF9B53] text-lg" />,
  },
  {
    name: "Google Review",
    path: "/shipper/google-review",
    icon: <IoStarHalf className="text-[#BF9B53] text-lg" />,
  },
  {
    name: "Settings",
    path: "/shipper/settings",
    icon: <SettingsIcon />,
  },
];

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  mobileOpen,
  setMobileOpen,
}) => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const menuItemsRef = useRef({});
  const [activeItem, setActiveItem] = useState("Dashboard");

  /**
   * ================= AUTO LOGOUT ON TOKEN EXPIRY =================
   */
  useEffect(() => {
    if (!token) return;

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await logout();
          navigate("/", { replace: true });
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [token, logout, navigate]);

  /**
   * ================= CHECK IF PATH IS ACTIVE =================
   */
  const isActivePath = (path, subPaths) => {
    if (window.location.pathname === path) return true;
    if (subPaths) {
      return subPaths.some((sub) => sub.path === window.location.pathname);
    }
    return false;
  };

  /**
   * ================= CALCULATE SIDEBAR WIDTH =================
   */
  const sidebarWidth = mobileOpen
    ? "100%"
    : sidebarOpen && window.innerWidth >= 1024
    ? 256
    : 80;

  /**
   * ================= HANDLE MOUSE ENTER - SHOW TOOLTIP =================
   */
  const handleMouseEnter = (e, itemName) => {
    // Only show tooltip when sidebar is collapsed
    if (sidebarOpen || mobileOpen) {
      return;
    }

    setHoveredItem(itemName);
    const rect = e.currentTarget.getBoundingClientRect();

    // Position tooltip to the right of sidebar
    setTooltipPos({
      top: rect.top,
      left: rect.left + rect.width + 12, // 12px gap from sidebar
    });

    // Store ref
    menuItemsRef.current[itemName] = e.currentTarget;
  };

  /**
   * ================= HANDLE MOUSE LEAVE - HIDE TOOLTIP =================
   */
  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  return (
    <>
      {/* ================= SIDEBAR ================= */}
      <div
        className={`fixed top-18 left-0 h-[calc(100%-64px)] bg-white shadow-lg z-40 transform transition-all duration-300 font-montserrat flex flex-col
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{ width: sidebarWidth }}
      >
        {/* ===================== DESKTOP TOGGLE ===================== */}
        <div className="flex justify-end p-3 hidden lg:flex border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-between w-full p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {sidebarOpen ? (
              <>
                <span className="text-sm font-semibold text-[#BF9B53] truncate">
                  {activeItem || "Dashboard"}
                </span>
                <LuArrowLeftFromLine size={20} className="text-gray-600" />
              </>
            ) : (
              <LuArrowRightFromLine size={20} className="text-gray-600" />
            )}
          </button>
        </div>

        {/* ===================== NAVIGATION ===================== */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 vehicle-scroll">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const active = isActivePath(item.path, item.subPaths);

              return (
                <li key={item.path}>
                  {/* ================= MAIN MENU ITEM ================= */}
                  <NavLink
                    to={item.path}
                    onClick={() => {
                      setActiveItem(item.name);
                      mobileOpen && setMobileOpen(false);
                    }}
                    onMouseEnter={(e) => handleMouseEnter(e, item.name)}
                    onMouseLeave={handleMouseLeave}
                    className={`flex items-center px-3 py-3 rounded-lg transition-all duration-300 relative group
                      ${
                        sidebarOpen || mobileOpen
                          ? "gap-4 justify-start"
                          : "justify-center"
                      }
                      ${
                        active
                          ? "bg-gradient-to-r from-[#BF9B53]/10 to-[#BF9B53]/5 text-[#BF9B53] font-semibold border-l-4 border-[#BF9B53]"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                    title={sidebarOpen || mobileOpen ? "" : item.name}
                  >
                    {/* ================= ICON ================= */}
                    <div
                      className={`flex-shrink-0 transition-all duration-300 ${
                        active ? "text-[#BF9B53]" : "text-gray-600"
                      }`}
                    >
                      {item.icon}
                    </div>

                    {/* ================= TEXT ================= */}
                    {(sidebarOpen || mobileOpen) && (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}

                    {/* ================= ACTIVE INDICATOR (COLLAPSED) ================= */}
                    {active && !sidebarOpen && !mobileOpen && (
                      <div className="absolute right-2 w-2 h-2 bg-[#BF9B53] rounded-full animate-pulse" />
                    )}
                  </NavLink>

                  {/* ================= SUBMENU ================= */}
                  {item.subPaths && (sidebarOpen || mobileOpen) && (
                    <div className="ml-4 mt-2 border-l-2 border-gray-200 pl-4 flex flex-col gap-1">
                      {item.subPaths.map((sub) => {
                        const subActive = window.location.pathname === sub.path;
                        return (
                          <NavLink
                            key={sub.path}
                            to={sub.path}
                            onClick={() => {
                              setActiveItem(item.name);
                              mobileOpen && setMobileOpen(false);
                            }}
                            className={`block px-3 py-2 rounded-lg transition-all duration-300 text-xs font-medium
                              ${
                                subActive
                                  ? "bg-[#BF9B53]/10 text-[#BF9B53] font-semibold"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              }
                            `}
                          >
                            {sub.name}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ===================== HELP BUTTON ===================== */}
        <div className="p-3 flex-shrink-0 border-t border-gray-200">
          <button
            className="flex items-center justify-center w-full py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-[#BF9B53] rounded-lg transition-all duration-300 group"
            title="Help"
            onMouseEnter={(e) => handleMouseEnter(e, "Help")}
            onMouseLeave={handleMouseLeave}
          >
            <CiCircleQuestion
              size={20}
              className="transition-transform group-hover:scale-110"
            />
          </button>
        </div>
      </div>

      {/* ================= TOOLTIP - FIXED TO HOVERED ITEM ================= */}
      {hoveredItem && !sidebarOpen && !mobileOpen && (
        <div
          className="fixed z-50 pointer-events-none animate-fadeIn"
          style={{
            top: `${tooltipPos.top}px`,
            left: `${tooltipPos.left}px`,
          }}
        >
          <div className="bg-[#BF9B53]/100 text-white px-4 py-2 rounded-sm text-sm font-semibold whitespace-nowrap shadow-xl">
            {hoveredItem}
            {/* Arrow pointing left */}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-6 border-transparent border-r-gray-900" />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
