// src/components/common/CustomerSidebar.jsx
import React, { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

import { LuArrowLeftFromLine, LuArrowRightFromLine } from "react-icons/lu";
import { CiCircleQuestion } from "react-icons/ci";

import { useAuth } from "../../contexts/AuthContext";

// ICONS
import { FaTachometerAlt, FaBoxOpen, FaPlus, FaCog } from "react-icons/fa";

// ---------------- NAV ITEMS ----------------
const navItems = [
  { name: "Dashboard", path: "/customer/dashboard", icon: <FaTachometerAlt /> },
  {
    name: "Orders",
    path: "/customer/orders",
    icon: <FaBoxOpen />,
    subPaths: [
      { name: "Pending", path: "/customer/orders/pending" },
      { name: "Completed", path: "/customer/orders/completed" },
    ],
  },
  { name: "New Shipment", path: "/customer/new-shipment", icon: <FaPlus /> },
  { name: "Settings", path: "/customer/settings", icon: <FaCog /> },
];

const CustomerSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  mobileOpen,
  setMobileOpen,
}) => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // Auto logout on token expiry
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

  const isActivePath = (path, subPaths) => {
    if (window.location.pathname === path) return true;
    if (subPaths)
      return subPaths.some((sub) => sub.path === window.location.pathname);
    return false;
  };

  const sidebarWidth = mobileOpen
    ? "100%"
    : sidebarOpen && window.innerWidth >= 1024
    ? 256
    : 64;

  return (
    <div
      className={`fixed top-16 left-0 h-[calc(100%-64px)] bg-white shadow-lg z-50 transform transition-transform duration-300 font-montserrat flex flex-col
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      style={{ width: sidebarWidth }}
    >
      {/* Desktop Toggle */}
      <div className="flex justify-end p-4 hidden lg:flex">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? (
            <LuArrowLeftFromLine size={24} />
          ) : (
            <LuArrowRightFromLine size={24} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const active = isActivePath(item.path, item.subPaths);
            return (
              <li key={item.path}>
                {/* Main Menu */}
                <NavLink
                  to={item.path}
                  onClick={() => mobileOpen && setMobileOpen(false)}
                  className={`flex items-center transition-colors duration-300 px-2 py-4 rounded
                    ${
                      sidebarOpen || mobileOpen
                        ? "gap-6 justify-start"
                        : "justify-center"
                    }
                    ${
                      active
                        ? "bg-gray-100 font-semibold text-system-primary"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  {item.icon}
                  {(sidebarOpen || mobileOpen) && <span>{item.name}</span>}
                </NavLink>

                {/* Submenu */}
                {item.subPaths && (sidebarOpen || mobileOpen) && (
                  <ul className="ml-6 mt-1 border-l border-gray-200 pl-4 flex flex-col gap-1">
                    {item.subPaths.map((sub) => {
                      const subActive = window.location.pathname === sub.path;
                      return (
                        <NavLink
                          key={sub.path}
                          to={sub.path}
                          onClick={() => mobileOpen && setMobileOpen(false)}
                          className={`block px-2 py-1 rounded transition-colors duration-300 text-sm
                            ${
                              subActive
                                ? "bg-gray-100 font-medium text-system-primary"
                                : "text-gray-600 hover:bg-gray-50"
                            }
                          `}
                        >
                          {sub.name}
                        </NavLink>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Help Icon */}
      <div className="p-4 flex-shrink-0">
        <button className="flex items-center justify-center w-full py-2 bg-gray-100 hover:bg-gray-200 text-system-primary rounded transition-all duration-300">
          <CiCircleQuestion size={20} />
        </button>
      </div>
    </div>
  );
};

export default CustomerSidebar;
