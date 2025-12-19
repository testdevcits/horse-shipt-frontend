import React, { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

import { LuArrowLeftFromLine, LuArrowRightFromLine } from "react-icons/lu";
import { CiCircleQuestion } from "react-icons/ci";

import { useAuth } from "../../contexts/AuthContext";

// COMMON ICONS
import {
  DashboardIcon,
  OrdersIcon,
  ProfileIcon,
  ChatIcon,
  SettingsIcon,
} from "../../components/common/ColoredIcons";

const navItems = [
  {
    name: "Dashboard",
    path: "/shipper/dashboard",
    icon: <DashboardIcon />,
  },
  {
    name: "Orders",
    path: "/shipper/orders",
    icon: <OrdersIcon />,
    subPaths: [
      { name: "Pending", path: "/shipper/orders/pending" },
      { name: "Completed", path: "/shipper/orders/completed" },
    ],
  },
  {
    name: "Profile",
    path: "/shipper/profile",
    icon: <ProfileIcon />,
  },
  {
    name: "Chat",
    path: "/shipper/chat", // no hardcoded shipment ID
    icon: <ChatIcon />,
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

  // Auto logout on token expiry
  useEffect(() => {
    if (!token) return;

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await logout();
          navigate("/login", { replace: true });
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [token, logout, navigate]);

  const isActivePath = (path, subPaths) => {
    if (window.location.pathname === path) return true;
    if (subPaths) {
      return subPaths.some((sub) => sub.path === window.location.pathname);
    }
    return false;
  };

  const sidebarWidth = mobileOpen
    ? "100%"
    : sidebarOpen && window.innerWidth >= 1024
    ? 256
    : 64;

  return (
    <div
      className={`fixed top-16 left-0 h-[calc(100%-64px)] bg-white shadow-lg z-50 transform transition-transform duration-300 font-montserrat
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      style={{ width: sidebarWidth }}
    >
      {/* Desktop Toggle */}
      <div className="flex justify-end p-4 hidden lg:flex">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? (
            <LuArrowLeftFromLine size={20} />
          ) : (
            <LuArrowRightFromLine size={20} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col mt-2 h-full overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const active = isActivePath(item.path, item.subPaths);

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => mobileOpen && setMobileOpen(false)}
                  className={`flex items-center px-2 py-4 rounded transition-colors duration-300 hover:bg-gray-100
                    ${
                      sidebarOpen || mobileOpen
                        ? "gap-6 justify-start"
                        : "justify-center"
                    }
                    ${
                      active
                        ? "bg-gray-100 font-semibold text-system-primary"
                        : ""
                    }
                  `}
                >
                  {item.icon}
                  {(sidebarOpen || mobileOpen) && <span>{item.name}</span>}
                </NavLink>

                {/* Sub Menu */}
                {item.subPaths && (sidebarOpen || mobileOpen) && (
                  <ul className="ml-8 mt-1 space-y-1">
                    {item.subPaths.map((sub) => {
                      const subActive = window.location.pathname === sub.path;

                      return (
                        <li key={sub.path}>
                          <NavLink
                            to={sub.path}
                            onClick={() => mobileOpen && setMobileOpen(false)}
                            className={`block px-2 py-2 rounded transition-colors duration-300 hover:bg-gray-100
                              ${
                                subActive
                                  ? "bg-gray-100 font-semibold text-system-primary"
                                  : ""
                              }
                            `}
                          >
                            {sub.name}
                          </NavLink>
                        </li>
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
      <div className="absolute bottom-4 w-full px-4">
        <button className="flex items-center justify-center w-full py-2 bg-gray-100 hover:bg-gray-200 text-system-primary rounded transition-all duration-300">
          <CiCircleQuestion size={20} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
