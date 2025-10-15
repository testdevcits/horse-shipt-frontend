import React from "react";
import { NavLink } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import { FaTachometerAlt, FaBoxOpen, FaUser } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

const navItems = [
  {
    name: "Dashboard",
    path: "/shipper/dashboard",
    icon: <FaTachometerAlt />,
  },
  {
    name: "Orders",
    path: "/shipper/orders",
    icon: <FaBoxOpen />,
    subPaths: [
      { name: "Pending", path: "/shipper/orders/pending" },
      { name: "Completed", path: "/shipper/orders/completed" },
    ],
  },
  {
    name: "Profile",
    path: "/shipper/profile",
    icon: <FaUser />,
  },
];

const Sidebar = ({ mobileOpen, setMobileOpen, isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "https://horse-shipt.vercel.app/api";

  const isActivePath = (path, subPaths) => {
    if (window.location.pathname === path) return true;
    if (subPaths)
      return subPaths.some((sub) => sub.path === window.location.pathname);
    return false;
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {
        role: user.role,
        userId: user._id,
      });
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      logout(); // clear auth context
      setMobileOpen(false); // close mobile sidebar
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 h-full bg-white shadow-lg transition-all duration-300
          md:relative md:top-0 md:left-0 md:h-auto md:shadow-none
          ${isOpen ? "w-64" : "w-16"}
          ${
            mobileOpen
              ? "translate-x-0 w-full"
              : "-translate-x-full md:translate-x-0"
          }
        `}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {/* Mobile Close Button */}
        <div className="flex justify-end p-4 md:hidden">
          <button onClick={() => setMobileOpen(false)}>
            <IoMdClose size={28} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-4 overflow-y-auto min-h-[calc(100vh-80px)]">
          <ul className="space-y-2 px-2">
            {navItems.map((item) => {
              const active = isActivePath(item.path, item.subPaths);
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => mobileOpen && setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 rounded transition-colors duration-300 hover:bg-gray-100 ${
                      active
                        ? "bg-gray-100 font-semibold text-system-primary"
                        : "text-gray-700"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {isOpen || mobileOpen ? <span>{item.name}</span> : null}
                  </NavLink>

                  {item.subPaths && (isOpen || mobileOpen) && (
                    <ul className="ml-8 mt-1 space-y-1">
                      {item.subPaths.map((sub) => {
                        const subActive = window.location.pathname === sub.path;
                        return (
                          <li key={sub.path}>
                            <NavLink
                              to={sub.path}
                              onClick={() => mobileOpen && setMobileOpen(false)}
                              className={`block px-4 py-2 rounded transition-colors duration-300 hover:bg-gray-100 ${
                                subActive
                                  ? "bg-gray-100 font-semibold text-system-primary"
                                  : "text-gray-700"
                              }`}
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

        {/* Logout Button */}
        <div className="absolute bottom-4 w-full px-4">
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-100 text-red-600 font-semibold rounded hover:bg-red-200"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
