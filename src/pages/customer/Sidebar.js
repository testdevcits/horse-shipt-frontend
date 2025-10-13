import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();
  const activeClass = "text-yellow-400 font-semibold";

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen p-4 flex flex-col">
      <h2 className="text-2xl font-bold mb-8">
        {user?.name || "Customer Menu"}
      </h2>
      <nav className="flex-1">
        <ul className="space-y-3">
          <li>
            <NavLink
              to="/customer/dashboard"
              className={({ isActive }) => (isActive ? activeClass : "")}
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/customer/orders"
              className={({ isActive }) => (isActive ? activeClass : "")}
            >
              Orders
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/customer/profile"
              className={({ isActive }) => (isActive ? activeClass : "")}
            >
              Profile
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/customer/settings"
              className={({ isActive }) => (isActive ? activeClass : "")}
            >
              Settings
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
