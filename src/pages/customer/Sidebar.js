import React, { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

import { LuArrowLeftFromLine, LuArrowRightFromLine } from "react-icons/lu";
import { CiCircleQuestion } from "react-icons/ci";
import { LiaHorseHeadSolid } from "react-icons/lia";

import { useAuth } from "../../contexts/AuthContext";
import SidebarSupportPopup from "../../components/common/SidebarSupportPopup";

// COMMON ICONS
import {
  CustomerDashboardIcon,
  CustomerOrdersIcon,
  CustomerNewShipmentIcon,
  ChatIcon,
  CustomerSettingsIcon,
} from "../../components/common/ColoredIcons";

/**
 * ============================================================
 * CUSTOMER SIDEBAR WITH TOOLTIP
 * Tooltip shows next to hovered item, stays in position
 * ============================================================
 */

// ================= NAV ITEMS =================
const navItems = [
  {
    name: "Dashboard",
    path: "/customer/dashboard",
    icon: <CustomerDashboardIcon />,
  },
  {
    name: "My Shipments",
    path: "/customer/orders",
    icon: <CustomerOrdersIcon />,
    // subPaths: [
    //   { name: "Pending", path: "/customer/orders/pending" },
    //   { name: "Completed", path: "/customer/orders/completed" },
    // ],
  },
  {
    name: "New Shipment",
    path: "/customer/new-shipment",
    icon: <CustomerNewShipmentIcon />,
  },
  {
    name: "My Horses",
    path: "/customer/my-horses",
    icon: <LiaHorseHeadSolid />,
  },
  {
    name: "Chat",
    path: "/customer/chats",
    icon: <ChatIcon />,
  },
  {
    name: "Settings",
    path: "/customer/settings",
    icon: <CustomerSettingsIcon />,
  },
];

const CustomerSidebar = ({
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
  const helpRef = useRef(null);
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [helpOpen, setHelpOpen] = useState(false);

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

  useEffect(() => {
    if (!helpOpen) return;

    const handleClickOutside = (event) => {
      if (helpRef.current && !helpRef.current.contains(event.target)) {
        setHelpOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [helpOpen]);

  useEffect(() => {
    if (!sidebarOpen && !mobileOpen) {
      setHelpOpen(false);
    }
  }, [sidebarOpen, mobileOpen]);

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
        className={`fixed top-18 left-0 h-[calc(100%-64px)] bg-white border-r border-gray-200 shadow-[4px_0_18px_rgba(17,24,39,0.06)] z-40 transform transition-all duration-300 font-montserrat flex flex-col
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{ width: sidebarWidth }}
      >
        {/* ===================== DESKTOP TOGGLE ===================== */}
        <div className="hidden min-h-[54px] items-center border-b border-gray-100 px-3 lg:flex">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex w-full items-center justify-between px-2 py-2 text-[#111827] transition-colors duration-200 hover:bg-[#FBFAF7]"
            title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {sidebarOpen ? (
              <>
                <span className="truncate text-[13px] font-semibold text-[#111827]">
                  {activeItem || "Dashboard"}
                </span>
                <LuArrowLeftFromLine size={18} className="text-[#4B5563]" />
              </>
            ) : (
              <LuArrowRightFromLine size={18} className="text-[#4B5563]" />
            )}
          </button>
        </div>

        {/* ===================== NAVIGATION ===================== */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 vehicle-scroll">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = isActivePath(item.path, item.subPaths);

              return (
                <li key={item.path} className="border-b border-gray-100 pb-1">
                  {/* ================= MAIN MENU ITEM ================= */}
                  <NavLink
                    to={item.path}
                    onClick={() => {
                      setActiveItem(item.name);
                      mobileOpen && setMobileOpen(false);
                    }}
                    onMouseEnter={(e) => handleMouseEnter(e, item.name)}
                    onMouseLeave={handleMouseLeave}
                    className={`relative flex min-h-[42px] items-center rounded-[7px] border-l-[3px] px-3 py-2 transition-all duration-200 group
                      ${
                        sidebarOpen || mobileOpen
                          ? "gap-3 justify-start"
                          : "justify-center"
                      }
                      ${
                        active
                          ? "border-[#BF9B53] bg-[#FBFAF7] text-[#BF9B53]"
                          : "border-transparent text-[#4B5563] hover:bg-[#FBFAF7] hover:text-[#111827]"
                      }
                    `}
                    title={sidebarOpen || mobileOpen ? "" : item.name}
                  >
                    {/* ================= ICON ================= */}
                    <div
                      className={`flex-shrink-0 transition-all duration-300 ${
                        active ? "text-[#BF9B53]" : "text-[#BF9B53]"
                      }`}
                    >
                      {item.icon}
                    </div>

                    {/* ================= TEXT ================= */}
                    {(sidebarOpen || mobileOpen) && (
                      <span className="text-[13px] font-medium">{item.name}</span>
                    )}

                    {/* ================= ACTIVE INDICATOR (COLLAPSED) ================= */}
                    {active && !sidebarOpen && !mobileOpen && (
                      <div className="absolute right-2 h-1.5 w-1.5 rounded-full bg-[#BF9B53]" />
                    )}
                  </NavLink>

                  {/* ================= SUBMENU ================= */}
                  {item.subPaths && (sidebarOpen || mobileOpen) && (
                    <div className="ml-8 mt-1 flex flex-col gap-1 pb-1">
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
                            className={`block px-3 py-1.5 text-[12px] font-medium transition-all duration-200
                            ${
                              subActive
                                ? "text-[#BF9B53] font-semibold"
                                : "text-[#4B5563] hover:text-[#111827]"
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
        <div
          ref={helpRef}
          className="relative flex-shrink-0 border-t border-gray-100 p-3"
        >
          <SidebarSupportPopup
            isOpen={helpOpen}
            onClose={() => setHelpOpen(false)}
            role="customer"
            sidebarOpen={sidebarOpen}
            mobileOpen={mobileOpen}
          />

          <button
            type="button"
            onClick={() => {
              setHoveredItem(null);
              setHelpOpen((current) => !current);
            }}
            className="group flex w-full items-center justify-center rounded-[7px] bg-[#F3F4F6] py-3 text-[#BF9B53] transition-all duration-200 hover:bg-[#FBFAF7]"
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
      {hoveredItem && !helpOpen && !sidebarOpen && !mobileOpen && (
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

export default CustomerSidebar;
