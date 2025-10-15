import React from "react";
import { NavLink } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import { LuArrowRightFromLine, LuArrowLeftFromLine } from "react-icons/lu";
import { CiCircleQuestion } from "react-icons/ci";
import { FaTachometerAlt, FaBoxOpen, FaUser, FaCog } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

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
  { name: "Profile", path: "/customer/profile", icon: <FaUser /> },
  { name: "Settings", path: "/customer/settings", icon: <FaCog /> },
];

const Sidebar = ({ mobileOpen, setMobileOpen, isOpen, setIsOpen }) => {
  const { user } = useAuth();

  const isActivePath = (path, subPaths) => {
    if (window.location.pathname === path) return true;
    if (subPaths)
      return subPaths.some((sub) => sub.path === window.location.pathname);
    return false;
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 h-full bg-gray-800 text-white shadow-lg transition-all duration-300
          md:relative md:h-auto md:shadow-none
          ${isOpen ? "w-64" : "w-16"}
          ${
            mobileOpen
              ? "translate-x-0 w-full"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* Profile Section */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700">
          <img
            src={user?.photo || "https://via.placeholder.com/40"}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          {isOpen || mobileOpen ? (
            <div className="flex flex-col">
              <span className="font-medium">{user?.name || "Customer"}</span>
              <span className="text-sm text-gray-300">
                {user?.role || "Customer"}
              </span>
            </div>
          ) : null}
        </div>

        {/* Top control buttons */}
        <div className="flex justify-between items-center p-4 md:justify-end">
          {mobileOpen && (
            <button onClick={() => setMobileOpen(false)} className="md:hidden">
              <IoMdClose size={28} />
            </button>
          )}
          {!mobileOpen && (
            <button onClick={() => setIsOpen(!isOpen)} className="ml-auto">
              {isOpen ? (
                <LuArrowLeftFromLine size={24} />
              ) : (
                <LuArrowRightFromLine size={24} />
              )}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-2 overflow-y-auto min-h-[calc(100vh-160px)]">
          <ul className="space-y-2 px-2">
            {navItems.map((item) => {
              const active = isActivePath(item.path, item.subPaths);
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => mobileOpen && setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 rounded transition-colors duration-300 hover:bg-gray-700 ${
                      active ? "bg-gray-700 font-semibold text-yellow-400" : ""
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
                              className={`block px-4 py-2 rounded transition-colors duration-300 hover:bg-gray-700 ${
                                subActive
                                  ? "bg-gray-700 font-semibold text-yellow-400"
                                  : ""
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

        {/* Bottom Question Icon */}
        <div className="absolute bottom-4 w-full px-4">
          <button
            className={`flex items-center justify-center w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-all duration-300`}
          >
            <CiCircleQuestion size={24} />
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
