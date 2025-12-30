import { FiHome, FiMessageSquare, FiTruck, FiUserCheck } from "react-icons/fi";
import { LuFilePenLine } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import { FaPlus } from "react-icons/fa"; // New shipment icon
import { FaBoxOpen, FaTachometerAlt, FaCog } from "react-icons/fa";

// Default color & size
const DEFAULT_COLOR = "text-[#BF9B53]";
const DEFAULT_SIZE = "text-lg";

// Shipper icons
export const DashboardIcon = ({
  className = "",
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
}) => <FiHome className={`${color} ${size} ${className}`} />;
export const OrdersIcon = ({
  className = "",
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
}) => <LuFilePenLine className={`${color} ${size} ${className}`} />;
export const ProfileIcon = ({
  className = "",
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
}) => <FiTruck className={`${color} ${size} ${className}`} />;
export const ChatIcon = ({
  className = "",
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
}) => <FiMessageSquare className={`${color} ${size} ${className}`} />;
export const SettingsIcon = ({
  className = "",
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
}) => <IoSettingsOutline className={`${color} ${size} ${className}`} />;
export const TruckDriverIcon = ({
  className = "",
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
}) => <FiUserCheck className={`${color} ${size} ${className}`} />;

// ------------------ Customer Sidebar Icons ------------------
export const CustomerDashboardIcon = ({
  className = "",
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
}) => <FaTachometerAlt className={`${color} ${size} ${className}`} />;
export const CustomerOrdersIcon = ({
  className = "",
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
}) => <FaBoxOpen className={`${color} ${size} ${className}`} />;
export const CustomerNewShipmentIcon = ({
  className = "",
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
}) => <FaPlus className={`${color} ${size} ${className}`} />;
export const CustomerSettingsIcon = ({
  className = "",
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
}) => <FaCog className={`${color} ${size} ${className}`} />;
